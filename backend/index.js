const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const React = require('react');
const { Resend } = require('resend');
const { render } = require('@react-email/components');

// Local extraction tools
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const pool = require('./db');
const { TestScheduledEmail } = require('./emails/template.tsx');
const managerRequestRoutes = require('./routes/managerRequest');

const {
    initializeSearchService,
    searchDocuments,
    listDocuments,
    saveUploadedFile,
    deleteDocument
} = require('./searchService');

const app = express();

// ==========================================================================
// MIDDLEWARES & INITIALIZATION
// ==========================================================================

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const resend = new Resend(process.env.resendApiKey);

// Warm up Ollama model on boot so cold load latency is avoided
async function warmOllamaModel() {
    try {
        const response = await fetch("http://localhost:11434/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ model: "qwen3.6", keep_alive: "30m" })
        });
        if (response.ok) {
            console.log('[Ollama] Model preloaded and warm.');
        } else {
            console.warn('[Ollama] Preload request failed:', response.status);
        }
    } catch (err) {
        console.warn('[Ollama] Preload failed — is Ollama running?', err.message);
    }
}

// Initialize DB search schema and warm up model on server startup
initializeSearchService()
    .then(() => warmOllamaModel())
    .catch((error) =>
        console.error('Search service startup failed:', error.message)
    );

// Memory storage for incoming HTTP file uploads
const upload = multer({ storage: multer.memoryStorage() });

// ==========================================================================
// HELPER FUNCTIONS 
// ==========================================================================

function formatFileSize(bytes) {
    if (!bytes && bytes !== 0) return '0 Bytes';
    const units = ['Bytes', 'KB', 'MB', 'GB'];
    const size = bytes === 0 ? 0 : Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, size)).toFixed(size === 0 ? 0 : 1)} ${units[size]}`;
}

function normalizeDocument(row) {
    return {
        id: row.id,
        fileName: row.file_name || row.fileName,
        extension: row.extension,
        file_size: row.file_size || row.fileSize,
        uploadedAt: row.uploaded_at || row.uploadedAt,
        extractedText: row.extracted_text || row.extractedText,
        fileSizeLabel: formatFileSize(row.file_size || row.fileSize),
        nlpEntities: row.nlp_entities || []
    };
}

const MIME_BY_EXT = {
    '.pdf': 'application/pdf',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.doc': 'application/msword',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.xls': 'application/vnd.ms-excel',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.csv': 'text/csv',
    '.txt': 'text/plain',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.bmp': 'image/bmp',
    '.webp': 'image/webp',
};

// ==========================================================================
// LOCAL TEXT EXTRACTION SERVICE 
// ==========================================================================

async function extractTextLocally(fileBuffer, originalName, mimeType) {
    try {
        const ext = path.extname(originalName).toLowerCase();
        
        if (ext === '.pdf' || mimeType === 'application/pdf') {
            const data = await pdfParse(fileBuffer);
            return data.text;
        } else if (ext === '.docx') {
            const result = await mammoth.extractRawText({ buffer: fileBuffer });
            return result.value;
        } else {
            // Fallback for txt, csv, json
            return fileBuffer.toString('utf-8');
        }
    } catch (err) {
        console.warn(`[Local Extract] Failed for ${originalName}:`, err.message);
        return fileBuffer.toString('utf-8'); 
    }
}

async function analyzeResumeWithOllama(rawText, fileName) {
    const fallbackData = {
        name: 'Unknown Candidate',
        location: 'N/A',
        role: 'N/A',
        experience: 'N/A',
        saved_date: new Date().toISOString().split('T')[0],
        linkedin: 'N/A',
        skills: [],
        education: []
    };

    if (!rawText || !rawText.trim()) {
        console.warn(`[Warning] No text extracted. File might be a scanned image.`);
        return fallbackData;
    }

    const sanitizedText = rawText.replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F]/g, '').trim();
    const truncatedText = sanitizedText.slice(0, 4000);

    const promptText = `You are an expert HR Data Extraction AI. 
Extract candidate data from the resume text below. Return EXACTLY 8 data points in this strictly valid JSON structure. Do not use the file name as the candidate's name.

{
  "name": "Extract candidate full name",
  "location": "Extract current city, state, or country",
  "role": "Extract primary job title",
  "experience": "Extract total years experience",
  "saved_date": "${new Date().toISOString().split('T')[0]}",
  "linkedin": "Extract LinkedIn URL",
  "skills": ["List", "skills"],
  "education": ["List", "education"]
}

Resume Text to Extract From:
-------------------------
${truncatedText}`;

    // Extended safety timeout to 180s (3 mins) for CPU-heavy processing
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180_000); 

    try {
        const response = await fetch("http://localhost:11434/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
                model: "qwen3.6", // Or "qwen2.5:7b"
                prompt: promptText,
                stream: false,
                format: "json",
                think: false,
                keep_alive: "30m",
                options: {
                    temperature: 0.1,
                    num_ctx: 2048,     // Reduced from 8192 to save VRAM for layers
                    num_predict: 512   // Capped output tokens since JSON response is short
                }
            })
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            let rawContent = (data.response || '').trim();

            if (!rawContent) {
                console.warn(`[Ollama] Model returned empty response for ${fileName}`);
                return fallbackData;
            }

            try {
                const parsedData = JSON.parse(rawContent);

                return {
                    name: parsedData.name && !parsedData.name.includes("Extract") ? parsedData.name : fallbackData.name,
                    location: parsedData.location || fallbackData.location,
                    role: parsedData.role || fallbackData.role,
                    experience: parsedData.experience || fallbackData.experience,
                    saved_date: parsedData.saved_date || fallbackData.saved_date,
                    linkedin: parsedData.linkedin || fallbackData.linkedin,
                    skills: Array.isArray(parsedData.skills) ? parsedData.skills : fallbackData.skills,
                    education: Array.isArray(parsedData.education) ? parsedData.education : fallbackData.education
                };
            } catch (parseErr) {
                console.error(`[Ollama JSON Parse Error] ${fileName}:`, parseErr.message);
                return fallbackData;
            }
        }
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            console.error(`[Ollama Backend] Request timed out after 180s for ${fileName}`);
        } else {
            console.error(`[Ollama Backend] Network/Extraction error for ${fileName}:`, error.message);
        }
    }

    return fallbackData;
}

// Warm-up endpoint to allow clients to trigger preloading before batch uploads
app.post('/api/warm-ollama', async (req, res) => {
    try {
        const response = await fetch("http://localhost:11434/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ model: "qwen3.6", keep_alive: "30m" })
        });
        res.json({ warmed: response.ok });
    } catch (err) {
        res.status(500).json({ warmed: false, error: err.message });
    }
});

app.put("/hireRadar/updateCandidateStatus/:cndid", async (req, res) => {
  try {
    const { cndid } = req.params;
    const { teststatus, interviewstatus } = req.body;

    const updateQuery = await pool.query(
      `UPDATE cndpermsave 
       SET teststatus = $1, interviewstatus = $2 
       WHERE cndid = $3 
       RETURNING *`,
      [teststatus, interviewstatus, cndid]
    );

    if (updateQuery.rows.length === 0) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    res.json({
      message: "Candidate status updated successfully",
      candidate: updateQuery.rows[0]
    });
  } catch (err) {
    console.error("Error updating candidate status:", err.message);
    res.status(500).send("Server Error");
  }
});

app.get("/hireRadar/cndtempsave", async (req, res) => {
    try {
        const allData = await pool.query("SELECT * FROM cndtempsave");
        res.json(allData.rows);
    } catch (err) {
        console.error("cndtempsave fetch error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.get("/hireRadar/cndtempsavesearch", async (req, res) => {
    try {
        const { search, experience, location, role, status, skills } = req.query;
        let queryText = "SELECT * FROM cndtempsave WHERE 1=1";
        let queryParams = [];
        let paramCounter = 1;

        if (search) {
            queryText += ` AND LOWER(cndname) LIKE $${paramCounter}`;
            queryParams.push(`%${search.toLowerCase().trim()}%`);
            paramCounter++;
        }

        if (experience) {
            const cleanExp = experience.replace(' years', '').trim();
            if (cleanExp.includes('-')) {
                const [min, max] = cleanExp.split('-').map(Number);
                queryText += ` AND cndexperience >= $${paramCounter} AND cndexperience <= $${paramCounter + 1}`;
                queryParams.push(min, max);
                paramCounter += 2;
            } else if (cleanExp.includes('+')) {
                const min = Number(cleanExp.replace('+', ''));
                queryText += ` AND cndexperience >= $${paramCounter}`;
                queryParams.push(min);
                paramCounter++;
            } else if (!isNaN(cleanExp) && cleanExp !== '') {
                queryText += ` AND cndexperience = $${paramCounter}`;
                queryParams.push(Number(cleanExp));
                paramCounter++;
            }
        }

        if (role) {
            queryText += ` AND LOWER(cndrole) LIKE $${paramCounter}`;
            queryParams.push(`%${role.toLowerCase().trim()}%`);
            paramCounter++;
        }

        if (status) {
            queryText += ` AND LOWER(cndstatus) = $${paramCounter}`;
            queryParams.push(status.toLowerCase().trim());
            paramCounter++;
        }

        if (location) {
            const locationsArray = location.split(',');
            const locationConditions = locationsArray.map(loc => {
                queryParams.push(`%${loc.toLowerCase().trim()}%`);
                return `LOWER(cndlocation) LIKE $${paramCounter++}`;
            });
            if (locationConditions.length > 0) {
                queryText += ` AND (${locationConditions.join(' OR ')})`;
            }
        }

        if (skills) {
            const skillsArray = skills.split(',');
            skillsArray.forEach(skill => {
                queryText += ` AND LOWER(cndskills) LIKE $${paramCounter}`;
                queryParams.push(`%${skill.toLowerCase().trim()}%`);
                paramCounter++;
            });
        }

        const filteredData = await pool.query(queryText, queryParams);
        res.json(filteredData.rows);
    } catch (err) {
        console.error("Backend temp filter processing error:", err.message);
        res.status(500).send("Server Error");
    }
});

app.get("/hireRadar/cndtempsave/:cndid", async (req, res) => {
    try {
        const { cndid } = req.params;
        const oneData = await pool.query("SELECT * FROM cndtempsave WHERE cndid = $1", [cndid]);
        res.json(oneData.rows[0]);
    } catch (err) {
        console.error("cndtempsave ID fetch error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================================================
// CANDIDATE PERMANENT DATABASE ROUTES
// ==========================================================================

app.get("/hireRadar/cndpermsave", async (req, res) => {
    try {
        const allData = await pool.query("SELECT * FROM cndpermsave ORDER BY cndid ASC");
        res.json(allData.rows);
    } catch (err) {
        console.error("cndpermsave fetch error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.get("/hireRadar/cndpermsavepass", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM cndpermsave WHERE LOWER(teststatus)='pass' ORDER BY cndid ASC");
        res.json({ data: result.rows });
    } catch (err) {
        console.error("cndpermsavepass error:", err.message);
        res.status(500).json({ error: err.message, data: [] });
    }
});

app.get("/hireRadar/cndpermsavesearch", async (req, res) => {
    try {
        const { search, experience, location, role, status, teststatus, interviewstatus, skills } = req.query;
        let queryText = "SELECT * FROM cndpermsave WHERE 1=1";
        let queryParams = [];
        let paramCounter = 1;

        if (search) {
            queryText += ` AND LOWER(cndname) LIKE $${paramCounter}`;
            queryParams.push(`%${search.toLowerCase().trim()}%`);
            paramCounter++;
        }

        if (experience) {
            const cleanExp = experience.replace(' years', '').trim();
            if (cleanExp.includes('-')) {
                const [min, max] = cleanExp.split('-').map(Number);
                queryText += ` AND cndexperience >= $${paramCounter} AND cndexperience <= $${paramCounter + 1}`;
                queryParams.push(min, max);
                paramCounter += 2;
            } else if (cleanExp.includes('+')) {
                const min = Number(cleanExp.replace('+', ''));
                queryText += ` AND cndexperience >= $${paramCounter}`;
                queryParams.push(min);
                paramCounter++;
            } else if (!isNaN(cleanExp) && cleanExp !== '') {
                queryText += ` AND cndexperience = $${paramCounter}`;
                queryParams.push(Number(cleanExp));
                paramCounter++;
            }
        }

        if (role) {
            queryText += ` AND LOWER(cndrole) LIKE $${paramCounter}`;
            queryParams.push(`%${role.toLowerCase().trim()}%`);
            paramCounter++;
        }

        if (status) {
            queryText += ` AND (LOWER(teststatus) = $${paramCounter} OR LOWER(interviewstatus) = $${paramCounter})`;
            queryParams.push(status.toLowerCase().trim());
            paramCounter++;
        }

        if (teststatus) {
            queryText += ` AND LOWER(teststatus) = $${paramCounter}`;
            queryParams.push(teststatus.toLowerCase().trim());
            paramCounter++;
        }

        if (interviewstatus) {
            queryText += ` AND LOWER(interviewstatus) = $${paramCounter}`;
            queryParams.push(interviewstatus.toLowerCase().trim());
            paramCounter++;
        }

        if (location) {
            const locationsArray = location.split(',');
            const locationConditions = locationsArray.map(loc => {
                queryParams.push(`%${loc.toLowerCase().trim()}%`);
                return `LOWER(cndlocation) LIKE $${paramCounter++}`;
            });
            if (locationConditions.length > 0) {
                queryText += ` AND (${locationConditions.join(' OR ')})`;
            }
        }

        if (skills) {
            const skillsArray = skills.split(',');
            skillsArray.forEach(skill => {
                queryText += ` AND LOWER(cndskills) LIKE $${paramCounter}`;
                queryParams.push(`%${skill.toLowerCase().trim()}%`);
                paramCounter++;
            });
        }

        queryText += " ORDER BY cndid ASC";
        const filteredData = await pool.query(queryText, queryParams);
        res.json(filteredData.rows);
    } catch (err) {
        console.error("Backend permanent search filter error:", err.message);
        res.status(500).send("Server Error");
    }
});

app.get("/hireRadar/cndpermsave/:cndid", async (req, res) => {
    try {
        const { cndid } = req.params;
        const oneData = await pool.query("SELECT * FROM cndpermsave WHERE cndid = $1", [cndid]);
        res.json(oneData.rows[0]);
    } catch (err) {
        console.error("cndpermsave ID error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.get("/hireRadar/cndpersonaldetails/:cndid", async (req, res) => {
    try {
        const { cndid } = req.params;
        const oneData = await pool.query("SELECT * FROM cndpersonaldetails WHERE cndid = $1", [cndid]);
        res.json(oneData.rows[0]);
    } catch (err) {
        console.error("cndpersonaldetails error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.get("/hireRadar/cndworkdetails/:cndid", async (req, res) => {
    try {
        const { cndid } = req.params;
        const oneData = await pool.query("SELECT * FROM cndworkdetails WHERE cndid = $1", [cndid]);
        res.json(oneData.rows[0]);
    } catch (err) {
        console.error("cndworkdetails error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.post("/hireRadar/insertCandidate", async (req, res) => {
    try {
        const { date, name, email, phone, age, gender, role, skills, texp, experience, location, teststatus, interviewstatus } = req.body;
        const newCndData = await pool.query(
            `INSERT INTO cndpermsave(
                searchdate, cndname, cndemail, cndphone, cndage, cndgender,
                cndrole, cndskills, cndtotalexperience, cndexperience, cndlocation,
                teststatus, interviewstatus
            ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
            [
                date, name, email, phone, age, gender, role, skills,
                texp, experience, location,
                teststatus || 'NA', interviewstatus || 'NA'
            ]
        );
        res.json(newCndData.rows[0]);
    } catch (err) {
        console.error("insertCandidate error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.delete("/hireRadar/deleteCandidate/:cndid", async (req, res) => {
    try {
        const { cndid } = req.params;
        const deleteData = await pool.query("DELETE FROM cndpermsave WHERE cndid = $1", [cndid]);
        return res.json({ success: true, deleted: deleteData.rowCount || 0 });
    } catch (err) {
        console.error("deleteCandidate error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================================================
// TESTS & ASSESSMENT ROUTES
// ==========================================================================

app.post("/hireRadar/insertTestDetails", async (req, res) => {
    try {
        const { cndid, username, password, starttime, endtime, email, name } = req.body;
        const newCndData = await pool.query(
            "INSERT INTO testdetails(cndid, username, password, teststart, testend, personalemail, testdate, cndname) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
            [cndid, username, password, starttime, endtime, email, new Date(), name]
        );
        res.json(newCndData.rows[0]);
    } catch (err) {
        console.error("insertTestDetails error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.get("/hireRadar/getTestDetails", async (req, res) => {
    try {
        const allData = await pool.query("SELECT * FROM testdetails");
        res.json(allData.rows);
    } catch (err) {
        console.error("getTestDetails error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.post("/hireRadar/updateTestDetails", async (req, res) => {
    try {
        const { cndid, name, phone } = req.body;
        const newCndData = await pool.query(
            "UPDATE testdetails SET cndname=$1, phone=$2 WHERE cndid=$3 RETURNING *",
            [name, phone, cndid]
        );
        res.json(newCndData.rows[0]);
    } catch (err) {
        console.error("updateTestDetails error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.get("/hireRadar/testquestions", async (req, res) => {
    try {
        const allData = await pool.query("SELECT * FROM questions");
        res.json(allData.rows);
    } catch (err) {
        console.error("testquestions error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.get("/hireRadar/testquestions/:dept", async (req, res) => {
    try {
        const { dept } = req.params;
        const allData = await pool.query("SELECT * FROM questions WHERE LOWER(dept)=$1", [dept.toLowerCase().trim()]);
        res.json(allData.rows);
    } catch (err) {
        console.error("testquestions/dept error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.post("/hireRadar/insertQuestions", async (req, res) => {
    try {
        const { dept, category, questiontype, question, option1, option2, option3, option4, answer } = req.body;
        const allData = await pool.query(
            "INSERT INTO questions(dept, category, question, option1, option2, option3, option4, answer, questiontype) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
            [dept, category, question, option1, option2, option3, option4, answer, questiontype]
        );
        res.json(allData.rows);
    } catch (err) {
        console.error("insertQuestions error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.delete("/hireRadar/deleteQuestion/:qno", async (req, res) => {
    try {
        const { qno } = req.params;
        const deleteData = await pool.query("DELETE FROM questions WHERE qno = $1", [Number(qno)]);
        return res.json({ success: true, deleted: deleteData.rowCount || 0 });
    } catch (err) {
        console.error("deleteQuestion error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.post("/hireRadar/updateQuestion/:qno", async (req, res) => {
    try {
        const { qno } = req.params;
        const { dept, category, questiontype, question, option1, option2, option3, option4, answer } = req.body;
        const newCndData = await pool.query(
            "UPDATE questions SET dept=$1, category=$2, question=$3, option1=$4, option2=$5, option3=$6, option4=$7, answer=$8, questiontype=$9 WHERE qno=$10 RETURNING *",
            [dept, category, question, option1, option2, option3, option4, answer, questiontype, qno]
        );
        res.json(newCndData.rows[0]);
    } catch (err) {
        console.error("updateQuestion error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.post("/hireRadar/setTestResult", async (req, res) => {
    try {
        const { result, cndid, teststatus } = req.body;
        const newCndData = await pool.query("UPDATE testdetails SET testresult=$1 WHERE cndid=$2 RETURNING *", [result, cndid]);
        await pool.query("UPDATE cndpermsave SET teststatus=$1 WHERE cndid=$2", [teststatus, cndid]);
        res.json(newCndData.rows[0]);
    } catch (err) {
        console.error("setTestResult error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.get("/hireRadar/adminlogin", async (req, res) => {
    try {
        const allData = await pool.query(`SELECT * FROM adminlogin`);
        res.json(allData.rows);
    } catch (err) {
        console.error("adminlogin error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================================================
// DOCUMENT SEARCH, PREVIEW, DOWNLOAD & UPLOAD ENDPOINTS
// ==========================================================================

app.get('/api/search', async (req, res) => {
    try {
        const q = String(req.query.q || '').trim();
        const options = {
            extension: req.query.extension || '',
            sort: req.query.sort || 'relevance',
            sizeFilter: req.query.sizeFilter || '',
        };
        const rows = await searchDocuments(q, options);
        res.json(rows.map(normalizeDocument));
    } catch (error) {
        console.error('Search API error:', error.message);
        res.status(500).json({ error: 'Unable to search documents.' });
    }
});

app.get('/api/documents', async (req, res) => {
    try {
        const rows = await listDocuments({
            extension: req.query.extension || '',
            sort: req.query.sort || 'newest',
            sizeFilter: req.query.sizeFilter || '',
        });
        res.json(rows.map(normalizeDocument));
    } catch (error) {
        console.error('Document listing error:', error.message);
        res.status(500).json({ error: 'Unable to load documents.' });
    }
});

app.post('/api/upload', upload.any(), async (req, res) => {
    try {
        const filesCollection = req.files || (req.file ? [req.file] : []);

        if (filesCollection.length === 0) {
            return res.status(400).json({ error: 'No files were detected inside payload arrays.' });
        }

        const uploadedDocuments = [];
        const skippedDuplicates = [];

        for (const file of filesCollection) {
            // Check database for existing file with matching name and size
            const checkDuplicate = await pool.query(
                'SELECT id, file_name FROM document_search_index WHERE file_name = $1 AND file_size = $2',
                [file.originalname, file.size]
            );

            if (checkDuplicate.rows.length > 0) {
                console.warn(`[Upload Skip] Duplicate detected: ${file.originalname} (${file.size} bytes)`);
                skippedDuplicates.push(file.originalname);
                continue; // Skip processing duplicate
            }

            // Extract text locally
            const extractedText = await extractTextLocally(file.buffer, file.originalname, file.mimetype);

            // Save to PostgreSQL document_search_index
            const savedDoc = await saveUploadedFile({
                ...file,
                extractedText: extractedText
            });

            uploadedDocuments.push({
                ...savedDoc,
                fileName: file.originalname,
                extractedText: extractedText
            });
        }

        if (uploadedDocuments.length === 0 && skippedDuplicates.length > 0) {
            return res.status(409).json({
                message: 'All uploaded files were identified as duplicates and skipped.',
                skipped: skippedDuplicates
            });
        }

        res.status(200).json(uploadedDocuments);
    } catch (error) {
        console.error('Upload API unified processing error:', error.message);
        res.status(500).json({ error: 'Unable to complete uploading files stream.' });
    }
});

app.post('/api/analyze-resume', async (req, res) => {
    try {
        const { rawText, fileName } = req.body;
        const metadata = await analyzeResumeWithOllama(rawText, fileName);

        // Map extracted metadata to cndpermsave schema
        const candidateName = metadata.name && metadata.name !== 'Unknown Candidate' 
            ? metadata.name 
            : fileName.replace(/\.[^/.]+$/, ""); // Fallback to filename without extension
        
        const candidateEmail = metadata.email || `${candidateName.toLowerCase().replace(/[^a-z0-9]/g, '')}@noemail.com`;
        const skillsString = Array.isArray(metadata.skills) ? metadata.skills.join(', ') : (metadata.skills || 'N/A');
        
        // Extract numeric years of experience for the integer column 'cndexperience'
        const expMatch = String(metadata.experience || '').match(/\d+/);
        const parsedExp = expMatch ? parseInt(expMatch[0], 10) : 0;

        // Insert record into cndpermsave
        const insertQuery = `
            INSERT INTO cndpermsave (
                searchdate,
                cndname,
                cndemail,
                cndrole,
                cndskills,
                cndtotalexperience,
                cndexperience,
                cndlocation,
                teststatus,
                interviewstatus
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *;
        `;

        const queryValues = [
            metadata.saved_date || new Date().toISOString().split('T')[0],
            candidateName,
            candidateEmail,
            metadata.role || 'N/A',
            skillsString,
            metadata.experience || 'N/A',
            parsedExp,
            metadata.location || 'N/A',
            'NA',
            'NA'
        ];

        const insertedCandidate = await pool.query(insertQuery, queryValues);
        console.log(`✅ Candidate inserted into cndpermsave: ${candidateName} (ID: ${insertedCandidate.rows[0].cndid})`);

        res.status(200).json({
            metadata,
            savedCandidate: insertedCandidate.rows[0]
        });
    } catch (error) {
        console.error('Analyze & Insert API error:', error.message);
        res.status(500).json({ error: 'Unable to analyze document text or save candidate record.' });
    }
});

app.get('/api/status', (_req, res) => {
    res.json({ status: 'ok', service: 'document-search' });
});

app.get('/api/documents/:id/preview', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT file_data, mime_type, extension, file_name FROM document_search_index WHERE id = $1',
            [req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Document not found.' });
        const doc = result.rows[0];
        if (!doc.file_data) return res.status(404).json({ error: 'No stored file bytes for this document.' });

        const contentType = doc.mime_type || MIME_BY_EXT[doc.extension] || 'application/octet-stream';
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `inline; filename="${doc.file_name}"`);
        res.send(doc.file_data);
    } catch (error) {
        console.error('Preview API error:', error.message);
        res.status(500).json({ error: 'Unable to preview document.' });
    }
});

app.get('/api/documents/:id/download', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT file_data, mime_type, extension, file_name FROM document_search_index WHERE id = $1',
            [req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Document not found.' });
        const doc = result.rows[0];
        if (!doc.file_data) return res.status(404).json({ error: 'No stored file bytes for this document.' });

        const contentType = doc.mime_type || MIME_BY_EXT[doc.extension] || 'application/octet-stream';
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${doc.file_name}"`);
        res.send(doc.file_data);
    } catch (error) {
        console.error('Download API error:', error.message);
        res.status(500).json({ error: 'Unable to download document.' });
    }
});

app.delete('/api/documents/:id', async (req, res) => {
    try {
        const success = await deleteDocument(req.params.id);
        res.json({ success });
    } catch (error) {
        console.error('Delete API error:', error.message);
        res.status(500).json({ error: 'Unable to delete document index.' });
    }
});

// ==========================================================================
// EMAIL & MANAGER REQUEST MANAGEMENT
// ==========================================================================

app.post("/hireRadar/sendemail", async (req, res) => {
    try {
        const { candidateName, startTime, endTime, username, password, email } = req.body;
        const emailHtml = await render(
            React.createElement(TestScheduledEmail, { 
                candidateName: candidateName, 
                dateString: new Date(startTime).toLocaleDateString(), 
                timeString: `${new Date(startTime).toLocaleTimeString()} – ${new Date(endTime).toLocaleTimeString()}`, 
                username: username, 
                password: password
            })
        );

        const { data, error } = await resend.emails.send({
            from: "Hirotec India <onboarding@resend.dev>",
            to: "vijayanandhaj@gmail.com",
            subject: `${candidateName}, your Test is Scheduled`,
            html: emailHtml, 
        });
        console.log('email sent');
        if (error) console.error("Resend error:", error.message);
        res.status(200).json({ data });
    } catch (err) {
        console.error("sendemail error:", err);
        res.status(500).json({ error: "Internal server error rendering email" });
    }
});

app.get("/hireRadar/managerlogin", async (req, res) => {
    try {
        const data = await pool.query("SELECT * FROM managerlogin ORDER BY managerid ASC");
        res.json(data.rows);
    } catch (err) {
        console.error("managerlogin fetch error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.post("/hireRadar/managerlogin", async (req, res) => {
    try {
        const { fullname, email, password, department, designation } = req.body;
        const data = await pool.query(
            `INSERT INTO managerlogin (fullname, email, password, department, designation)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [fullname, email, password, department, designation]
        );
        res.json(data.rows[0]);
    } catch (err) {
        console.error("managerlogin insert error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.post("/hireRadar/managerrequest", async (req, res) => {
    try {
        const {
            managerid, managerName, managerEmail, department, jobTitle,
            targetDepartment, employmentType, experience, openings,
            location, joiningDate, jobPriority, skills, responsibilities,
            education, minimumpercentage, salarymin, salarymax,
            interviewprocess, remarks
        } = req.body;

        const parsedOpenings = openings ? parseInt(openings, 10) : 1;
        const managerIdVal = managerid ? parseInt(managerid, 10) : null;
        const minSalary = (salarymin !== "" && salarymin !== null && !isNaN(salarymin)) ? parseInt(salarymin, 10) : null;
        const maxSalary = (salarymax !== "" && salarymax !== null && !isNaN(salarymax)) ? parseInt(salarymax, 10) : null;
        const targetJoiningDate = joiningDate && joiningDate !== "" ? joiningDate : null;

        const queryText = `
            INSERT INTO manager_requests (
                managerid, manager_name, manager_email, department, job_title, 
                target_department, employment_type, experience, vacancies, openings, 
                location, joining_date, priority, skills, jobdescription, 
                education, minimumpercentage, salary_min, salary_max, interviewprocess, 
                remarks, status
            ) 
            VALUES (
                $1, $2, $3, $4, $5, 
                $6, $7, $8, $9, $10, 
                $11, $12, $13, $14, $15, 
                $16, $17, $18, $19, $20, 
                $21, $22
            ) 
            RETURNING *;
        `;

        const queryValues = [
            managerIdVal, managerName || null, managerEmail || null, department || null, jobTitle || null,
            targetDepartment || null, employmentType || 'Full Time', experience || null, parsedOpenings, parsedOpenings,
            location || null, targetJoiningDate, jobPriority || 'Medium', skills || null, responsibilities || null,
            education || null, minimumpercentage || null, minSalary, maxSalary, interviewprocess || null,
            remarks || null, 'Pending'
        ];

        const data = await pool.query(queryText, queryValues);
        res.status(201).json(data.rows[0]);
    } catch (err) {
        console.error("Manager request submission error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.get("/hireRadar/managerrequest", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                r.request_id, r.managerid, r.manager_name, r.manager_email,
                r.department, r.target_department, r.job_title, r.experience,
                r.salary_min, r.salary_max, r.openings, r.vacancies, r.status,
                r.created_at, m.designation
            FROM manager_requests r
            LEFT JOIN managerlogin m ON r.managerid = m.managerid
            ORDER BY r.request_id DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error("Fetch requests error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.get("/hireRadar/managerrequest/:managerid", async (req, res) => {
    try {
        const { managerid } = req.params;
        const parsedManagerId = parseInt(managerid, 10);

        if (isNaN(parsedManagerId)) {
            return res.status(400).json({ error: "Invalid Manager ID" });
        }

        const data = await pool.query(
            "SELECT * FROM manager_requests WHERE managerid = $1 ORDER BY request_id DESC",
            [parsedManagerId]
        );
        res.json(data.rows);
    } catch (err) {
        console.error("Fetch manager request error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.put("/hireRadar/managerrequeststatus/:requestid", async (req, res) => {
    try {
        const { requestid } = req.params;
        const { status } = req.body;
        const parsedRequestId = parseInt(requestid, 10);

        if (isNaN(parsedRequestId)) {
            return res.status(400).json({ error: "Invalid Request ID" });
        }

        const data = await pool.query(
            "UPDATE manager_requests SET status = $1 WHERE request_id = $2 RETURNING *",
            [status, parsedRequestId]
        );

        if (data.rows.length === 0) {
            return res.status(404).json({ error: "Request not found" });
        }
        res.json(data.rows[0]);
    } catch (err) {
        console.error("Update request status error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================================================
// LOCAL OLLAMA JOB DESCRIPTION GENERATOR
// ==========================================================================

app.post("/hireRadar/generate-jd", async (req, res) => {
    const { jobTitle, department, experience, keySkills } = req.body;

    if (!jobTitle) {
        return res.status(400).json({ error: "Job title is required." });
    }

    const fallbackJD = {
        roleSummary: `We are seeking a qualified ${jobTitle} to join our ${department || "Engineering"} team. You will play a key role in delivering operational excellence and driving performance goals.`,
        keyResponsibilities: [
            `Design and implement standard processes for ${jobTitle}.`,
            "Collaborate with engineering and operational teams.",
            "Identify bottlenecks and optimize core technical workflows."
        ],
        requiredSkills: keySkills ? keySkills.split(",").map(s => s.trim()) : [
            "Technical Problem Solving",
            "Process Optimization",
            "Cross-Functional Leadership",
            "Communication"
        ],
        experience: experience || "3-5 years",
        suggestedSalaryRange: "₹8,00,000 - ₹12,00,000 per annum"
    };

    try {
        const promptText = `
You are an expert HR Specialist. Generate a detailed and professional Job Description (JD) in valid JSON format based on these parameters:
- Job Title: ${jobTitle}
- Department: ${department || "Engineering / Technology"}
- Experience Level: ${experience || "3-5 years"}
- Key Skills/Responsibilities: ${keySkills || "Standard domain skills"}

Respond ONLY with a raw, valid JSON object strictly matching this schema, without any extra text or commentary:
{
  "roleSummary": "Brief overview of the role...",
  "keyResponsibilities": ["Responsibility 1", "Responsibility 2", "Responsibility 3"],
  "requiredSkills": ["Skill 1", "Skill 2", "Skill 3"],
  "experience": "${experience || "3-5 years"}",
  "suggestedSalaryRange": "₹8,00,000 - ₹12,00,000 per annum"
}
`;

        const response = await fetch("http://localhost:11434/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "qwen3.6", 
                prompt: promptText,
                stream: false,
                format: "json",
                keep_alive: "30m",
                options: { temperature: 0.3 }
            })
        });

        if (response.ok) {
            const data = await response.json();
            let rawContent = data.response || "";
            rawContent = rawContent.replace(/```json/g, "").replace(/```/g, "").trim();

            const jdData = JSON.parse(rawContent);
            return res.status(200).json(jdData);
        } else {
            console.warn("⚠️ Ollama Local API Response Error:", response.statusText);
        }
    } catch (err) {
        console.error("⚠️ Ollama Local JD generation error:", err.message);
    }

    return res.status(200).json(fallbackJD);
});

app.use("/hireRadar/managerrequest", managerRequestRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});