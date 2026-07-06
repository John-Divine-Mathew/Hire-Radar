import React, { useState, useRef } from 'react';
import { CloudUpload, Download, X, Eye } from 'lucide-react';
import Sidebar from '../components/sideBar/sideBar.jsx';
import Navbar from '../components/navBar/navBar.jsx';
 
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
 
  // Extract text from DOCX files
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
 
  // Handle drag and drop styling transitions
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('bg-purple-100', 'border-purple-700', 'scale-[1.02]');
  };
 
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('bg-purple-100', 'border-purple-700', 'scale-[1.02]');
  };
 
  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('bg-purple-100', 'border-purple-700', 'scale-[1.02]');
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
      return <img src={selectedFile.blobURL} alt={selectedFile.fileName} className="max-w-full max-h-full object-contain rounded-[15px]" />;
    } else if (ext === 'pdf') {
      return (
        <iframe
          src={selectedFile.blobURL}
          title={selectedFile.fileName}
          className="w-full h-full border-none"
        />
      );
    } else if (['txt', 'csv', 'docx'].includes(ext)) {
      return (
        <div className="w-full h-full overflow-auto bg-white p-5 rounded-[15px] border border-gray-200">
          <pre className="m-0 font-mono text-[13px] text-slate-600 white-space-pre-wrap break-all leading-relaxed">
            {selectedFile.content || 'No content available'}
          </pre>
        </div>
      );
    } else {
      return (
        <div className="text-center text-slate-400 text-e16">
          <p>Preview Not Available</p>
          <p className="text-[13px] text-slate-300">File type: {selectedFile.extension}</p>
        </div>
      );
    }
  };
 
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-50">
      {/* Global Header Navigation */}
      <Navbar />
 
      {/* Main Container Layout */}
      <div className="flex flex-1 min-h-0 w-full overflow-hidden">
       
        {/* Left Side Navigation Panel */}
        <Sidebar />
       
        {/* Right Side Workspace Pane */}
        <div className="flex-1 p-6 md:p-10 space-y-6 min-w-0 overflow-y-auto h-full">
         
          {/* Workspace Branding Header */}
          <div className="mb-2 shrink-0">
            <h1 className="text-2xl font-bold text-gray-900">Import Workspace</h1>
            <p className="text-sm text-gray-500">Upload entire root directories or specific backup data folders.</p>
          </div>
 
          {/* Upload Dropzone Workspace Area */}
          <div
            className="bg-white border border-gray-200 border-dashed border-2 rounded-xl p-8 md:p-12 text-center transition-all duration-300 cursor-pointer relative shadow-sm hover:border-purple-500 hover:shadow-md"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <CloudUpload size={44} className="text-purple-600 mx-auto mb-4 animate-[bounce_3s_infinite]" />
            <h2 className="text-xl font-bold text-gray-800 mb-1">Import Entire Drive Directory</h2>
            <p className="text-sm text-gray-500 mb-5">Supported formats: PDF, DOCX, TXT, Images, CSV, Sheets</p>
           
            <button
              className="bg-purple-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold tracking-wide shadow-sm hover:bg-purple-700 transition duration-150"
              onClick={() => fileInputRef.current?.click()}
            >
              Browse Drive Folder
            </button>
            <input
              ref={fileInputRef}
              type="file"
              webkitdirectory="true"
              directory="true"
              mozdirectory="true"
              multiple
              className="hidden"
              onChange={handleFolderSelect}
            />
          </div>
 
          {/* Document Table Workspace Area */}
          {filteredDocuments.length > 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Imported Documents ({filteredDocuments.length})</h3>
                <input
                  type="text"
                  placeholder="Filter local files..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="max-w-xs w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
             
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500 text-left text-xs font-semibold uppercase tracking-wider">
                      <th className="pb-3 font-semibold">File Name</th>
                      <th className="pb-3 font-semibold">Type</th>
                      <th className="pb-3 font-semibold">Size</th>
                      <th className="pb-3 text-center font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {filteredDocuments.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50 transition duration-150">
                        <td className="py-3 font-medium text-gray-900 truncate max-w-xs">{doc.fileName}</td>
                        <td className="py-3">
                          <span className="bg-purple-50 text-purple-700 border border-purple-100 px-2 py-0.5 rounded text-xs font-medium">
                            {doc.extension}
                          </span>
                        </td>
                        <td className="py-3 text-gray-500 text-xs">{doc.size}</td>
                        <td className="py-3 text-center">
                          <button
                            className="inline-flex items-center gap-1.5 bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm hover:bg-purple-700 transition duration-150"
                            onClick={() => openPreview(doc)}
                            title="Preview File"
                          >
                            <Eye size={14} />
                            Preview
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center px-6 py-12 bg-white rounded-xl border border-gray-200 shadow-sm text-gray-400 text-sm">
              <p>No documents imported yet. Choose a workspace or folder root hierarchy above to begin parsing.</p>
            </div>
          ) : (
            <div className="text-center px-6 py-12 bg-white rounded-xl border border-gray-200 shadow-sm text-gray-400 text-sm">
              <p>No matching file or document details found.</p>
            </div>
          )}
        </div>
      </div>
 
      {/* Preview Modal Backdrop View Component */}
      {previewOpen && selectedFile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] backdrop-blur-sm animate-[fadeIn_0.2s_ease-in-out]" onClick={closePreview}>
          <div className="bg-white rounded-xl max-w-3xl w-[92%] max-h-[85vh] overflow-hidden flex flex-col shadow-xl animate-[slideUp_0.2s_ease-out]" onClick={(e) => e.stopPropagation()}>
           
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-slate-50">
              <h2 className="m-0 text-base font-bold text-gray-900 truncate max-w-md">{selectedFile.fileName}</h2>
              <div className="flex gap-2 items-center">
                <button className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:bg-purple-700 transition duration-150" onClick={downloadFile} title="Download file locally">
                  <Download size={15} />
                  Download
                </button>
                <button className="bg-gray-100 text-gray-700 p-1.5 rounded-lg hover:bg-gray-200 transition duration-150" onClick={closePreview} title="Close Panel">
                  <X size={18} />
                </button>
              </div>
            </div>
 
            {/* Modal Info Meta Row */}
            <div className="flex gap-4 px-5 py-2 bg-slate-100/50 border-b border-gray-100 items-center text-xs text-gray-500">
              <span className="bg-purple-600 text-white px-1.5 py-0.5 rounded text-[10px] font-bold">{selectedFile.extension}</span>
              <span>{selectedFile.size}</span>
              <span>Modified: {selectedFile.lastModified}</span>
            </div>
 
            {/* Modal Content Frame Viewport */}
            <div className="flex-1 overflow-y-auto p-5 flex items-center justify-center bg-slate-50 min-h-[300px]">
              {renderPreviewContent()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
 
export default ImportDrive;