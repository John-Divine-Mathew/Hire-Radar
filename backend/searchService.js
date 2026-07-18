const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const XLSX = require('xlsx');
const pool = require('./db');
const Tesseract = require('tesseract.js'); // Replaces Python Tesseract engine natively
const crypto = require('crypto');

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
      full_path TEXT NULL,
      file_hash TEXT NULL
    )
  `);

  await pool.query(`ALTER TABLE document_search_index ALTER COLUMN full_path DROP NOT NULL`).catch(() => {});
  await pool.query(`ALTER TABLE document_search_index ADD COLUMN IF NOT EXISTS file_hash TEXT`).catch(() => {});

  // NEW: raw bytes + mime type, so previews/downloads can serve the actual
  // uploaded file instead of only ever having extracted_text to fall back on.
  await pool.query(`ALTER TABLE document_search_index ADD COLUMN IF NOT EXISTS file_data BYTEA`).catch(() => {});
  await pool.query(`ALTER TABLE document_search_index ADD COLUMN IF NOT EXISTS mime_type TEXT`).catch(() => {});

  await pool.query(`
    CREATE INDEX IF NOT EXISTS document_search_index_hash_idx 
    ON document_search_index (file_hash)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS document_search_index_vector_idx 
    ON document_search_index USING GIN (search_vector)
  `);
}

function extractNlpEntities(text) {
  const entities = [];
  if (!text || !text.trim()) return entities;

  const seen = new Set();
  let match;

  // 1. Email Recognition
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  while ((match = emailRegex.exec(text)) !== null) {
    if (!seen.has(match[0])) {
      seen.add(match[0]);
      entities.push({ text: match[0], label: "EMAIL" });
    }
  }

  // 2. Phone Numbers Recognition
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
  while ((match = phoneRegex.exec(text)) !== null) {
    if (!seen.has(match[0])) {
      seen.add(match[0]);
      entities.push({ text: match[0], label: "PHONE" });
    }
  }

  // 3. Proper Nouns / Names / Places Identification (Capitalized word sequences)
  const nounRegex = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
  const stopWords = new Set(["The", "This", "That", "With", "From", "Then", "And", "For", "Your", "Have"]);
  while ((match = nounRegex.exec(text)) !== null) {
    const val = match[0].trim();
    if (val.length > 2 && !stopWords.has(val) && !seen.has(val)) {
      seen.add(val);
      entities.push({ text: val, label: "ORG/PERSON" });
    }
  }

  return entities.slice(0, 40); // Cap output collection size safely
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
    if (IMAGE_EXTENSIONS.has(extension)) {
      // Execute Node native server OCR pipelines
      const { data: { text } } = await Tesseract.recognize(buffer, 'eng');
      return text || '';
    }
  } catch (err) {
    console.error(`Error parsing document formats natively: ${err.message}`);
  }
  return '';
}

async function saveUploadedFile(fileMetadata) {
  const extension = getFileExtension(fileMetadata.originalname);
  if (!SUPPORTED_EXTENSIONS.has(extension)) {
    throw new Error(`Unsupported file type: ${extension}`);
  }

  const fileHash = crypto.createHash('sha256').update(fileMetadata.buffer).digest('hex');

  const existingDoc = await pool.query(
    'SELECT id, file_name, extension, file_size, uploaded_at, extracted_text, nlp_entities FROM document_search_index WHERE file_hash = $1',
    [fileHash]
  );
  if (existingDoc.rows.length > 0) {
    return { ...existingDoc.rows[0], isDuplicate: true };
  }

  const extractedText = await extractTextFromBuffer(extension, fileMetadata.buffer);
  const entities = extractNlpEntities(extractedText);

  const safeName = fileMetadata.originalname.replace(/[^a-zA-Z0-9. -]/g, ' ');
  const searchText = `${safeName} ${extractedText}`.trim();

  const result = await pool.query(
    `INSERT INTO document_search_index
       (file_name, extension, file_size, uploaded_at, extracted_text, search_vector, nlp_entities, full_path, file_hash, file_data, mime_type)
     VALUES ($1, $2, $3, NOW(), $4, to_tsvector('simple', $5), $6, NULL, $7, $8, $9)
     RETURNING id, file_name, extension, file_size, uploaded_at, extracted_text, nlp_entities`,
    [
      safeName, extension, fileMetadata.size, extractedText, searchText,
      JSON.stringify(entities), fileHash,
      fileMetadata.buffer,            // NEW: raw bytes
      fileMetadata.mimetype || null,  // NEW: multer gives us this for free
    ]
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
  initializeSearchService: ensureSchema,
  searchDocuments,
  listDocuments,
  saveUploadedFile,
  deleteDocument
};