import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CloudUpload, Search, Download, Eye, Trash2, Sparkles, FileText, FileSpreadsheet, FileArchive, LoaderCircle } from 'lucide-react';
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
  const fileInputRef = useRef(null);

  const supportedExtensions = useMemo(() => ['pdf', 'docx', 'xlsx', 'txt', 'csv', 'json', 'pptx'], []);

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
      setDocuments(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error('Unable to fetch indexed documents:', error);
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments(searchTerm, selectedExtension, selectedSize, selectedSort);
  }, [selectedExtension, selectedSize, selectedSort]);

  useEffect(() => {
    const saved = localStorage.getItem('document-search-history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (error) {
        console.error('Unable to restore history:', error);
      }
    }
  }, []);

  const persistHistory = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    const nextHistory = [trimmed, ...history.filter((entry) => entry !== trimmed)].slice(0, 10);
    setHistory(nextHistory);
    localStorage.setItem('document-search-history', JSON.stringify(nextHistory));
  };

  const handleSearch = (value) => {
    const nextValue = value;
    setSearchTerm(nextValue);

    if (nextValue.trim().length > 0) {
      persistHistory(nextValue);
    }

    if (nextValue.trim() === '') {
      fetchDocuments('', selectedExtension, selectedSize, selectedSort);
      return;
    }

    fetchDocuments(nextValue, selectedExtension, selectedSize, selectedSort);
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
      event.target.value = '';
    }
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

  const downloadFile = async (document) => {
    if (!document) return;
    window.open(`${API_BASE_URL}/api/documents/${document.id}/download`, '_blank');
  };

  const deleteFile = async (document) => {
    if (!document) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/documents/${document.id}`, { method: 'DELETE' });
      if (response.ok) {
        await fetchDocuments(searchTerm, selectedExtension, selectedSize, selectedSort);
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const formatDate = (value) => {
    if (!value) return 'Recently added';
    return new Date(value).toLocaleDateString();
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

    if (ext === 'txt' || ext === 'csv' || ext === 'json') {
      return <pre className="preview-text">{selectedFile.extractedText || 'No preview text is available for this document.'}</pre>;
    }

    return <div className="preview-unavailable">Preview is available after the document is opened or downloaded.</div>;
  };

  return (
    <div className="import-drive-container">
      <Sidebar />

      <div className="import-drive-content">
        <div className="hero-panel">
          <div>
            <p className="eyebrow">Enterprise Document Search</p>
            <h1>Browse Drive</h1>
            <p className="hero-copy">Search file names and document contents with the speed of modern cloud storage.</p>
          </div>
          <div className="hero-badge">
            <Sparkles size={18} />
            Indexed & secured
          </div>
        </div>

        <div className="search-container">
          <div className="search-input-wrapper">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search document names or contents..."
              value={searchTerm}
              onChange={(event) => handleSearch(event.target.value)}
              className="search-input"
            />
            {isLoading ? <LoaderCircle size={18} className="loading-icon" /> : null}
          </div>
        </div>

        <div className="toolbar-row">
          <label className="filter-chip">
            <span>Type</span>
            <select value={selectedExtension} onChange={(event) => setSelectedExtension(event.target.value)}>
              <option value="">All</option>
              {supportedExtensions.map((ext) => <option key={ext} value={ext}>{ext.toUpperCase()}</option>)}
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
        </div>

        <div className="upload-area" onDragOver={(event) => event.preventDefault()} onDrop={handleDrop}>
          <CloudUpload size={42} className="upload-icon" />
          <h2 className="upload-title">Import documents for intelligent search</h2>
          <p className="upload-subtitle">Upload PDF, DOCX, XLSX, TXT, and more. Indexing starts immediately.</p>
          <label className="browse-button">
            {isUploading ? 'Uploading…' : 'Browse Drive'}
            <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }} onChange={handleUpload} />
          </label>
        </div>

        <div className="history-panel">
          <div className="history-header">
            <h3>Recent searches</h3>
            <button type="button" className="history-clear" onClick={() => { setHistory([]); localStorage.removeItem('document-search-history'); }}>
              Clear
            </button>
          </div>
          <div className="history-list">
            {history.length === 0 ? <span className="muted">No recent searches yet.</span> : history.map((item) => (
              <button key={item} type="button" className="history-item" onClick={() => handleSearch(item)}>{item}</button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="empty-state"><LoaderCircle size={28} className="loading-icon" />Searching your documents…</div>
        ) : documents.length === 0 ? (
          <div className="empty-state">
            <Sparkles size={36} />
            <h3>No matching documents found.</h3>
            <p>Try a different keyword or upload a document to build your index.</p>
          </div>
        ) : (
          <div className="documents-grid">
            {documents.map((document) => (
              <article key={document.id} className="document-card">
                <div className="document-card-top">
                  <div className="document-icon-wrap">{getDocumentIcon(document.extension)}</div>
                  <div className="document-meta">
                    <h3>{document.fileName}</h3>
                    <p>{(document.extension || '').toUpperCase()} • {document.fileSizeLabel}</p>
                  </div>
                </div>

                <div className="preview-snippet">
                  {document.extractedText ? document.extractedText.slice(0, 220) : 'The document is indexed and ready for search.'}
                </div>

                <div className="document-footer">
                  <span>{formatDate(document.uploadedAt)}</span>
                  <div className="action-row">
                    <button type="button" onClick={() => openPreview(document)}><Eye size={16} /> Preview</button>
                    <button type="button" onClick={() => downloadFile(document)}><Download size={16} /> Download</button>
                    <button type="button" className="danger" onClick={() => deleteFile(document)}><Trash2 size={16} /> Delete</button>
                  </div>
                </div>
              </article>
            ))}
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
              <button type="button" className="close-btn" onClick={closePreview}>✕</button>
            </div>
            <div className="preview-modal-content">{renderPreviewContent()}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImportDrive;
