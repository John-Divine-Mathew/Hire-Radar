const express = require('express');
const multer = require('multer');
const cors = require('cors');
const pool = require('./db');
const { 
    initializeSearchService, 
    searchDocuments, 
    listDocuments, 
    saveUploadedFile, 
    deleteDocument 
} = require('./searchService');

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize schema updates on boot gracefully
initializeSearchService().catch((error) => console.error('Search service startup failed:', error.message));

// Configure multer memory stream standard engine configuration
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

/* ==========================================================================
   CANDIDATES & RECRUITING ENDPOINTS
   ========================================================================== */

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
            box = locationsArray.forEach(loc => {
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

app.get("/hireRadar/testquestions", async (req, res) => {
    try {
        const allData = await pool.query("select * from questions");
        res.json(allData.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});

/* ==========================================================================
   WORKSPACE DOCUMENT STORAGE & SEARCH ENDPOINTS
   ========================================================================== */

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

        const uploadedDocuments = await Promise.all(
            filesCollection.map(async (file) => {
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

app.get('/api/documents/:id/preview', async (req, res) => {
    try {
        const result = await pool.query('SELECT extracted_text, file_name FROM document_search_index WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Document not found.' });
        }
        const document = result.rows[0];
        
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `inline; filename="${document.file_name}.txt"`);
        res.send(document.extracted_text || 'No previewable text contents extracted.');
    } catch (error) {
        console.error('Preview API error:', error.message);
        res.status(500).json({ error: 'Unable to preview document.' });
    }
});

app.get('/api/documents/:id/download', async (req, res) => {
    try {
        const result = await pool.query('SELECT extracted_text, file_name FROM document_search_index WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Document not found.' });
        }
        const document = result.rows[0];
        
        res.setHeader('Content-Disposition', `attachment; filename="INDEXED-${document.file_name}.txt"`);
        res.setHeader('Content-Type', 'text/plain');
        res.send(document.extracted_text || '');
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server has started on port ${PORT}`);
});