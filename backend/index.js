const express = require('express');
const multer = require('multer');
const cors = require('cors');
const pool = require('./db');
const { Resend } = require("resend");
const { render } = require("@react-email/components");
const React = require("react");
const  {TestScheduledEmail}  =  require('./emails/template.tsx');

const {
    initializeSearchService,
    searchDocuments,
    listDocuments,
    saveUploadedFile,
    deleteDocument
} = require('./searchService');
 
const app = express();
import 'dotenv/config';
const resend = new Resend(process.env.resendApiKey);
 
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
 
// Initialize schema updates on boot (no directory creations)
initializeSearchService().catch((error) => console.error('Search service startup failed:', error.message));
 
// Configure multer to store uploaded files directly in memory buffers
const upload = multer({ storage: multer.memoryStorage() });
 
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
 
app.get("/hireRadar/cndtempsave", async (req, res) => {
    try {
        const allData = await pool.query("select * from cndtempsave");
        res.json(allData.rows);
    } catch (err) {
        console.error(err.message);
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

        // FIXED: Changed '=' to 'LIKE' with wildcard wrappers to allow partial match lookups
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
            const locationConditions = [];
            locationsArray.forEach(loc => {
                locationConditions.push(`LOWER(cndlocation) LIKE $${paramCounter}`);
                queryParams.push(`%${loc.toLowerCase().trim()}%`);
                paramCounter++;
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
        console.error("Backend filter processing error:", err.message);
        res.status(500).send("Server Error");
    }
});
 
app.get("/hireRadar/cndtempsave/:cndid", async (req, res) => {
    try {
        const { cndid } = req.params;
        const oneData = await pool.query("select * from cndtempsave where cndid = $1", [cndid]);
        res.json(oneData.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});
 
app.get("/hireRadar/cndpermsave", async (req, res) => {
    try {
        const allData = await pool.query("select * from cndpermsave");
        res.json(allData.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});
 
app.get("/hireRadar/cndpermsavesearch", async (req, res) => {
    try {
        const { search, experience, location, role, status, skills } = req.query;
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
            queryText += ` AND LOWER(cndrole) = $${paramCounter}`;
            queryParams.push(role.toLowerCase());
            paramCounter++;
        }
        if (status) {
            queryText += ` AND LOWER(cndstatus) = $${paramCounter}`;
            queryParams.push(status.toLowerCase());
            paramCounter++;
        }
 
        if (location) {
            const locationsArray = location.split(',');
            const locationConditions = [];
            locationsArray.forEach(loc => {
                locationConditions.push(`LOWER(cndlocation) = $${paramCounter}`);
                queryParams.push(loc.toLowerCase().trim());
                paramCounter++;
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
        const oneData = await pool.query("select * from cndpermsave where cndid = $1", [cndid]);
        res.json(oneData.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});
 
app.get("/hireRadar/cndpersonaldetails/:cndid", async (req, res) => {
    try {
        const { cndid } = req.params;
        const oneData = await pool.query("select * from cndpersonaldetails where cndid = $1", [cndid]);
        res.json(oneData.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});
 
app.get("/hireRadar/cndworkdetails/:cndid", async (req, res) => {
    try {
        const { cndid } = req.params;
        const oneData = await pool.query("select * from cndworkdetails where cndid = $1", [cndid]);
        res.json(oneData.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});
 
app.post("/hireRadar/insertCandidate", async (req, res) => {
    try {
        const { date, name, email, phone, age, gender, role, skills, texp, experience, location, status } = req.body;
        const newCndData = await pool.query("insert into cndpermsave(searchdate,cndname,cndemail,cndphone,cndage,cndgender,cndrole,cndskills,cndtotalexperience,cndexperience,cndlocation,cndstatus) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) returning *",
            [date, name, email, phone, age, gender, role, skills, texp, experience, location, status]);
        res.json(newCndData.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});
 
app.delete("/hireRadar/deleteCandidate/:cndid", async (req, res) => {
    try {
        const { cndid } = req.params;
        const deleteData = await pool.query("delete from cndpermsave where cndid = $1", [cndid]);
        return res.json({ success: true, deleted: deleteData.rowCount || 0 });
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ error: err.message });
    }
});
 
app.post("/hireRadar/insertTestDetails", async (req, res) => {
    try {
        const { cndid, username, password, starttime, endtime, email, name } = req.body;
        const newCndData = await pool.query("insert into testdetails(cndid, username, password, teststart, testend, personalemail, testdate, cndname) values($1, $2, $3, $4, $5, $6, $7, $8)", [ cndid, username, password, starttime, endtime, email, new Date(), name]);
        res.json(newCndData.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});
 
app.get("/hireRadar/getTestDetails", async (req, res) => {
    try {
        const allData = await pool.query("select * from testdetails");
        res.json(allData.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});
 
app.post("/hireRadar/updateTestDetails", async (req, res) => {
    try {
        const { cndid, name, phone } = req.body;
        const newCndData = await pool.query("update testdetails set cndname=$1, phone=$2 where cndid=$3 returning *", [name, phone, cndid]);
        res.json(newCndData.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});
 
app.get("/hireRadar/testquestions", async (req, res) => {
    try {
        const allData = await pool.query("select * from questions");
        res.json(allData.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});
 
app.get("/hireRadar/testquestions/:dept", async (req, res) => {
    try {
        const { dept } = req.params;
        const allData = await pool.query("select * from questions where lower(dept)=$1", [dept.toLowerCase().trim()]);
        res.json(allData.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});
 
app.post("/hireRadar/insertQuestions", async (req, res) => {
    try {
        const { dept, category, questiontype, question, option1, option2, option3, option4, answer } = req.body;
        const allData = await pool.query("insert into questions(dept, category, question, option1, option2, option3, option4, answer, questiontype) values($1, $2, $3, $4, $5, $6, $7, $8, $9) returning *", [dept, category, question, option1, option2, option3, option4, answer, questiontype]);
        res.json(allData.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});
 
app.delete("/hireRadar/deleteQuestion/:qno", async (req, res) => {
    try {
        const { qno } = req.params;
        const deleteData = await pool.query("delete from questions where qno = $1", [Number(qno)]);
        return res.json({ success: true, deleted: deleteData.rowCount || 0 });
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ error: err.message });
    }
});

app.post("/hireRadar/updateQuestion/:qno", async (req, res) => {
    try {
        const { qno } = req.params;
        const { dept, category, questiontype, question, option1, option2, option3, option4, answer } = req.body;
        const newCndData = await pool.query("update questions set dept=$1, category=$2, question=$3, option1=$4, option2=$5, option3=$6, option4=$7, answer=$8, questiontype=$9 where qno=$10 returning *", [dept, category, question, option1, option2, option3, option4, answer, questiontype, qno]);
        res.json(newCndData.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});

 
app.post("/hireRadar/setTestResult", async (req, res) => {
    try {
        const { result, cndid } = req.body;
        const newCndData = await pool.query("update testdetails set testresult=$1 where cndid=$2 returning *", [result, cndid]);
        res.json(newCndData.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});
 
app.get("/hireRadar/adminlogin", async (req, res) => {
    try {
        const allData = await pool.query(`select * from adminlogin`);
        res.json(allData.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});
 

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
 
// Single unified route receiving standard browser memory payloads
app.post('/api/upload', upload.any(), async (req, res) => {
    try {
        const filesCollection = req.files || (req.file ? [req.file] : []);
        
        if (filesCollection.length === 0) {
            return res.status(400).json({ error: 'No files were detected inside payload arrays.' });
        }
 
        // Process directly out of incoming in-memory stream buffers
        const uploadedDocuments =    await Promise.all(
            filesCollection.map(async (file) => {
                // Pass Multer memory file directly ({ originalname, buffer, size })
                return saveUploadedFile(file);
            })
        );
        res.status(200).json(uploadedDocuments);
    } catch (error) {
        console.error('Upload API unified processing error:', error.message);
        res.status(500).json({ error: 'Unable to complete uploading files stream.' });
    }
});
 
app.get('/api/status', (_req, res) => {
    res.json({ status: 'ok', service: 'document-search' });
});

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

// Serves the actual stored file bytes inline (used by the "Native View" preview pane).
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

// Downloads the actual stored file (not the extracted text).
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

//emails
app.post("/hireRadar/sendemail", async (req, res) => {
  try {

    const { candidateName, startTime, endTime, username, password, email } = req.body;
    // 1. Render the JavaScript React component into an HTML string
    const emailHtml = await render(
      React.createElement(TestScheduledEmail,{ 
        candidateName:candidateName, 
        dateString: new Date(startTime).toLocaleDateString(), 
        timeString: `${new Date(startTime).toLocaleTimeString()} – ${new Date(endTime).toLocaleTimeString()}`, 
        username:username, 
        password:password
    }));

    // 2. Send via Resend
    const { data, error } = await resend.emails.send({
      from: "Hirotec India <onboarding@resend.dev>",
      to: "vijayanandhaj@gmail.com",
      subject: `${candidateName}, your Test is Scheduled`,
      html: emailHtml, 
    });
    if(error){
        console.log(error.message);
    }

    res.status(200).json({ data });
    console.log('email Sent');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error rendering email" });
  }
});


 
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server has started on port ${PORT}`);
});