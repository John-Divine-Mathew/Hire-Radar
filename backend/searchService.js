const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const XLSX = require('xlsx');
const pool = require('./db');
const fetch = require('node-fetch'); // Resolves the 'fetch is not a function' runtime crash
const FormData = require('form-data');

const SUPPORTED_EXTENSIONS = new Set([
  '.pdf', '.docx', '.xlsx', '.xls', '.txt', '.csv', '.json', '.pptx',
  '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp',
]);

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp']);

function escapeForTsQuery(value) {
  return String(value || '')
    .replace(/['":&|!()-+]/g, ' ')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getFileExtension(fileName) {
  return path.extname(fileName).toLowerCase();
}

async function ensureSchema() {
  // Alter schema to create columns or alter existing tables gracefully if present
  await pool.query(`
    CREATE TABLE IF NOT EXISTS document_search_index (
      id SERIAL PRIMARY KEY,
      file_name TEXT NOT NULL,
      extension TEXT NOT NULL,
      file_size BIGINT NOT NULL DEFAULT 0,
      uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      extracted_text TEXT DEFAULT '',
      search_vector TSVECTOR,
      nlp_entities JSONB DEFAULT '[]'::jsonb,
      full_path TEXT NULL
    )
  `);

  // Explicit dynamic structural patch safeguarding old versions from throwing null constraints
  await pool.query(`
    ALTER TABLE document_search_index ALTER COLUMN full_path DROP NOT NULL
  `).catch(() => { /* Column was dropped or altered previously */ });

  await pool.query(`
    CREATE INDEX IF NOT EXISTS document_search_index_vector_idx 
    ON document_search_index USING GIN (search_vector)
  `);
}

// Pipe pure memory structures seamlessly down to Python Flask microservice hooks
async function enrichWithPythonBackend(fileName, buffer, textContent = '') {
  try {
    const form = new FormData();
    form.append('text_content', textContent);
    if (buffer) {
      form.append('file', buffer, { filename: fileName });
    }

    const response = await fetch('http://localhost:5001/analyze-stream', {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.error(`Python microservice communication error: ${err.message}`);
  }
  return { success: false, entities: [], extracted_text: textContent };
}

async function extractTextFromBuffer(extension, buffer) {
  try {
    if (extension === '.pdf') {
      const data = await pdfParse(buffer);
      return data.text;
    }
    if (extension === '.docx') {
      const result = await mammoth.extractRawText({ buffer: buffer });
      return result.value;
    }
    if (['.xlsx', '.xls'].includes(extension)) {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      let text = '';
      workbook.SheetNames.forEach(sheet => {
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheet], { header: 1 });
        text += JSON.stringify(rows) + ' ';
      });
      return text;
    }
    if (['.txt', '.csv', '.json'].includes(extension)) {
      return buffer.toString('utf8');
    }
  } catch (err) {
    console.error(`Error parsing document formats from buffer: ${err.message}`);
  }
  return '';
}

async function saveUploadedFile(fileMetadata) {
  const extension = getFileExtension(fileMetadata.originalname);
  if (!SUPPORTED_EXTENSIONS.has(extension)) {
    throw new Error(`Unsupported file type: ${extension}`);
  }

  let extractedText = '';
  let entities = [];

  if (IMAGE_EXTENSIONS.has(extension)) {
    const pyResult = await enrichWithPythonBackend(fileMetadata.originalname, fileMetadata.buffer, '');
    if (pyResult.success) {
      extractedText = pyResult.extracted_text || '';
      entities = pyResult.entities || [];
    }
  } else {
    extractedText = await extractTextFromBuffer(extension, fileMetadata.buffer);
    const pyResult = await enrichWithPythonBackend(fileMetadata.originalname, fileMetadata.buffer, extractedText);
    if (pyResult.success) {
      entities = pyResult.entities || [];
    }
  }

  const safeName = fileMetadata.originalname.replace(/[^a-zA-Z0-9. -]/g, ' ');
  const searchText = `${safeName} ${extractedText}`.trim();

  // full_path column explicitly provided as null to preserve structural schema compatibility
  const result = await pool.query(
    `INSERT INTO document_search_index (file_name, extension, file_size, uploaded_at, extracted_text, search_vector, nlp_entities, full_path)
     VALUES ($1, $2, $3, NOW(), $4, to_tsvector('simple', $5), $6, NULL)
     RETURNING id, file_name, extension, file_size, uploaded_at, extracted_text, nlp_entities`,
    [safeName, extension, fileMetadata.size, extractedText, searchText, JSON.stringify(entities)]
  );

  return result.rows[0];
}

async function listDocuments(options = {}) {
  const { sort = 'newest', sizeFilter } = options;
  let query = 'SELECT id, file_name, extension, file_size, uploaded_at, extracted_text, nlp_entities FROM document_search_index WHERE 1=1';
  const values = [];
  let index = 1;

  if (sizeFilter) {
    if (sizeFilter === 'small') {
      query += ` AND file_size < $${index}`;
      values.push(1024 * 1024);
      index += 1;
    } else if (sizeFilter === 'medium') {
      query += ` AND file_size >= $${index} AND file_size < $${index + 1}`;
      values.push(1024 * 1024, 10 * 1024 * 1024);
      index += 2;
    } else if (sizeFilter === 'large') {
      query += ` AND file_size >= $${index}`;
      values.push(10 * 1024 * 1024);
      index += 1;
    }
  }

  query += ` ORDER BY uploaded_at ${sort === 'oldest' ? 'ASC' : 'DESC'}`;
  const result = await pool.query(query, values);
  return result.rows;
}

async function searchDocuments(queryText, options = {}) {
  const sanitizedQuery = escapeForTsQuery(queryText || '').trim();
  const { sort = 'relevance', sizeFilter } = options;

  if (!sanitizedQuery) {
    return listDocuments({ sort, sizeFilter });
  }

  const values = [sanitizedQuery];
  let query = `
    SELECT id, file_name, extension, file_size, uploaded_at, extracted_text, nlp_entities,
           ts_rank(search_vector, websearch_to_tsquery('simple', $1)) AS rank 
    FROM document_search_index 
    WHERE 1=1
  `;

  query += sort === 'oldest' ? ' ORDER BY uploaded_at ASC' : ' ORDER BY rank DESC, uploaded_at DESC';
  const result = await pool.query(query, values);
  return result.rows;
}

async function deleteDocument(documentId) {
  const result = await pool.query('DELETE FROM document_search_index WHERE id = $1 RETURNING id', [documentId]);
  return result.rows.length > 0;
}

module.exports = {
  initializeSearchService: ensureSchema, // Clean initialization handle exported smoothly
  searchDocuments,
  listDocuments,
  saveUploadedFile,
  deleteDocument
};