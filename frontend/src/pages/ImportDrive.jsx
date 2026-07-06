import React, { useState, useRef } from 'react';
import { CloudUpload, Search, Bell, Download, X, Eye } from 'lucide-react';
import Sidebar from '../components/sideBar/sideBar.jsx';
import './ImportDrive.css';

function ImportDrive() {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // Supported file extensions
  const SUPPORTED_EXTENSIONS = [
    'pdf', 'doc', 'docx', 'txt', 'csv', 'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'ppt', 'pptx', 'xls', 'xlsx', 'zip'
  ];

  // Extract text from TXT files
  const extractTextContent = async (file) => {
    try {
      return await file.text();
    } catch (error) {
      console.error('Error extracting TXT content:', error);
      return '';
    }
  };

  // Extract text from DOCX files (if Mammoth is available)
  const extractDocxContent = async (file) => {
    try {
      return '(DOCX file - preview available)';
    } catch (error) {
      console.error('Error extracting DOCX content:', error);
      return '(Unable to extract DOCX content)';
    }
  };

  // Extract text from CSV files
  const extractCsvContent = async (file) => {
    try {
      return await file.text();
    } catch (error) {
      console.error('Error extracting CSV content:', error);
      return '';
    }
  };

  // Extract content based on file type
  const extractFileContent = async (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    
    try {
      if (['txt'].includes(ext)) {
        return await extractTextContent(file);
      } else if (['docx'].includes(ext)) {
        return await extractDocxContent(file);
      } else if (['csv'].includes(ext)) {
        return await extractCsvContent(file);
      } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) {
        return '(Image file - preview available)';
      } else if (['pdf'].includes(ext)) {
        return '(PDF file - preview available)';
      } else if (['xlsx', 'xls'].includes(ext)) {
        return '(Excel file - sheet names available)';
      } else if (['pptx', 'ppt'].includes(ext)) {
        return '(PowerPoint file - slide information available)';
      } else if (['zip'].includes(ext)) {
        return '(ZIP file - metadata available)';
      }
      return '';
    } catch (error) {
      console.error('Error extracting content:', error);
      return '';
    }
  };

  // Process files recursively
  const processFilesRecursively = async (items) => {
    const newDocuments = [];

    for (const item of items) {
      if (item.kind === 'file') {
        const file = await item.getFile();
        const ext = file.name.split('.').pop().toLowerCase();

        if (SUPPORTED_EXTENSIONS.includes(ext)) {
          const content = await extractFileContent(file);
          const blobURL = URL.createObjectURL(file);

          newDocuments.push({
            id: Date.now() + Math.random(),
            fileName: file.name,
            extension: ext.toUpperCase(),
            size: formatFileSize(file.size),
            sizeBytes: file.size,
            path: file.webkitRelativePath || file.name,
            lastModified: new Date(file.lastModified).toLocaleDateString(),
            blobURL: blobURL,
            content: content,
            file: file,
            type: file.type
          });
        }
      } else if (item.kind === 'directory') {
        const dirReader = item.createReader();
        const entries = await new Promise((resolve, reject) => {
          dirReader.readEntries(resolve, reject);
        });
        const subFiles = await processFilesRecursively(entries);
        newDocuments.push(...subFiles);
      }
    }

    return newDocuments;
  };

  // Handle folder selection
  const handleFolderSelect = async (event) => {
    const items = event.dataTransfer?.items || event.target.files;
    
    if (!items) return;

    try {
      const entries = [];
      
      if (event.dataTransfer?.items) {
        // Drag and drop
        for (let i = 0; i < items.length; i++) {
          const entry = items[i].webkitGetAsEntry?.();
          if (entry) {
            entries.push(entry);
          }
        }
      } else {
        // File input
        for (let i = 0; i < items.length; i++) {
          const file = items[i];
          if (file.webkitRelativePath || file.type) {
            entries.push(file);
          }
        }
      }

      if (entries.length > 0) {
        const newDocs = await processFilesRecursively(entries);
        const allDocs = [...newDocs, ...documents].sort((a, b) => b.id - a.id);
        setDocuments(allDocs);
        setFilteredDocuments(allDocs);
      }
    } catch (error) {
      console.error('Error processing files:', error);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');
    await handleFolderSelect(e);
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Real-time search
  const handleSearch = (value) => {
    setSearchTerm(value);
    
    if (value.trim() === '') {
      setFilteredDocuments(documents);
    } else {
      const lowerSearch = value.toLowerCase();
      const filtered = documents.filter(doc => {
        const fileName = doc.fileName.toLowerCase();
        const content = doc.content.toLowerCase();
        return fileName.includes(lowerSearch) || content.includes(lowerSearch);
      });
      setFilteredDocuments(filtered);
    }
  };

  // Open preview modal
  const openPreview = (file) => {
    setSelectedFile(file);
    setPreviewOpen(true);
  };

  // Close preview modal
  const closePreview = () => {
    setPreviewOpen(false);
    setSelectedFile(null);
  };

  // Download file
  const downloadFile = () => {
    if (!selectedFile) return;
    const link = document.createElement('a');
    link.href = selectedFile.blobURL;
    link.download = selectedFile.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render preview content based on file type
  const renderPreviewContent = () => {
    if (!selectedFile) return null;

    const ext = selectedFile.extension.toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) {
      return <img src={selectedFile.blobURL} alt={selectedFile.fileName} className="preview-image" />;
    } else if (ext === 'pdf') {
      return (
        <iframe
          src={selectedFile.blobURL}
          title={selectedFile.fileName}
          className="preview-iframe"
        />
      );
    } else if (['txt', 'csv', 'docx'].includes(ext)) {
      return (
        <div className="preview-text">
          <pre>{selectedFile.content || 'No content available'}</pre>
        </div>
      );
    } else {
      return (
        <div className="preview-unavailable">
          <p>Preview Not Available</p>
          <p className="text-secondary">File type: {selectedFile.extension}</p>
        </div>
      );
    }
  };

  return (
    <div className="import-drive-container">
      <Sidebar />
      
      <div className="import-drive-content">
        {/* Search Bar */}
        <div className="search-container">
          <div className="search-input-wrapper">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search file name or document content..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
            <Bell size={20} className="notification-icon" />
          </div>
        </div>

        {/* Upload Area */}
        <div
          className="upload-area"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CloudUpload size={48} className="upload-icon" />
          <h2 className="upload-title">Import Entire Drive</h2>
          <p className="upload-subtitle">PDF, DOCX, TXT, Images</p>
          <button
            className="browse-button"
            onClick={() => fileInputRef.current?.click()}
          >
            Browse Drive
          </button>
          <input
            ref={fileInputRef}
            type="file"
            webkitdirectory="true"
            directory="true"
            mozdirectory="true"
            multiple
            style={{ display: 'none' }}
            onChange={handleFolderSelect}
          />
        </div>

        {/* Document Table */}
        {filteredDocuments.length > 0 ? (
          <div className="documents-table">
            <h3 className="table-title">Documents ({filteredDocuments.length})</h3>
            <table>
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id}>
                    <td className="file-name">{doc.fileName}</td>
                    <td className="file-type">{doc.extension}</td>
                    <td className="file-size">{doc.size}</td>
                    <td className="action-cell">
                      <button
                        className="preview-button"
                        onClick={() => openPreview(doc)}
                        title="Preview"
                      >
                        <Eye size={18} />
                        Preview
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : documents.length === 0 ? (
          <div className="no-documents">
            <p>No documents imported yet. Start by selecting a folder above.</p>
          </div>
        ) : (
          <div className="no-documents">
            <p>No matching documents found</p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewOpen && selectedFile && (
        <div className="preview-modal-overlay" onClick={closePreview}>
          <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="preview-modal-header">
              <h2>{selectedFile.fileName}</h2>
              <div className="preview-modal-actions">
                <button className="download-btn" onClick={downloadFile} title="Download">
                  <Download size={20} />
                  Download
                </button>
                <button className="close-btn" onClick={closePreview} title="Close">
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="preview-modal-info">
              <span className="info-badge">{selectedFile.extension}</span>
              <span className="info-text">{selectedFile.size}</span>
              <span className="info-text">{selectedFile.lastModified}</span>
            </div>

            <div className="preview-modal-content">
              {renderPreviewContent()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImportDrive;
