const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const XLSX = require('xlsx');
const pool = require('./db');
const fetchModule = require('node-fetch');
const fetch = typeof fetchModule === 'function' ? fetchModule : fetchModule.default || fetchModule;

const UPLOAD_DIR = path.join(__dirname, 'uploads');

// Supported extensions (Removed '.zip')
const SUPPORTED_EXTENSIONS = new Set([
  '.pdf', '.docx', '.xlsx', '.xls', '.txt', '.csv', '.json', '.pptx',
  '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp',
]);
const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp']);
const PYTHON_MICROSERVICE_URL =
  process.env.PYTHON_MICROSERVICE_URL || 'http://127.0.0.1:5001/analyze';

let watcher = null;
let isInitializing = false;

function ensureUploadDirectory() {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Validator to verify file extension limits and eliminate MS temporary owner files
function isValidFile(fileName) {
  if (!fileName) return false;
  const extension = path.extname(fileName).toLowerCase();
  const isTemporary = fileName.startsWith('~$');
  return SUPPORTED_EXTENSIONS.has(extension) && !isTemporary;
}

function escapeForTsQuery(value) {
  return String(value || '')
    .replace(/['":&|!()\-+]/g, ' ')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getFileExtension(fileName) {
  return path.extname(fileName).toLowerCase();
}

function normalizeExtension(extension = '') {
  const ext = String(extension).trim().toLowerCase();
  if (!ext) return '';
  return ext.startsWith('.') ? ext : `.${ext}`;
}

// Call Python service to handle Tesseract OCR & spaCy analysis
async function enrichWithPythonBackend(filePath, textContent = '') {
  const payload = {
    file_path: filePath,
    text_content: textContent,
  };

  const controller = new AbortController();
  const timeoutMs = 20000; // 20 seconds
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(PYTHON_MICROSERVICE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Python service returned ${response.status}: ${body}`);
    }

    const data = await response.json();
    return {
      success: data.success !== false,
      entities: Array.isArray(data.entities) ? data.entities : [],
      extracted_text: data.extracted_text || '',
    };
  } catch (err) {
    console.error(
      'Python microservice communication error:',
      err.message || err,
      'Falling back to default baseline processing.'
    );
    return { success: false, entities: [], extracted_text: '' };
  }
}

async function extractText(filePath) {
  const extension = getFileExtension(filePath);

  try {
    if (extension === '.pdf') {
      const originalWrite = process.stdout.write;
      process.stdout.write = function (chunk, encoding, callback) {
        if (chunk.toString().includes('TT: undefined function: 32')) {
          if (typeof callback === 'function') callback();
          return true;
        }
        return originalWrite.apply(process.stdout, arguments);
      };
      const data = await pdfParse(fs.readFileSync(filePath));
      process.stdout.write = originalWrite;
      return data.text || '';
    }

    if (extension === '.docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value || '';
    }

    if (extension === '.xlsx' || extension === '.xls') {
      const workbook = XLSX.readFile(filePath);
      let content = '';
      workbook.SheetNames.forEach((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false });
        content += `${sheetName}\n${JSON.stringify(rows)}\n`;
      });
      return content;
    }

    if (['.txt', '.csv', '.json'].includes(extension)) {
      return fs.readFileSync(filePath, 'utf8');
    }

    return '';
  } catch (error) {
    console.error(`Unable to extract text from ${filePath}:`, error.message);
    return '';
  }
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
      full_path TEXT NOT NULL UNIQUE,
      search_vector TSVECTOR
    )
  `);

  await pool.query(`
    ALTER TABLE document_search_index 
    ADD COLUMN IF NOT EXISTS nlp_entities JSONB DEFAULT '[]'::jsonb
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS document_search_index_vector_idx
    ON document_search_index USING GIN (search_vector)
  `);
}

async function indexFile(filePath) {
  const fileName = path.basename(filePath);
  if (!isValidFile(fileName)) return null;

  const extension = getFileExtension(filePath);
  const stat = fs.statSync(filePath);
  let extractedText = '';
  let entities = [];

  if (IMAGE_EXTENSIONS.has(extension)) {
    const pyResult = await enrichWithPythonBackend(filePath, '');
    if (pyResult.success) {
      extractedText = pyResult.extracted_text || '';
      entities = pyResult.entities || [];
    }
  } else {
    extractedText = await extractText(filePath);
    const pyResult = await enrichWithPythonBackend(filePath, extractedText);
    if (pyResult.success) {
      entities = pyResult.entities || [];
    }
  }

  const searchText = `${fileName} ${extractedText}`.trim();

  const result = await pool.query(
    `
      INSERT INTO document_search_index (file_name, extension, file_size, uploaded_at, extracted_text, full_path, search_vector, nlp_entities)
      VALUES ($1, $2, $3, $4, $5, $6, to_tsvector('simple', $7), $8)
      ON CONFLICT (full_path) DO UPDATE SET
        file_name = EXCLUDED.file_name,
        extension = EXCLUDED.extension,
        file_size = EXCLUDED.file_size,
        uploaded_at = EXCLUDED.uploaded_at,
        extracted_text = EXCLUDED.extracted_text,
        search_vector = to_tsvector('simple', EXCLUDED.file_name || ' ' || EXCLUDED.extracted_text),
        nlp_entities = EXCLUDED.nlp_entities
      RETURNING id
    `,
    [fileName, extension, stat.size, new Date(stat.mtimeMs), extractedText, filePath, searchText, JSON.stringify(entities)]
  );

  return result.rows[0];
}

async function removeIndexedFile(filePath) {
  await pool.query('DELETE FROM document_search_index WHERE full_path = $1', [filePath]);
}

async function scanUploadDirectory() {
  ensureUploadDirectory();
  const files = [];

  function traverseDirectory(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    entries.forEach((entry) => {
      const entryPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        traverseDirectory(entryPath);
      } else if (entry.isFile()) {
        files.push(entryPath);
      }
    });
  }

  traverseDirectory(UPLOAD_DIR);

  for (const filePath of files) {
    try {
      const fileName = path.basename(filePath);
      if (isValidFile(fileName)) {
        await indexFile(filePath);
      } else {
        // Safe housekeeping: remove illegal runtime files placed manually into server roots
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error(`Failed to index ${filePath}:`, error.message);
    }
  }
}

async function indexChangedFile(filePath) {
  const fileName = path.basename(filePath);
  if (!isValidFile(fileName)) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return;
  }
  if (!fs.existsSync(filePath)) return removeIndexedFile(filePath);

  try {
    await indexFile(filePath);
  } catch (error) {
    console.error(`Failed to index changed file ${filePath}:`, error.message);
  }
}

async function initializeSearchService() {
  if (isInitializing) return;
  isInitializing = true;
  ensureUploadDirectory();

  try {
    await ensureSchema();
    await scanUploadDirectory();

    if (!watcher) {
      watcher = chokidar.watch(UPLOAD_DIR, {
        persistent: true,
        ignoreInitial: true,
        ignored: (pathToWatch) => pathToWatch.includes(`${path.sep}tmp${path.sep}`) || pathToWatch.includes(`${path.sep}tmp`),
        depth: 10,
      });

      watcher
        .on('add', (filePath) => { if (path.extname(filePath).toLowerCase() !== '.tmp') indexChangedFile(filePath); })
        .on('change', (filePath) => { if (path.extname(filePath).toLowerCase() !== '.tmp') indexChangedFile(filePath); })
        .on('unlink', (filePath) => { removeIndexedFile(filePath).catch((err) => console.error(err.message)); });
    }
  } catch (error) {
    console.error('Search service initialization failed:', error.message);
  } finally {
    isInitializing = false;
  }
}

async function listDocuments(options = {}) {
  const extension = normalizeExtension(options.extension || '');
  const { sort = 'newest', sizeFilter } = options;
  let query = 'SELECT id, file_name, extension, file_size, uploaded_at, extracted_text, full_path, nlp_entities FROM document_search_index WHERE 1=1';
  const values = [];
  let index = 1;

  if (extension) {
    query += ` AND LOWER(extension) = $${index}`;
    values.push(extension);
    index += 1;
  }

  if (sizeFilter) {
    if (sizeFilter === 'small') { query += ` AND file_size < $${index}`; values.push(1024 * 1024); index += 1; }
    else if (sizeFilter === 'medium') { query += ` AND file_size >= $${index} AND file_size < $${index + 1}`; values.push(1024 * 1024, 10 * 1024 * 1024); index += 2; }
    else if (sizeFilter === 'large') { query += ` AND file_size >= $${index}`; values.push(10 * 1024 * 1024); index += 1; }
  }

  query += ` ORDER BY uploaded_at ${sort === 'oldest' ? 'ASC' : 'DESC'}`;
  const result = await pool.query(query, values);
  return result.rows;
}

async function searchDocuments(queryText, options = {}) {
  const sanitizedQuery = escapeForTsQuery(queryText || '').trim();
  const extension = normalizeExtension(options.extension || '');
  const { sort = 'relevance', sizeFilter } = options;

  if (!sanitizedQuery) {
    return listDocuments({ extension, sort, sizeFilter });
  }

  const values = [sanitizedQuery];
  let index = 2;
  let query = `
    SELECT id, file_name, extension, file_size, uploaded_at, extracted_text, full_path, nlp_entities,
           ts_rank(search_vector, websearch_to_tsquery('simple', $1)) AS rank
    FROM document_search_index
    WHERE 1=1
  `;

  if (extension) {
    query += ` AND LOWER(extension) = $${index}`;
    values.push(extension);
    index += 1;
  }

  if (sizeFilter) {
    if (sizeFilter === 'small') { query += ` AND file_size < $${index}`; values.push(1024 * 1024); index += 1; }
    else if (sizeFilter === 'medium') { query += ` AND file_size >= $${index} AND file_size < $${index + 1}`; values.push(1024 * 1024, 10 * 1024 * 1024); index += 2; }
    else if (sizeFilter === 'large') { query += ` AND file_size >= $${index}`; values.push(10 * 1024 * 1024); index += 1; }
  }

  const tokens = sanitizedQuery.split(/\s+/).filter(Boolean);
  query += ` AND (search_vector @@ websearch_to_tsquery('simple', $1)`;

  const exactPhraseValue = `%${sanitizedQuery.toLowerCase()}%`;
  query += ` OR LOWER(file_name) LIKE $${index} OR LOWER(extracted_text) LIKE $${index}`;
  values.push(exactPhraseValue);
  index += 1;

  if (tokens.length > 0) {
    for (const token of tokens) {
      const tokenValue = `%${token.toLowerCase()}%`;
      query += ` OR LOWER(file_name) LIKE $${index} OR LOWER(extracted_text) LIKE $${index}`;
      values.push(tokenValue);
      index += 1;
    }
  }

  query += `)`;
  query += sort === 'oldest' ? ' ORDER BY uploaded_at ASC' : ' ORDER BY rank DESC, uploaded_at DESC';

  const result = await pool.query(query, values);
  return result.rows;
}

async function saveUploadedFile(file, destinationDir = UPLOAD_DIR) {
  // Reject processing immediately if name matches target ignore conditions
  if (!isValidFile(file.originalname)) {
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    throw new Error(`Rejected file payload profile: File type unsupported or temporary restriction met.`);
  }

  const extension = path.extname(file.originalname).toLowerCase();
  const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
  const destinationPath = path.join(destinationDir, `${Date.now()}-${safeName}`);

  fs.renameSync(file.path, destinationPath);
  await indexFile(destinationPath);
  return {
    id: path.basename(destinationPath),
    fileName: safeName,
    extension,
    fullPath: destinationPath,
  };
}

async function deleteDocument(documentId) {
  const result = await pool.query('SELECT full_path FROM document_search_index WHERE id = $1', [documentId]);
  if (result.rows.length === 0) return false;

  const { full_path } = result.rows[0];
  if (full_path && fs.existsSync(full_path)) fs.unlinkSync(full_path);

  await pool.query('DELETE FROM document_search_index WHERE id = $1', [documentId]);
  return true;
}

module.exports = {
  initializeSearchService,
  searchDocuments,
  listDocuments,
  saveUploadedFile,
  deleteDocument,
  isValidFile, // Exported to use as a primary guard inside express upload routes
  UPLOAD_DIR,
};