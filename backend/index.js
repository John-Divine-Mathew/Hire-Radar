const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const React = require('react');
const { Resend } = require('resend');
const { render } = require('@react-email/components');
const ReactDOM = require('react-dom/client');

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
            body: JSON.stringify({ model: "qwen2.5:7b-instruct-q4_K_M", keep_alive: "30m" })
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
        id: row.id || row.cndid,
        cndid: row.cndid,
        fileName: row.file_name || row.fileName,
        extension: row.extension,
        file_size: row.file_size || row.fileSize,
        uploadedAt: row.uploaded_at || row.uploadedAt,
        extractedText: row.extracted_text || row.extractedText,
        fileSizeLabel: formatFileSize(row.file_size || row.fileSize),
        nlpEntities: row.nlp_entities || [],
        username: row.username,
        documentStatus: row.document_status
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
// LOCAL TEXT EXTRACTION & OLLAMA INFERENCE 
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
            return fileBuffer.toString('utf-8');
        }
    } catch (err) {
        console.warn(`[Local Extract] Failed for ${originalName}:`, err.message);
        return fileBuffer.toString('utf-8'); 
    }
}

async function analyzeResumeWithOllama(rawText, fileName) {
    const safeFilename = fileName.replace(/\.[^/.]+$/, "");
    const fallbackData = {
        cndname: `Unknown Candidate - ${safeFilename}`,
        cndemail: `unknown@candidate.com`,
        cndphone: null,
        cndage: null,
        cndgender: 'N/A',
        cndrole: 'N/A',
        cndskills: 'N/A',
        cndtotalexperience: 'N/A',
        cndexperience: 0,
        cndlocation: 'N/A'
    };

    if (!rawText || !rawText.trim()) {
        console.warn(`[Warning] No text extracted. Using fallback.`);
        return fallbackData;
    }

    const sanitizedText = rawText.replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F]/g, '').trim();
    const truncatedText = sanitizedText.slice(0, 4000);

    const promptText = `You are an expert HR Data Extraction AI. Extract candidate data from the resume below.
    Return EXACTLY 10 data points in this strictly valid JSON structure. Do NOT use markdown or explain.
    
    STRICT JSON SCHEMA:
    {
      "cndname": "Extract candidate full name. If none found, write 'Unknown Candidate'",
      "cndemail": "Extract email. If none, write 'unknown@candidate.com'",
      "cndphone": "Extract purely numeric phone number without symbols, spaces or country codes. If none, write 'N/A'",
      "cndage": "Extract numeric age if present, else write 'N/A'",
      "cndgender": "Extract Male, Female, or N/A",
      "cndrole": "Extract primary job title or N/A",
      "cndskills": "Extract technical skills as a single comma-separated string, e.g. 'Java, React, SQL'",
      "cndtotalexperience": "Extract total experience as a string, e.g. '5 years, 2 months' or 'N/A'",
      "cndexperience": "Extract ONLY the integer value of total years of experience (e.g., 5). If none, output 0",
      "cndlocation": "Extract city, state, or country or N/A"
    }

    Resume Text to Extract From:
    -------------------------
    ${truncatedText}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120_000); 

    try {
        const response = await fetch("http://localhost:11434/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
                model: "qwen2.5:7b-instruct-q4_K_M",
                prompt: promptText,
                stream: false,
                format: "json",
                keep_alive: "30m",
                options: {
                    temperature: 0.1,
                    num_ctx: 2048,
                    num_predict: 512
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

                let safePhone = null;
                if (parsedData.cndphone && parsedData.cndphone !== 'N/A') {
                    const onlyNums = String(parsedData.cndphone).replace(/\D/g, '');
                    if (onlyNums.length > 0) safePhone = onlyNums.slice(0, 15); 
                }

                return {
                    cndname: (parsedData.cndname && !parsedData.cndname.includes("Extract")) ? parsedData.cndname : fallbackData.cndname,
                    cndemail: parsedData.cndemail || fallbackData.cndemail,
                    cndphone: safePhone,
                    cndage: !isNaN(parseInt(parsedData.cndage)) ? parseInt(parsedData.cndage) : null,
                    cndgender: parsedData.cndgender || 'N/A',
                    cndrole: parsedData.cndrole || 'N/A',
                    cndskills: Array.isArray(parsedData.cndskills) ? parsedData.cndskills.join(", ") : (parsedData.cndskills || 'N/A'),
                    cndtotalexperience: parsedData.cndtotalexperience || 'N/A',
                    cndexperience: !isNaN(parseInt(parsedData.cndexperience)) ? parseInt(parsedData.cndexperience) : 0,
                    cndlocation: parsedData.cndlocation || 'N/A'
                };
            } catch (parseErr) {
                console.error(`[Ollama JSON Parse Error] ${fileName}:`, parseErr.message);
                return fallbackData;
            }
        }
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            console.error(`[Ollama] Request timed out after 120s for ${fileName}`);
        } else {
            console.error(`[Ollama] Network/Extraction error for ${fileName}:`, error.message);
        }
    }

    return fallbackData;
}

app.post('/api/warm-ollama', async (req, res) => {
    try {
        const response = await fetch("http://localhost:11434/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ model: "qwen2.5:7b-instruct-q4_K_M", keep_alive: "30m" })
        });
        res.json({ warmed: response.ok });
    } catch (err) {
        res.status(500).json({ warmed: false, error: err.message });
    }
});

app.post('/api/upload', upload.any(), async (req, res) => {
    try {
        const filesCollection = req.files || (req.file ? [req.file] : []);

        if (filesCollection.length === 0) {
            return res.status(400).json({ error: 'No files were detected inside payload arrays.' });
        }

        // Extract uploaded username from request body (or fallback)
        const username = req.body.username || 'HR Admin';

        const uploadedDocuments = [];
        const skippedDuplicates = [];

        for (const file of filesCollection) {
            // Check for duplicate files based on filename and size
            const checkDuplicate = await pool.query(
                'SELECT cndid, file_name FROM document_search_index WHERE file_name = $1 AND file_size = $2',
                [file.originalname, file.size]
            );

            if (checkDuplicate.rows.length > 0) {
                console.warn(`[Skip] Duplicate detected: ${file.originalname} (${file.size} bytes)`);
                skippedDuplicates.push(file.originalname);
                continue; 
            }

            // 1. Local Text Extraction
            const extractedText = await extractTextLocally(file.buffer, file.originalname, file.mimetype);

            // 2. Run AI Parsing with Ollama
            console.log(`[AI] Processing ${file.originalname}...`);
            const aiData = await analyzeResumeWithOllama(extractedText, file.originalname);

            // 3. Insert Candidate Record into 'cndpermsave'
            const insertCandidateQuery = `
                INSERT INTO cndpermsave (
                    searchdate, cndname, cndemail, cndphone, cndage, cndgender,
                    cndrole, cndskills, cndtotalexperience, cndexperience, cndlocation,
                    teststatus, interviewstatus
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'NA', 'NA')
                RETURNING cndid;
            `;
            const cndValues = [
                new Date(), 
                aiData.cndname, 
                aiData.cndemail, 
                aiData.cndphone, 
                aiData.cndage,
                aiData.cndgender, 
                aiData.cndrole, 
                aiData.cndskills, 
                aiData.cndtotalexperience,
                aiData.cndexperience, 
                aiData.cndlocation
            ];
            
            const candidateRes = await pool.query(insertCandidateQuery, cndValues);
            const newCndId = candidateRes.rows[0].cndid;
            console.log(`✅ Candidate Created -> ID: ${newCndId}`);

            // 4. Insert Document into 'document_search_index'
            const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
            const insertDocQuery = `
                INSERT INTO document_search_index (
                    cndid, 
                    file_name, 
                    extension, 
                    file_size, 
                    uploaded_at, 
                    extracted_text, 
                    mime_type, 
                    file_data,
                    username,
                    document_status,
                    search_vector
                ) VALUES (
                    $1, $2, $3, $4, NOW(), $5, $6, $7, $8, $9, 
                    to_tsvector('simple', COALESCE($2, '') || ' ' || COALESCE($5, ''))
                )
                RETURNING cndid;
            `;
            const docValues = [
                newCndId, 
                file.originalname, 
                ext,
                file.size, 
                extractedText, 
                file.mimetype, 
                file.buffer,
                username,
                'Indexed' // Setting default document_status here
            ];

            const docRes = await pool.query(insertDocQuery, docValues);
            console.log(`✅ Document Stored in DB -> cndid: ${docRes.rows[0].cndid}`);

            // 5. NEW: Insert corresponding record into 'document_metadata'
            const insertMetadataQuery = `
                INSERT INTO document_metadata (
                    file_name, file_size, uploaded_at, document_status, username
                ) VALUES ($1, $2, NOW(), $3, $4)
            `;
            const metadataValues = [
                file.originalname,
                file.size,
                'Indexed', // Aligning with the document_status used above
                username
            ];
            
            await pool.query(insertMetadataQuery, metadataValues);
            console.log(`✅ Metadata Stored in DB for ${file.originalname}`);

            uploadedDocuments.push({
                id: docRes.rows[0].cndid,
                cndid: newCndId,
                fileName: file.originalname,
                extractedText: extractedText,
                username: username
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
        console.error('Upload API database insertion error:', error.message);
        res.status(500).json({ error: 'Unable to complete uploading files stream.' });
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

// CANDIDATE PERMANENT DATABASE ROUTES
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

// TESTS & ASSESSMENT ROUTES
app.post("/hireRadar/insertTestDetails", async (req, res) => {
    try {
        const { cndid, username, password, starttime, endtime, email, name, role } = req.body;
        const newCndData = await pool.query(
            "INSERT INTO testdetails(cndid, username, password, teststart, testend, personalemail, testdate, cndname, targetrole) VALUES($1, $2, $3, $4, $5, $6, $7, $8 ,$9) RETURNING *",
            [cndid, username, password, starttime, endtime, email, new Date(), name, role]
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

app.get("/hireRadar/testquestions/:role", async (req, res) => {
    try {
        const { role } = req.params;
        let queryRole = role.toLowerCase().trim();
        
        let difficulty = 'beginner'; // Default to beginner
        let baseDept = queryRole;

        // Parse the role to determine difficulty and the base department
        if (queryRole.startsWith('super senior ')) {
            difficulty = 'advanced';
            baseDept = queryRole.replace('super senior ', '').trim();
        } else if (queryRole.startsWith('senior ')) {
            difficulty = 'intermediate';
            baseDept = queryRole.replace('senior ', '').trim();
        }

        // Query the database using both the base department and the question type
        const allData = await pool.query(
            "SELECT * FROM questions WHERE LOWER(dept) = $1 AND LOWER(questiontype) = $2", 
            [baseDept, difficulty]
        );
        
        res.json(allData.rows);
    } catch (err) {
        console.error("testquestions/role error:", err.message);
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

app.get('/api/search', async (req, res) => {
    try {
        const q = `%${String(req.query.q || '').trim().toLowerCase()}%`;
        
        const queryText = `
            SELECT cndid, file_name, extension, file_size, uploaded_at, extracted_text, username, document_status 
            FROM document_search_index 
            WHERE LOWER(file_name) LIKE $1 OR LOWER(extracted_text) LIKE $1
            ORDER BY uploaded_at DESC
        `;
        
        const result = await pool.query(queryText, [q]);
        
        const docs = result.rows.map(row => ({
            id: row.cndid,
            cndid: row.cndid,
            fileName: row.file_name,
            extension: row.extension,
            sizeBytes: row.file_size,
            uploadedAt: row.uploaded_at,
            extractedText: row.extracted_text,
            username: row.username,
            documentStatus: row.document_status
        }));
        
        res.json(docs);
    } catch (error) {
        console.error('Search API error:', error);
        res.status(500).json({ error: `Backend DB Error: ${error.message}` });
    }
});


app.get('/api/documents', async (req, res) => {
    try {
        // Updated SELECT string to include username and document_status
        let queryText = 'SELECT cndid, file_name, extension, file_size, uploaded_at, extracted_text, username, document_status FROM document_search_index WHERE 1=1';
        let queryParams = [];
        let paramCounter = 1;

        // Apply Extension Filter
        if (req.query.extension) {
            queryText += ` AND LOWER(extension) = $${paramCounter}`;
            queryParams.push(req.query.extension.toLowerCase());
            paramCounter++;
        }

        // Apply Size Filter
        if (req.query.sizeFilter === 'small') {
            queryText += ` AND file_size < 1048576`; // < 1MB
        } else if (req.query.sizeFilter === 'medium') {
            queryText += ` AND file_size >= 1048576 AND file_size <= 10485760`; // 1MB - 10MB
        } else if (req.query.sizeFilter === 'large') {
            queryText += ` AND file_size > 10485760`; // > 10MB
        }

        // Apply Sorting
        if (req.query.sort === 'oldest') {
            queryText += ' ORDER BY uploaded_at ASC';
        } else {
            queryText += ' ORDER BY uploaded_at DESC'; // 'newest' default
        }

        const result = await pool.query(queryText, queryParams);

        // Map database columns to the exact keys the React frontend expects
        const docs = result.rows.map(row => ({
            id: row.cndid, 
            cndid: row.cndid,
            fileName: row.file_name,
            extension: row.extension,
            sizeBytes: row.file_size,
            uploadedAt: row.uploaded_at,
            extractedText: row.extracted_text,
            username: row.username,
            documentStatus: row.document_status
        }));

        res.json(docs);
    } catch (error) {
        console.error('Document listing crash:', error);
        res.status(500).json({ error: `Backend DB Error: ${error.message}` });
    }
});


app.get('/api/documents/:id/preview', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT file_data, mime_type, extension, file_name FROM document_search_index WHERE cndid = $1',
            [req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Document not found.' });
        
        const doc = result.rows[0];
        if (!doc.file_data) return res.status(404).json({ error: 'No stored file bytes for this document.' });

        const contentType = doc.mime_type || 'application/octet-stream';
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `inline; filename="${doc.file_name}"`);
        res.send(doc.file_data);
    } catch (error) {
        console.error('Preview API error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/documents/:id/download', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT file_data, mime_type, extension, file_name FROM document_search_index WHERE cndid = $1',
            [req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Document not found.' });
        
        const doc = result.rows[0];
        if (!doc.file_data) return res.status(404).json({ error: 'No stored file bytes for this document.' });

        const contentType = doc.mime_type || 'application/octet-stream';
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${doc.file_name}"`);
        res.send(doc.file_data);
    } catch (error) {
        console.error('Download API error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/documents/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM document_search_index WHERE cndid = $1', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Delete API error:', error);
        res.status(500).json({ error: error.message });
    }
});

// EMAIL & MANAGER REQUEST MANAGEMENT
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
            education, minimumpercentage,
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
                education, minimumpercentage, interviewprocess, 
                remarks, status
            ) 
            VALUES (
                $1, $2, $3, $4, $5, 
                $6, $7, $8, $9, $10, 
                $11, $12, $13, $14, $15, 
                $16, $17, $18, $19, $20
            ) 
            RETURNING *;
        `;

        const queryValues = [
            managerIdVal, managerName || null, managerEmail || null, department || null, jobTitle || null,
            targetDepartment || null, employmentType || 'Full Time', experience || null, parsedOpenings, parsedOpenings,
            location || null, targetJoiningDate, jobPriority || 'Medium', skills || null, responsibilities || null,
            education || null, minimumpercentage || null, interviewprocess || null,
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


app.delete("/hireRadar/managerrequest/:id", async (req, res) => {
    try {
        const { id } = req.params;
        
        // Execute delete query. 
        // Note: Change 'request_id' to match your exact primary key column name if different.
        const deleteData = await pool.query(
            "DELETE FROM manager_requests WHERE request_id = $1", 
            [id]
        );

        if (deleteData.rowCount === 0) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        res.json({ success: true, message: "Manager request deleted successfully." });
    } catch (err) {
        console.error("delete managerrequest error:", err.message);
        res.status(500).json({ error: "Server error during deletion." });
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



app.get('/api/dashboard-stats', async (req, res) => {
    try {
        // 1. Manifest Totals
        // Removed extracted_text condition as it is not in document_metadata
        const manifestQuery = `
            SELECT
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE document_status = 'Indexed') as parsed,
                COUNT(*) FILTER (WHERE document_status = 'Failed' OR document_status = 'Error') as failed,
                COUNT(*) FILTER (WHERE DATE(uploaded_at) = CURRENT_DATE) as today
            FROM document_metadata;
        `;

        // 2. Trend (Uploads over the last 6 months)
        const trendQuery = `
            SELECT
                TO_CHAR(DATE_TRUNC('month', uploaded_at), 'Mon') as month,
                COUNT(*) as value
            FROM document_metadata
            WHERE uploaded_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months'
            GROUP BY DATE_TRUNC('month', uploaded_at)
            ORDER BY DATE_TRUNC('month', uploaded_at) ASC;
        `;

        // 3. File Types Distribution
        // Uses regex to extract the extension from file_name (e.g., "resume.pdf" -> "PDF")
        const fileTypesQuery = `
            SELECT
                COALESCE(UPPER(SUBSTRING(file_name FROM '\\.([^\\.]+)$')), 'UNKNOWN') as label,
                COUNT(*) as count
            FROM document_metadata
            GROUP BY label
            ORDER BY count DESC
            LIMIT 5;
        `;

        // 4. Recent Activities (Logs)
        const logsQuery = `
            SELECT
                file_name,
                username,
                uploaded_at,
                document_status
            FROM document_metadata
            ORDER BY uploaded_at DESC
            LIMIT 5;
        `;

        const [manifestRes, trendRes, fileTypesRes, logsRes] = await Promise.all([
            pool.query(manifestQuery),
            pool.query(trendQuery),
            pool.query(fileTypesQuery),
            pool.query(logsQuery)
        ]);

        res.json({
            manifest: manifestRes.rows[0],
            trend: trendRes.rows,
            fileTypes: fileTypesRes.rows,
            logs: logsRes.rows
        });
    } catch (err) {
        console.error("Dashboard stats error:", err);
        res.status(500).json({ error: err.message });
    }
});


// LOCAL OLLAMA JOB DESCRIPTION GENERATOR
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
                model: "qwen2.5:7b-instruct-q4_K_M", 
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

const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// 1. Force the server to lock the event loop open (fixes Rogue Unref)
server.ref();

// 2. Catch silent failures (fixes Port Binding issues)
server.on('error', (err) => {
    console.error('\n[🚨 EXPRESS SERVER ERROR 🚨] Failed to start:', err.message);
});