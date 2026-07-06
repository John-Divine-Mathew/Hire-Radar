import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CloudUpload,
  Search,
  Download,
  Eye,
  Trash2,
  Sparkles,
  FileText,
  FileSpreadsheet,
  FileArchive,
  LoaderCircle,
  Moon,
  Sun,
  X,
} from 'lucide-react';
import Sidebar from '../components/sideBar/sideBar.jsx';
import './ImportDrive.css';

const API_BASE_URL = 'http://localhost:5000';

function ImportDrive() {
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedExtension, setSelectedExtension] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedSort, setSelectedSort] = useState('relevance');
  const [history, setHistory] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const fileInputRef = useRef(null);

  const supportedExtensions = useMemo(
    () => ['pdf', 'docx', 'xlsx', 'txt', 'csv', 'json', 'pptx', 'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'],
    [],
  );

  const formatBytes = (bytes = 0) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    if (!bytes) return '0 B';
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return `${parseFloat((bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1))} ${units[index]}`;
  };

  const normalizeDocument = (row) => ({
    ...row,
    fileName: row.file_name ?? row.fileName ?? 'Untitled',
    extension: (row.extension ?? row.file_name?.split('.').pop() ?? row.fileName?.split('.').pop() ?? '').toLowerCase(),
    fileSize: row.file_size ?? row.fileSize ?? 0,
    fileSizeLabel: row.fileSizeLabel ?? formatBytes(row.file_size ?? row.fileSize ?? 0),
    uploadedAt: row.uploaded_at ?? row.uploadedAt ?? null,
    fullPath: row.full_path ?? row.fullPath ?? '',
    extractedText: row.extracted_text ?? row.extractedText ?? '',
  });

  const formatDate = (value) => {
    if (!value) return 'Recently added';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Recently added' : date.toLocaleDateString();
  };

  const persistHistory = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    const nextHistory = [trimmed, ...history.filter((item) => item !== trimmed)].slice(0, 10);
    setHistory(nextHistory);
    localStorage.setItem('document-search-history', JSON.stringify(nextHistory));
  };

  const fetchDocuments = async (term = '', extension = '', size = '', sort = 'relevance') => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (term) params.set('q', term);
      if (extension) params.set('extension', extension);
      if (size) params.set('sizeFilter', size);
      if (sort) params.set('sort', sort);

      const response = await fetch(`${API_BASE_URL}/api/search?${params.toString()}`);
      const result = await response.json();
      setDocuments(Array.isArray(result) ? result.map(normalizeDocument) : []);
    } catch (error) {
      console.error('Unable to fetch documents:', error);
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('document-search-history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (err) {
        console.error('Unable to restore search history:', err);
      }
    }
  }, []);

  useEffect(() => {
    fetchDocuments(searchTerm, selectedExtension, selectedSize, selectedSort);
  }, [selectedExtension, selectedSize, selectedSort]);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (value.trim() !== '') persistHistory(value);
    fetchDocuments(value, selectedExtension, selectedSize, selectedSort);
  };

  const handleUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append('files', file));

    setIsUploading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        await fetchDocuments(searchTerm, selectedExtension, selectedSize, selectedSort);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
      if (event.target) event.target.value = '';
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const droppedFiles = Array.from(event.dataTransfer.files || []);
    if (!droppedFiles.length) return;

    const formData = new FormData();
    droppedFiles.forEach((file) => formData.append('files', file));

    setIsUploading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        await fetchDocuments(searchTerm, selectedExtension, selectedSize, selectedSort);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const openPreview = (document) => {
    setSelectedFile(document);
    setPreviewOpen(true);
  };

  const closePreview = () => {
    setPreviewOpen(false);
    setSelectedFile(null);
  };

  const downloadFile = (document) => {
    if (!document) return;
    window.open(`${API_BASE_URL}/api/documents/${document.id}/download`, '_blank');
  };

  const deleteFile = async (document) => {
    if (!document) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/documents/${document.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await fetchDocuments(searchTerm, selectedExtension, selectedSize, selectedSort);
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const getDocumentIcon = (extension) => {
    const ext = (extension || '').toLowerCase();
    if (ext === 'pdf') return <FileText className="doc-icon pdf" />;
    if (ext === 'docx' || ext === 'doc') return <FileText className="doc-icon docx" />;
    if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') return <FileSpreadsheet className="doc-icon excel" />;
    if (ext === 'txt') return <FileText className="doc-icon txt" />;
    return <FileArchive className="doc-icon generic" />;
  };

  const renderPreviewContent = () => {
    if (!selectedFile) return null;
    const ext = (selectedFile.extension || '').toLowerCase();

    if (ext === 'pdf') {
      return <iframe title={selectedFile.fileName} src={`${API_BASE_URL}/api/documents/${selectedFile.id}/preview`} className="preview-iframe" />;
    }

    if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'].includes(ext)) {
      return <img alt={selectedFile.fileName} src={`${API_BASE_URL}/api/documents/${selectedFile.id}/preview`} className="preview-image" />;
    }

    if (['txt', 'csv', 'json', 'docx'].includes(ext)) {
      return <pre className="preview-text">{selectedFile.extractedText || 'No preview text is available for this document.'}</pre>;
    }

    if (['xlsx', 'xls'].includes(ext)) {
      return <div className="preview-unavailable">Spreadsheet preview is not available yet. Please download to view locally.</div>;
    }

    return <div className="preview-unavailable">Preview is available for supported file types such as PDF, images, and text.</div>;
  };

  return (
    <div className={`import-drive-container ${darkMode ? 'dark' : ''}`}>
      <Sidebar />

      <div className="import-drive-content">
       
          

        <div className="search-container">
          <div className="search-input-wrapper">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search file name or document content..."
              value={searchTerm}
              onChange={(event) => handleSearch(event.target.value)}
              className="search-input"
            />
            {isLoading ? <LoaderCircle size={18} className="loading-icon" /> : null}
          </div>
        </div>

        <div className="dashboard-summary-row">
          <div className="metric-card">
            <p className="metric-label">Total documents</p>
            <h3>{documents.length}</h3>
            <p className="metric-meta">Indexed files available for search</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">Filter status</p>
            <h3>{selectedExtension || 'All types'}</h3>
            <p className="metric-meta">Current document type filter</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">Recent activity</p>
            <h3>{history[0] || 'No recent searches'}</h3>
            <p className="metric-meta">Latest query or workspace action</p>
          </div>
        </div>

        <div className="hero-card" onDragOver={(event) => event.preventDefault()} onDrop={handleDrop}>
          <CloudUpload size={44} className="hero-upload-icon" />
          <h2>Import Entire Drive</h2>
          <p className="hero-description">Drag and drop files or browse a folder to import documents and start indexing immediately.</p>
          <button type="button" className="browse-button" onClick={handleBrowseClick}>
            {isUploading ? 'Uploading...' : 'Browse Drive'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            webkitdirectory="true"
            directory="true"
            multiple
            accept=".pdf,.docx,.xlsx,.txt,.csv,.json,.pptx,.png,.jpg,.jpeg,.gif,.bmp,.webp"
            style={{ display: 'none' }}
            onChange={handleUpload}
          />
        </div>

        <div className="toolbar-row">
          <label className="filter-chip">
            <span>Type</span>
            <select value={selectedExtension} onChange={(event) => setSelectedExtension(event.target.value)}>
              <option value="">All</option>
              {supportedExtensions.map((ext) => (
                <option key={ext} value={ext}>
                  {ext.toUpperCase()}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-chip">
            <span>Size</span>
            <select value={selectedSize} onChange={(event) => setSelectedSize(event.target.value)}>
              <option value="">Any size</option>
              <option value="small">Under 1 MB</option>
              <option value="medium">1 MB - 10 MB</option>
              <option value="large">10 MB+</option>
            </select>
          </label>

          <label className="filter-chip">
            <span>Sort</span>
            <select value={selectedSort} onChange={(event) => setSelectedSort(event.target.value)}>
              <option value="relevance">Most relevant</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </label>

          <button type="button" className="refresh-button" onClick={() => fetchDocuments(searchTerm, selectedExtension, selectedSize, selectedSort)}>
            Refresh
          </button>
        </div>

        <div className="history-panel">
         

          <div className="history-list">
            {history.length === 0 ? (
              <span className="muted"></span>
            ) : (
              history.map((item) => (
                <button key={item} type="button" className="history-item" onClick={() => handleSearch(item)}>
                  {item}
                </button>
              ))
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="empty-state">
            <LoaderCircle size={28} className="loading-icon" />
            <h3>Searching your documents...</h3>
          </div>
        ) : documents.length === 0 ? (
          <div className="empty-state">
            <Sparkles size={36} />
            <h3>No matching documents found.</h3>
            <p>Try a different keyword or upload a document to build your index.</p>
          </div>
        ) : (
          <div className="documents-panel">
            <div className="documents-summary">
              <div>
                <p className="summary-label">Search results</p>
                <h2>{documents.length} documents found</h2>
              </div>
              <button type="button" className="summary-action" onClick={() => fetchDocuments(searchTerm, selectedExtension, selectedSize, selectedSort)}>
                Refresh
              </button>
            </div>

            <div className="documents-table-wrapper">
              <table className="documents-table">
                <thead>
                  <tr>
                    <th>File</th>
                    <th>Type</th>
                    <th>Size</th>
                    <th>Uploaded</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((document) => (
                    <tr key={document.id} className="document-row" onClick={() => openPreview(document)}>
                      <td className="file-name-cell">
                        <div className="file-name-meta">
                          <div className="document-icon-wrap">{getDocumentIcon(document.extension)}</div>
                          <div>
                            <div className="file-name-title">{document.fileName}</div>
                            <div className="file-name-path">{document.fullPath || 'Local upload'}</div>
                          </div>
                        </div>
                      </td>
                      <td>{(document.extension || '').toUpperCase()}</td>
                      <td>{document.fileSizeLabel}</td>
                      <td>{formatDate(document.uploadedAt)}</td>
                      <td className="action-cell">
                        <button type="button" onClick={(event) => { event.stopPropagation(); openPreview(document); }}>
                          <Eye size={14} /> Preview
                        </button>
                        <button type="button" onClick={(event) => { event.stopPropagation(); downloadFile(document); }}>
                          <Download size={14} /> Download
                        </button>
                        <button type="button" className="danger" onClick={(event) => { event.stopPropagation(); deleteFile(document); }}>
                          <Trash2 size={14} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {previewOpen && selectedFile && (
        <div className="preview-modal-overlay" onClick={closePreview}>
          <div className="preview-modal" onClick={(event) => event.stopPropagation()}>
            <div className="preview-modal-header">
              <div>
                <h2>{selectedFile.fileName}</h2>
                <p>{(selectedFile.extension || '').toUpperCase()} • {selectedFile.fileSizeLabel}</p>
              </div>
              <div className="preview-header-actions">
                <button type="button" className="preview-action" onClick={() => downloadFile(selectedFile)}>
                  <Download size={16} /> Download
                </button>
                <button type="button" className="close-btn" onClick={closePreview}>
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="preview-toolbar">
              <div className="preview-toolbar-item">View mode</div>
              <div className="preview-toolbar-item">Fit to width</div>
              <div className="preview-toolbar-item">Actual size</div>
            </div>
            <div className="preview-modal-content">{renderPreviewContent()}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImportDrive;
