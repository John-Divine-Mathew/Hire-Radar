const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const XLSX = require('xlsx');
const pool = require('./db');

const UPLOAD_DIR = path.join(__dirname, 'uploads');
const SUPPORTED_EXTENSIONS = new Set(['.pdf', '.docx', '.xlsx', '.xls', '.txt', '.csv', '.json', '.pptx']);

let watcher = null;
let isInitializing = false;
let reindexTimer = null;

function ensureUploadDirectory() {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

function escapeForTsQuery(value) {
  return String(value || '').replace(/'/g, "''").trim();
}

function getFileExtension(fileName) {
  return path.extname(fileName).toLowerCase();
}

function getMimeType(extension) {
  switch (extension) {
    case '.pdf':
      return 'application/pdf';
    case '.docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case '.xlsx':
    case '.xls':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case '.txt':
      return 'text/plain';
    default:
      return 'application/octet-stream';
  }
}

async function extractText(filePath) {
  const extension = getFileExtension(filePath);

  try {
    if (extension === '.pdf') {
      const data = await pdfParse(fs.readFileSync(filePath));
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

    if (extension === '.txt' || extension === '.csv' || extension === '.json') {
      return fs.readFileSync(filePath, 'utf8');
    }

    if (extension === '.pptx') {
      return 'PowerPoint preview is not available in the current indexing engine.';
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
    CREATE INDEX IF NOT EXISTS document_search_index_vector_idx
    ON document_search_index USING GIN (search_vector)
  `);
}

async function indexFile(filePath) {
  const extension = getFileExtension(filePath);
  if (!SUPPORTED_EXTENSIONS.has(extension)) {
    return null;
  }

  const stat = fs.statSync(filePath);
  const extractedText = await extractText(filePath);
  const fileName = path.basename(filePath);
  const searchText = `${fileName} ${extractedText}`.trim();
  const searchVector = `setweight(to_tsvector('simple', coalesce($1, '')), 'A') || setweight(to_tsvector('simple', coalesce($2, '')), 'B')`;

  const result = await pool.query(
    `
      INSERT INTO document_search_index (file_name, extension, file_size, uploaded_at, extracted_text, full_path, search_vector)
      VALUES ($1, $2, $3, $4, $5, $6, to_tsvector('simple', $7))
      ON CONFLICT (full_path) DO UPDATE SET
        file_name = EXCLUDED.file_name,
        extension = EXCLUDED.extension,
        file_size = EXCLUDED.file_size,
        uploaded_at = EXCLUDED.uploaded_at,
        extracted_text = EXCLUDED.extracted_text,
        search_vector = to_tsvector('simple', EXCLUDED.file_name || ' ' || EXCLUDED.extracted_text)
      RETURNING id
    `,
    [fileName, extension, stat.size, new Date(stat.mtimeMs), extractedText, filePath, searchText]
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
      await indexFile(filePath);
    } catch (error) {
      console.error(`Failed to index ${filePath}:`, error.message);
    }
  }
}

function scheduleReindex() {
  if (reindexTimer) {
    clearTimeout(reindexTimer);
  }

  reindexTimer = setTimeout(async () => {
    try {
      await scanUploadDirectory();
    } catch (error) {
      console.error('Reindexing failed:', error.message);
    }
  }, 800);
}

async function initializeSearchService() {
  if (isInitializing) {
    return;
  }

  isInitializing = true;
  ensureUploadDirectory();

  try {
    await ensureSchema();
    await scanUploadDirectory();

    if (!watcher) {
      watcher = chokidar.watch(UPLOAD_DIR, {
        persistent: true,
        ignoreInitial: true,
        depth: 10,
      });

      watcher
        .on('add', (filePath) => {
          if (path.extname(filePath).toLowerCase() === '.tmp') return;
          scheduleReindex();
        })
        .on('change', (filePath) => {
          if (path.extname(filePath).toLowerCase() === '.tmp') return;
          scheduleReindex();
        })
        .on('unlink', (filePath) => {
          removeIndexedFile(filePath).catch((error) => console.error('Failed to remove index entry:', error.message));
        });
    }
  } catch (error) {
    console.error('Search service initialization failed:', error.message);
  } finally {
    isInitializing = false;
  }
}

async function listDocuments(options = {}) {
  const { extension, sort = 'newest', sizeFilter } = options;
  let query = 'SELECT id, file_name, extension, file_size, uploaded_at, extracted_text, full_path FROM document_search_index WHERE 1=1';
  const values = [];
  let index = 1;

  if (extension) {
    query += ` AND LOWER(extension) = $${index}`;
    values.push(extension.toLowerCase());
    index += 1;
  }

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
  const { extension, sort = 'relevance', sizeFilter } = options;

  if (!sanitizedQuery) {
    return listDocuments(options);
  }

  const values = [sanitizedQuery];
  let index = 2;
  let query = `
    SELECT id, file_name, extension, file_size, uploaded_at, extracted_text, full_path,
           ts_rank(search_vector, websearch_to_tsquery('simple', $1)) AS rank
    FROM document_search_index
    WHERE 1=1
  `;

  if (extension) {
    query += ` AND LOWER(extension) = $${index}`;
    values.push(extension.toLowerCase());
    index += 1;
  }

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

  query += ` AND (
      search_vector @@ websearch_to_tsquery('simple', $1)
      OR LOWER(file_name) LIKE $${index}
      OR LOWER(extracted_text) LIKE $${index}
    )`;
  values.push(`%${sanitizedQuery.toLowerCase()}%`);
  index += 1;

  query += sort === 'oldest' ? ' ORDER BY uploaded_at ASC' : ' ORDER BY rank DESC, uploaded_at DESC';

  const result = await pool.query(query, values);
  return result.rows;
}

async function saveUploadedFile(file, destinationDir = UPLOAD_DIR) {
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
  if (result.rows.length === 0) {
    return false;
  }

  const { full_path } = result.rows[0];
  if (full_path && fs.existsSync(full_path)) {
    fs.unlinkSync(full_path);
  }

  await pool.query('DELETE FROM document_search_index WHERE id = $1', [documentId]);
  return true;
}

module.exports = {
  initializeSearchService,
  searchDocuments,
  listDocuments,
  saveUploadedFile,
  deleteDocument,
  UPLOAD_DIR,
};
