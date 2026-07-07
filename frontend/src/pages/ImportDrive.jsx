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
  X,
} from 'lucide-react';
import Sidebar from '../components/sideBar/sideBar.jsx';
import Navbar from '../components/navBar/navBar.jsx';
//import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

const API_BASE_URL = 'http://localhost:5000';

function ImportDrive() {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
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

  // Supported file extensions (Removed 'zip')
  const supportedExtensions = useMemo(
    () => ['pdf', 'doc', 'docx', 'txt', 'csv', 'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'ppt', 'pptx', 'xls', 'xlsx'],
    []
  );

  // Central validation gate for file filtering rule requirements
  const isValidFile = (fileName) => {
    if (!fileName) return false;
    const ext = fileName.split('.').pop().toLowerCase();
    const isTemporary = fileName.startsWith('~$');
    const isZip = ext === 'zip';
    return !isTemporary && !isZip && supportedExtensions.includes(ext);
  };

  // Format file size helper
  const formatFileSize = (bytes) => {
    if (bytes === 0 || !bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1)) + ' ' + sizes[i];
  };

  // Fetch baseline dataset records directly from Backend Database pipelines on startup
  const fetchBackendDocuments = async (searchQuery = '', ext = '', size = '', sortOrder = 'relevance') => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('q', searchQuery);
      if (ext) params.append('extension', ext);
      if (size) params.append('sizeFilter', size);
      if (sortOrder) params.append('sort', sortOrder);

      const route = searchQuery.trim() ? '/api/search' : '/api/documents';
      const response = await fetch(`${API_BASE_URL}${route}?${params.toString()}`);
      if (!response.ok) throw new Error('Network failed to fetch documents');
      
      const data = await response.json();
      // Normalize backend items structural format to align seamlessly with local schemas
      const normalizedData = data.map(doc => ({
        id: doc.id || crypto.randomUUID(),
        fileName: doc.fileName,
        extension: (doc.extension || '').toLowerCase(),
        size: doc.fileSizeLabel || formatFileSize(doc.sizeBytes),
        sizeBytes: doc.sizeBytes || 0,
        path: doc.path || 'Remote Storage Node',
        lastModified: doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString() : new Date().toLocaleDateString(),
        blobURL: doc.blobURL || `${API_BASE_URL}/api/documents/${doc.id}/download`,
        content: doc.extractedText || doc.content || '',
      }));
      setDocuments(normalizedData);
    } catch (err) {
      console.error('Unable to fetch updated search index from server backend:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial runtime fetch on component mount only (No local storage restore hooks)
  useEffect(() => {
    fetchBackendDocuments('', '', '', 'newest');

    // Garbage collector routine: Revoke temporary object memory references when component shifts out
    return () => {
      documents.forEach(doc => {
        if (doc.blobURL && doc.blobURL.startsWith('blob:')) {
          URL.revokeObjectURL(doc.blobURL);
        }
      });
    };
  }, []);

  // Hybrid Real-time Client-Side Search and Filter Logic Processor
  useEffect(() => {
    setIsLoading(true);
    let result = [...documents];

    // 1. Text Search Filter (scans dynamic string contents + names)
    if (searchTerm.trim() !== '') {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(
        (doc) =>
          doc.fileName.toLowerCase().includes(lowerSearch) ||
          (doc.content && doc.content.toLowerCase().includes(lowerSearch))
      );
    }

    // 2. Extension Filter
    if (selectedExtension) {
      result = result.filter((doc) => doc.extension.toLowerCase() === selectedExtension.toLowerCase());
    }

    // 3. Size Filter bounds
    if (selectedSize) {
      result = result.filter((doc) => {
        const sizeInMb = doc.sizeBytes / (1024 * 1024);
        if (selectedSize === 'small') return sizeInMb < 1;
        if (selectedSize === 'medium') return sizeInMb >= 1 && sizeInMb <= 10;
        if (selectedSize === 'large') return sizeInMb > 10;
        return true;
      });
    }

    // 4. Sorting rules matrices
    if (selectedSort === 'newest') {
      result.sort((a, b) => String(b.id).localeCompare(String(a.id)));
    } else if (selectedSort === 'oldest') {
      result.sort((a, b) => String(a.id).localeCompare(String(b.id)));
    } else if (selectedSort === 'relevance' && searchTerm.trim() !== '') {
      const lowerSearch = searchTerm.toLowerCase();
      result.sort((a, b) => {
        const aScore = (a.fileName.toLowerCase().match(new RegExp(lowerSearch, 'g')) || []).length;
        const bScore = (b.fileName.toLowerCase().match(new RegExp(lowerSearch, 'g')) || []).length;
        return bScore - aScore;
      });
    }

    setFilteredDocuments(result);
    setIsLoading(false);
  }, [documents, searchTerm, selectedExtension, selectedSize, selectedSort]);

  // Track search query parameters temporarily within raw component execution runtime state context only
  const updateTemporaryHistory = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const nextHistory = [trimmed, ...history.filter((item) => item !== trimmed)].slice(0, 10);
    setHistory(nextHistory);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const executeSearch = (value) => {
    setSearchTerm(value);
    if (value.trim() !== '') {
      updateTemporaryHistory(value);
    }
  };

  // Local clientside offline stream reader tools implementation
  const extractTextContent = async (file) => {
    try { return await file.text(); } catch (e) { return ''; }
  };
  
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

  const extractImageText = async (file) => {
    try {
      const result = await Tesseract.recognize(file, 'eng');
      return result?.data?.text?.trim() || '';
    } catch (error) {
      console.error('OCR failed:', error);
      return '';
    }
  };

  const extractPdfText = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = '';
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        text += content.items.map((item) => item.str).join(' ') + '\n';
      }
      return text.trim();
    } catch (e) {
      return '';
    }
  };

  const extractDocxContent = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value.trim();
    } catch (e) {
      return '';
    }
  };

  const extractXlsxText = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      let text = '';
      workbook.SheetNames.forEach((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        text += XLSX.utils.sheet_to_csv(sheet) + '\n';
      });
      return text.trim();
    } catch (e) {
      return '';
    }
  };

  const extractFileContent = async (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (['txt', 'csv'].includes(ext)) return extractTextContent(file);
    if (['docx'].includes(ext)) return extractDocxContent(file);
    if (['pdf'].includes(ext)) return extractPdfText(file);
    if (['xlsx', 'xls'].includes(ext)) return extractXlsxText(file);
    if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'].includes(ext)) return extractImageText(file);
    return '';
  };

  const processFilesRecursively = async (items) => {
    const newDocuments = [];
    for (const item of items) {
      if (item.kind === 'file') {
        const file = typeof item.getFile === 'function' ? await item.getFile() : item;
        
        // Block processing if the structural filename fails verification checks
        if (isValidFile(file.name)) {
          const ext = file.name.split('.').pop().toLowerCase();
          const content = await extractFileContent(file);
          const blobURL = URL.createObjectURL(file);

          newDocuments.push({
            id: crypto.randomUUID(),
            fileName: file.name,
            extension: ext,
            size: formatFileSize(file.size),
            sizeBytes: file.size,
            path: file.webkitRelativePath || file.name,
            lastModified: new Date(file.lastModified).toLocaleDateString(),
            blobURL: blobURL,
            content: content,
          });
        }
      } else if (item.kind === 'directory' || item.isDirectory) {
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

  // Sync Form Data files directly upstream to Server Storage Engines
  const handleFolderSelect = async (event) => {
    const items = event.dataTransfer?.items || event.target.files;
    if (!items || items.length === 0) return;

    setIsUploading(true);
    try {
      const entries = [];
      const filesToUpload = [];

      if (event.dataTransfer?.items) {
        for (let i = 0; i < items.length; i++) {
          const entry = items[i].webkitGetAsEntry?.();
          if (entry) entries.push(entry);
        }
      } else {
        for (let i = 0; i < items.length; i++) {
          const file = items[i];
          if (isValidFile(file.name)) {
            filesToUpload.push(file);
            entries.push({
              kind: 'file',
              getFile: async () => file
            });
          }
        }
      }

      // 1. Process items locally for UI optimization layout rendering
      if (entries.length > 0) {
        const newDocs = await processFilesRecursively(entries);
        setDocuments((prev) => [...newDocs, ...prev]);
      }

      // 2. Continuous stream background dispatch pipeline synchronization
      const targetUploadList = event.target.files || filesToUpload;
      for (let i = 0; i < targetUploadList.length; i++) {
        const file = targetUploadList[i];
        
        // Skip background uploads for files starting with ~$ or matching .zip
        if (!isValidFile(file.name)) continue;

        const formData = new FormData();
        formData.append('file', file);

        try {
          await fetch(`${API_BASE_URL}/api/upload`, {
            method: 'POST',
            body: formData,
          });
        } catch (uploadErr) {
          console.error(`Failed pushing ${file.name} to express backend architecture:`, uploadErr);
        }
      }
    } catch (error) {
      console.error('Error processing uploaded items hierarchy:', error);
    } finally {
      setIsUploading(false);
      if (event.target) event.target.value = '';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('bg-purple-50', 'border-purple-500', 'scale-[1.01]');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('bg-purple-50', 'border-purple-500', 'scale-[1.01]');
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('bg-purple-50', 'border-purple-500', 'scale-[1.01]');
    await handleFolderSelect(e);
  };

  const openPreview = (file) => {
    setSelectedFile(file);
    setPreviewOpen(true);
  };

  const closePreview = () => {
    setPreviewOpen(false);
    setSelectedFile(null);
  };

  const downloadFile = (file) => {
    if (!file) return;
    if (file.blobURL && file.blobURL.startsWith('blob:')) {
      const link = document.createElement('a');
      link.href = file.blobURL;
      link.download = file.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.open(`${API_BASE_URL}/api/documents/${file.id}/download`, '_blank');
    }
  };

  const deleteFile = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/api/documents/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Server cleanup omitted or unreachable, discarding context references locally:', err);
    }

    const fileToDelete = documents.find((doc) => doc.id === id);
    if (fileToDelete?.blobURL && fileToDelete.blobURL.startsWith('blob:')) {
      URL.revokeObjectURL(fileToDelete.blobURL);
    }

    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    if (selectedFile?.id === id) closePreview();
  };

  // Keyword highlighter tool implementation matching initial styles
  const highlightSnippet = (text = '', searchKeyword = '') => {
    if (!searchKeyword.trim() || !text) return text.slice(0, 140) + '...';
    
    const index = text.toLowerCase().indexOf(searchKeyword.toLowerCase());
    if (index === -1) return text.slice(0, 140) + '...';

    const start = Math.max(0, index - 40);
    const end = Math.min(text.length, index + searchKeyword.length + 80);
    const snippet = text.slice(start, end);

    return (
      <span>
        ...{snippet.replace(new RegExp(`(${searchKeyword})`, 'gi'), '⭐$1⭐')}...
      </span>
    );
  };

  const getDocumentIcon = (extension) => {
    const ext = (extension || '').toLowerCase();
    if (ext === 'pdf') return <FileText className="text-red-500 w-5 h-5" />;
    if (['docx', 'doc'].includes(ext)) return <FileText className="text-blue-500 w-5 h-5" />;
    if (['xlsx', 'xls', 'csv'].includes(ext)) return <FileSpreadsheet className="text-green-500 w-5 h-5" />;
    if (ext === 'txt') return <FileText className="text-slate-500 w-5 h-5" />;
    return <FileArchive className="text-amber-500 w-5 h-5" />;
  };

  const renderPreviewContent = () => {
    if (!selectedFile) return null;
    const ext = selectedFile.extension.toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) {
      return <img src={selectedFile.blobURL} alt={selectedFile.fileName} className="max-w-full max-h-[60vh] object-contain rounded-lg" />;
    }
    if (ext === 'pdf') {
      return <iframe src={selectedFile.blobURL} title={selectedFile.fileName} className="w-full h-[60vh] border-none rounded-lg" />;
    }
    if (['txt', 'csv', 'docx', 'json'].includes(ext) || selectedFile.content) {
      return (
        <div className="w-full max-h-[60vh] overflow-auto bg-white p-4 rounded-lg border border-gray-200">
          <pre className="text-xs text-slate-700 font-mono whitespace-pre-wrap break-all leading-relaxed">
            {selectedFile.content || 'No context database content index extracted for this item.'}
          </pre>
        </div>
      );
    }
    return (
      <div className="text-center p-8 text-slate-400">
        <p className="font-semibold">Preview Not Available</p>
        <p className="text-xs text-slate-400 mt-1">Please download file to view contents. File extension: {selectedFile.extension.toUpperCase()}</p>
      </div>
    );
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-50 text-slate-900">
      <Navbar />

      <div className="flex flex-1 min-h-0 w-full overflow-hidden">
        <Sidebar />

        <div className="flex-1 p-6 md:p-10 space-y-6 min-w-0 overflow-y-auto h-full">
          {/* Header */}
          <div className="flex justify-between items-center mb-2 shrink-0">
            <div>
              <h1 className="text-2xl font-bold">Import Workspace</h1>
              <p className="text-sm text-gray-500">Upload documents to scan and search strings inside file contents instantly.</p>
            </div>
          </div>

          {/* Metrics summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total documents</p>
              <h3 className="text-2xl font-bold mt-1">{documents.length}</h3>
              <p className="text-xs text-gray-400 mt-1">Indexed workspace files</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Filter status</p>
              <h3 className="text-2xl font-bold mt-1 text-purple-600">
                {selectedExtension ? selectedExtension.toUpperCase() : 'All types'}
              </h3>
              <p className="text-xs text-gray-400 mt-1">Active extension filter target</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Recent activity</p>
              <h3 className="text-xl font-bold mt-1 truncate max-w-xs">{history[0] || 'No recent searches'}</h3>
              <p className="text-xs text-gray-400 mt-1">Latest search parameter entry</p>
            </div>
          </div>

          {/* Upload Dropzone Area */}
          <div
            className="bg-white border-gray-200 border-dashed border-2 rounded-xl p-8 md:p-12 text-center transition-all duration-300 relative shadow-sm hover:border-purple-500 hover:shadow-md cursor-pointer"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <CloudUpload size={44} className="text-purple-600 mx-auto mb-4 animate-[bounce_3s_infinite]" />
            <h2 className="text-xl font-bold mb-1">Import Entire Drive Directory</h2>
            <p className="text-sm text-gray-500 mb-5">
              Drag and drop files or folders to start indexing items immediately
            </p>

            <button
              className="bg-purple-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold tracking-wide shadow-sm hover:bg-purple-700 transition duration-150"
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
            >
              {isUploading ? 'Processing File Trees...' : 'Browse Drive Folder'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              webkitdirectory="true"
              directory="true"
              multiple
              className="hidden"
              onChange={handleFolderSelect}
            />
          </div>

          {/* Interactive Toolbar Filter options */}
          <div className="flex flex-wrap items-center gap-3 bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
            <div className="relative flex-1 min-w-[240px]">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search matching content metrics inside database..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && executeSearch(searchTerm)}
                className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              {isLoading && <LoaderCircle size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-600 animate-spin" />}
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="font-semibold">Type:</span>
              <select
                value={selectedExtension}
                onChange={(e) => setSelectedExtension(e.target.value)}
                className="px-2 py-1.5 bg-slate-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="">All Extensions</option>
                {supportedExtensions.map((ext) => (
                  <option key={ext} value={ext}>{ext.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="font-semibold">Size:</span>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="px-2 py-1.5 bg-slate-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="">Any size</option>
                <option value="small">Under 1 MB</option>
                <option value="medium">1 MB - 10 MB</option>
                <option value="large">10 MB+</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="font-semibold">Sort:</span>
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="px-2 py-1.5 bg-slate-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="relevance">Most relevant</option>
                <option value="newest">Newest Added</option>
                <option value="oldest">Oldest Added</option>
              </select>
            </div>
          </div>

          {/* Search history chips */}
          {history.length > 0 && (
            <div className="flex items-center gap-2 text-xs overflow-x-auto py-1">
              <span className="text-gray-400 shrink-0">Recent Queries:</span>
              {history.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => executeSearch(item)}
                  className="px-2.5 py-1 bg-slate-200/60 hover:bg-slate-200 text-gray-700 rounded-full shrink-0 transition"
                >
                  {item}
                </button>
              ))}
            </div>
          )}

          {/* Document Table Workspace Area */}
          {filteredDocuments.length > 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm overflow-hidden flex flex-col">
              <h3 className="text-lg font-bold mb-4">Imported Directory Documents ({filteredDocuments.length})</h3>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm text-left">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                      <th className="pb-3 font-semibold">File Name & Content Matches</th>
                      <th className="pb-3 font-semibold">Type</th>
                      <th className="pb-3 font-semibold">Size</th>
                      <th className="pb-3 text-center font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {filteredDocuments.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50 transition duration-150">
                        <td className="py-3 font-medium text-gray-900 max-w-md">
                          <div className="flex items-start gap-3">
                            <div className="mt-1">{getDocumentIcon(doc.extension)}</div>
                            <div className="min-w-0 flex-1">
                              <div className="truncate font-medium text-gray-900">{doc.fileName}</div>
                              <div className="text-[10px] text-gray-400 truncate max-w-[200px]" title={doc.path}>
                                {doc.path || 'Local upload path'}
                              </div>
                              {doc.content && (
                                <div className="text-xs text-purple-600 mt-1 bg-purple-50/50 rounded p-1 border border-purple-100/40 font-serif whitespace-normal break-all">
                                  {highlightSnippet(doc.content, searchTerm)}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className="bg-purple-50 text-purple-700 border border-purple-100 px-2 py-0.5 rounded text-xs font-mono uppercase font-medium">
                            {doc.extension}
                          </span>
                        </td>
                        <td className="py-3 text-gray-500 text-xs">{doc.size}</td>
                        <td className="py-3 text-center">
                          <div className="inline-flex gap-2 justify-center">
                            <button
                              className="inline-flex items-center gap-1 bg-purple-600 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium shadow-sm hover:bg-purple-700 transition"
                              onClick={() => openPreview(doc)}
                              title="Preview File"
                            >
                              <Eye size={13} />
                              Preview
                            </button>
                            <button
                              className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-gray-800 px-2.5 py-1.5 rounded-lg text-xs font-medium transition"
                              onClick={() => downloadFile(doc)}
                              title="Download File"
                            >
                              <Download size={13} />
                            </button>
                            <button
                              className="inline-flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded-lg text-xs font-medium transition"
                              onClick={() => deleteFile(doc.id)}
                              title="Delete Item"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center px-6 py-12 bg-white rounded-xl border border-gray-200 shadow-sm text-gray-400 text-sm">
              <Sparkles size={32} className="mx-auto mb-2 text-gray-300" />
              <p>No documents imported yet. Choose a workspace or folder root hierarchy above to begin parsing.</p>
            </div>
          ) : (
            <div className="text-center px-6 py-12 bg-white rounded-xl border border-gray-200 shadow-sm text-gray-400 text-sm">
              <p>No matching document details found matching the selection filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal Panel Layout Container */}
      {previewOpen && selectedFile && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000] backdrop-blur-sm animate-[fadeIn_0.2s_ease-in-out]" onClick={closePreview}>
          <div className="bg-white text-slate-900 rounded-xl max-w-3xl w-[92%] max-h-[85vh] overflow-hidden flex flex-col shadow-xl animate-[slideUp_0.2s_ease-out]" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-slate-50">
              <h2 className="text-base font-bold truncate max-w-md">{selectedFile.fileName}</h2>
              <div className="flex gap-2 items-center">
                <button
                  className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:bg-purple-700 transition"
                  onClick={() => downloadFile(selectedFile)}
                  title="Download File"
                >
                  <Download size={14} />
                  Download
                </button>
                <button
                  className="bg-gray-100 text-gray-700 p-1.5 rounded-lg hover:bg-gray-200 transition"
                  onClick={closePreview}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex gap-4 px-5 py-2 bg-slate-100/50 border-b border-gray-100 items-center text-xs text-gray-500">
              <span className="bg-purple-600 text-white px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">{selectedFile.extension}</span>
              <span>Size: {selectedFile.size}</span>
              <span>Modified: {selectedFile.lastModified}</span>
            </div>

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