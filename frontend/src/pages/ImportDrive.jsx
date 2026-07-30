import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CloudUpload,
  Search,
  Download,
  Eye,
  Trash2,
  FileText,
  FileSpreadsheet,
  FileArchive,
  LoaderCircle,
  X,
} from 'lucide-react';
import Sidebar from '../components/sideBar/sideBar.jsx';
import Navbar from '../components/navBar/navBar.jsx';

const API_BASE_URL = 'http://localhost:5000';
const KNOWN_SPECIAL_EXTS = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'xlsx', 'xls', 'csv', 'json'];

function ImportDrive() {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Updated Upload States (Removed pendingAnalysis queue)
  const [isUploading, setIsUploading] = useState(false);
  const [extractionStatus, setExtractionStatus] = useState(''); 
  
  const [selectedExtension, setSelectedExtension] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedSort, setSelectedSort] = useState('relevance');
  const [history, setHistory] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [viewMode, setViewMode] = useState('native');
  const [previewSrc, setPreviewSrc] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const supportedExtensions = useMemo(
    () => ['pdf', 'doc', 'docx', 'txt', 'csv', 'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'ppt', 'pptx', 'xls', 'xlsx'],
    []
  );

  const normalizeExt = (value) => (value || '').toString().trim().toLowerCase().replace(/^\./, '');

  const isValidFile = (fileName) => {
    if (!fileName) return false;
    const ext = normalizeExt(fileName.split('.').pop());
    const isTemporary = fileName.startsWith('~$');
    const isZip = ext === 'zip';
    return !isTemporary && !isZip && supportedExtensions.includes(ext);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0 || !bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1)) + ' ' + sizes[i];
  };

  // ==========================================================================
  // FETCH FROM BACKEND DATABASE
  // ==========================================================================
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
      
      const normalizedData = data.map((doc) => ({
        id: doc.id,
        cndid: doc.cndid, 
        fileName: doc.fileName,
        extension: normalizeExt(doc.extension) || normalizeExt(doc.fileName?.split('.').pop()),
        size: doc.fileSizeLabel || formatFileSize(doc.file_size || doc.sizeBytes),
        sizeBytes: doc.file_size || doc.sizeBytes || 0,
        lastModified: doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : new Date().toLocaleDateString(),
        blobURL: `${API_BASE_URL}/api/documents/${doc.id}/preview`,
        downloadURL: `${API_BASE_URL}/api/documents/${doc.id}/download`,
        content: doc.extractedText || '',
        nlpEntities: doc.nlpEntities || [],
        username: doc.username,
        documentStatus: doc.documentStatus
      }));
      
      setDocuments(normalizedData);
    } catch (err) {
      console.error('Unable to fetch search index from server backend:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBackendDocuments('', '', '', 'newest');
  }, []);

  // Handle Filtering & Sorting
  useEffect(() => {
    setIsLoading(true);
    let result = [...documents];

    if (searchTerm.trim() !== '') {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(
        (doc) =>
          doc.fileName.toLowerCase().includes(lowerSearch) ||
          (doc.content && doc.content.toLowerCase().includes(lowerSearch))
      );
    }

    if (selectedExtension) {
      result = result.filter((doc) => doc.extension.toLowerCase() === selectedExtension.toLowerCase());
    }

    if (selectedSize) {
      result = result.filter((doc) => {
        const sizeInMb = doc.sizeBytes / (1024 * 1024);
        if (selectedSize === 'small') return sizeInMb < 1;
        if (selectedSize === 'medium') return sizeInMb >= 1 && sizeInMb <= 10;
        if (selectedSize === 'large') return sizeInMb > 10;
        return true;
      });
    }

    if (selectedSort === 'newest') {
      result.sort((a, b) => b.id - a.id);
    } else if (selectedSort === 'oldest') {
      result.sort((a, b) => a.id - b.id);
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

  // ==========================================================================
  // UPDATED SYNCHRONOUS BACKEND UPLOAD WORKFLOW 
  // ==========================================================================
const handleFolderSelect = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setExtractionStatus('Extracting text & running AI Analysis. Saving to database...');

    // Asynchronously warm up Ollama model
    fetch(`${API_BASE_URL}/api/warm-ollama`, { method: 'POST' }).catch(() => {});

    // Resolve logged in user to send with upload payload
    const currentUser = (() => {
      try {
        return JSON.parse(localStorage.getItem('user'));
      } catch (e) {
        return null;
      }
    })();
    const username = currentUser?.name || currentUser?.email || 'HR Admin';

    const formData = new FormData();
    formData.append('username', username);

    for (let i = 0; i < files.length; i++) {
      if (isValidFile(files[i].name)) {
        formData.append('file', files[i]);
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setExtractionStatus('Upload & Database Sync Complete!');
        await fetchBackendDocuments('', '', '', 'newest'); 
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Upload failed.');
      }
    } catch (uploadErr) {
      console.error('Failed uploading files to server backend:', uploadErr);
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setExtractionStatus('');
      }, 2000);
      if (event.target) event.target.value = '';
    }
  };

  // ==========================================================================
  // UI HANDLERS
  // ==========================================================================
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploading) e.currentTarget.classList.add('bg-purple-50', 'border-purple-500', 'scale-[1.01]');
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
    if (!isUploading) await handleFolderSelect(e);
  };

  const openPreview = async (file) => {
    setSelectedFile(file);
    setPreviewOpen(true);
    setViewMode('native');
    setPreviewSrc(file.blobURL);
  };

  const closePreview = () => {
    setPreviewOpen(false);
    setSelectedFile(null);
    setViewMode('native');
    setPreviewSrc(null);
    setPreviewLoading(false);
  };

  const downloadFile = (file) => {
    if (!file) return;
    window.open(file.downloadURL || `${API_BASE_URL}/api/documents/${file.id}/download`, '_blank');
  };

  const deleteFile = async (id) => {
    if(!window.confirm("Delete this document? (Note: To delete the candidate completely, use the Candidates Dashboard)")) return;
    try {
      await fetch(`${API_BASE_URL}/api/documents/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Delete API request failed:', err);
    }
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    if (selectedFile?.id === id) closePreview();
  };

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
    const ext = normalizeExt(extension);
    if (ext === 'pdf') return <FileText className="text-red-500 w-5 h-5" />;
    if (['docx', 'doc'].includes(ext)) return <FileText className="text-blue-500 w-5 h-5" />;
    if (['xlsx', 'xls', 'csv'].includes(ext)) return <FileSpreadsheet className="text-green-500 w-5 h-5" />;
    if (ext === 'txt') return <FileText className="text-slate-500 w-5 h-5" />;
    return <FileArchive className="text-amber-500 w-5 h-5" />;
  };

  const renderPreviewContent = () => {
    if (!selectedFile) return null;
    const ext = normalizeExt(selectedFile.extension);
    const content = selectedFile.content || '';

    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) {
      return (
        <div className="w-full flex flex-col h-[68vh] rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between shrink-0">
            <span className="text-xs font-medium text-slate-500">Image Display Options:</span>
            <div className="flex bg-slate-200/80 p-0.5 rounded-lg border border-slate-300/40">
              <button
                onClick={() => setViewMode('native')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  viewMode === 'native' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Native Image View
              </button>
              <button
                onClick={() => setViewMode('extracted')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  viewMode === 'extracted' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Extracted Text (DB)
              </button>
            </div>
          </div>
          <div className="flex-1 min-h-0 bg-slate-200/50 overflow-y-auto p-4 flex items-center justify-center">
            {viewMode === 'native' ? (
              previewLoading ? (
                <div className="flex items-center gap-2 text-slate-400">
                  <LoaderCircle size={18} className="animate-spin" /> Loading preview…
                </div>
              ) : previewSrc ? (
                <img src={previewSrc} alt={selectedFile.fileName} className="max-w-full max-h-[58vh] object-contain rounded-lg shadow-sm select-none" />
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                  <p className="italic font-sans">Unable to load an inline preview for this image.</p>
                </div>
              )
            ) : (
              <div className="w-full h-fit min-h-full bg-white p-8 md:p-12 font-sans text-slate-800 text-sm max-w-2xl shadow-md border border-slate-200/80 rounded-lg">
                {content ? (
                  <div className="whitespace-pre-wrap break-words leading-relaxed text-left font-mono text-[13px] text-slate-700">{content}</div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                    <p className="italic font-sans">No text found inside this image layer.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (ext === 'pdf') {
      return (
        <div className="w-full flex flex-col h-[68vh] rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between shrink-0">
            <span className="text-xs font-medium text-slate-500">Document Engine Display Options:</span>
            <div className="flex bg-slate-200/80 p-0.5 rounded-lg border border-slate-300/40">
              <button
                onClick={() => setViewMode('native')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  viewMode === 'native' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Native Document View
              </button>
              <button
                onClick={() => setViewMode('extracted')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  viewMode === 'extracted' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Extracted Text Layer
              </button>
            </div>
          </div>
          <div className="flex-1 min-h-0 bg-slate-200/50 overflow-y-auto p-4 flex justify-center">
            {viewMode === 'native' ? (
              previewLoading ? (
                <div className="flex items-center gap-2 text-slate-400 self-center">
                  <LoaderCircle size={18} className="animate-spin" /> Loading document…
                </div>
              ) : previewSrc ? (
                <iframe src={`${previewSrc}#toolbar=1&navpanes=0`} title={selectedFile.fileName} className="w-full h-full border-none bg-slate-500 rounded-lg shadow-sm" />
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-slate-400 self-center">
                  <p className="italic font-sans">Unable to load an inline preview for this document.</p>
                </div>
              )
            ) : (
              <div className="w-full h-fit min-h-full bg-white p-8 md:p-12 font-sans text-slate-800 text-sm max-w-2xl shadow-md border border-slate-200/80 rounded-lg">
                {content ? (
                  <div className="whitespace-pre-wrap break-words leading-relaxed text-left font-mono text-[13px] text-slate-700">{content}</div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                    <p className="italic font-sans">No text found inside this PDF layer.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (['xlsx', 'xls', 'csv'].includes(ext)) {
      const rows = content.split('\n').filter((row) => row.trim());
      const getExcelColLabel = (index) => String.fromCharCode(65 + (index % 26));
      return (
        <div className="w-full max-h-[66vh] overflow-auto bg-slate-50 rounded-xl border border-slate-200 shadow-inner flex flex-col">
          <div className="overflow-x-auto overflow-y-auto w-full">
            <table className="w-full border-collapse text-xs text-left font-sans table-fixed min-w-[800px]">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 sticky top-0 z-20 shadow-[0_1px_0_rgba(0,0,0,0.05)]">
                  <th className="w-10 bg-slate-200 text-center border-r border-slate-300 p-1.5 text-[10px] font-bold text-slate-500 font-mono sticky left-0 z-30"></th>
                  {rows[0] &&
                    rows[0].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((_, idx) => (
                        <th key={idx} className="w-[160px] p-2 bg-slate-100 text-slate-600 font-semibold font-mono border-r border-slate-300 text-center tracking-wider text-[11px]">
                          {getExcelColLabel(idx)}
                        </th>
                      ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {rows.map((row, rIdx) => {
                  const cells = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
                  return (
                    <tr key={rIdx} className="hover:bg-purple-50/30 group transition-colors">
                      <td className="bg-slate-50 border-r border-slate-300 text-center p-1.5 font-mono text-[10px] text-slate-400 font-medium sticky left-0 z-10 group-hover:bg-purple-100/50 group-hover:text-purple-700 transition-colors">
                        {rIdx + 1}
                      </td>
                      {cells.map((cell, cIdx) => {
                        const formattedValue = cell.replace(/^"|font="/g, '').replace(/"$/g, '').trim();
                        return (
                          <td key={cIdx} title={formattedValue} className={`p-2.5 border-r border-slate-200 truncate font-normal text-slate-700 tracking-wide ${rIdx === 0 ? 'bg-slate-50/80 font-medium text-slate-900' : ''}`}>
                            {formattedValue || <span className="text-slate-300 font-serif">-</span>}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (ext === 'json') {
      try {
        const parsed = typeof content === 'object' ? content : JSON.parse(content);
        const jsonStr = JSON.stringify(parsed, null, 2);
        return (
          <div className="w-full max-h-[65vh] overflow-auto bg-slate-950 p-6 rounded-xl font-mono text-xs shadow-xl leading-relaxed border border-slate-800">
            <pre className="text-slate-300 whitespace-pre-wrap break-all">
              {jsonStr.split('\n').map((line, lIdx) => {
                let styledLine = line;
                if (line.includes('":')) {
                  const parts = line.split('":');
                  styledLine = (
                    <span>
                      <span className="text-purple-400">{parts[0]}"</span>
                      <span className="text-slate-400">:</span>
                      <span className="text-emerald-400">{parts.slice(1).join('":')}</span>
                    </span>
                  );
                }
                return <div key={lIdx} className="hover:bg-slate-900/40 px-2 py-0.5 rounded transition-colors">{styledLine}</div>;
              })}
            </pre>
          </div>
        );
      } catch (e) {}
    }

    if (['txt', 'docx', 'doc'].includes(ext) || (content && !KNOWN_SPECIAL_EXTS.includes(ext))) {
      const paragraphs = content.split('\n');
      return (
        <div className="w-full max-h-[66vh] overflow-auto bg-white px-10 py-12 md:px-16 md:py-14 rounded-xl border border-slate-200 shadow-md max-w-2xl font-serif text-slate-800 leading-loose text-[14px] text-justify space-y-5">
          {paragraphs.map((para, idx) => {
            const trimmed = para.trim();
            if (!trimmed) return <div key={idx} className="h-3" />;
            if (trimmed.length < 75 && (trimmed.toUpperCase() === trimmed || trimmed.endsWith(':') || trimmed.startsWith('##'))) {
              return <h4 key={idx} className="font-sans font-bold text-base text-slate-900 pt-4 tracking-tight border-b border-slate-100 pb-1">{trimmed.replace(/^##\s*/, '')}</h4>;
            }
            return <p key={idx} className="text-slate-700 indent-2 tracking-wide font-normal">{trimmed}</p>;
          })}
        </div>
      );
    }

    return (
      <div className="text-center p-12 bg-white rounded-xl border border-slate-200 shadow-sm max-w-sm mx-auto">
        <p className="font-bold text-slate-800 text-base">Preview Not Supported</p>
        <p className="text-xs text-slate-400 mt-1 mb-6">This file node cannot be displayed inline inside your web app workspace window view.</p>
        <button
          onClick={() => downloadFile(selectedFile)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition active:scale-95 shadow-sm"
        >
          <Download size={13} /> Download Document File
        </button>
      </div>
    );
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-50 text-slate-900">
      <Navbar />

      <div className="flex flex-1 min-h-0 w-full overflow-hidden">
        <Sidebar />

        <div className="flex-1 p-6 md:p-10 space-y-6 min-w-0 overflow-y-auto h-full">
          <div className="flex justify-between items-center mb-2 shrink-0">
            <div>
              <h1 className="text-2xl font-bold">Import Workspace</h1>
              <p className="text-sm text-gray-500">
                Upload directory document roots to index and search file content via PostgreSQL.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total documents</p>
              <h3 className="text-2xl font-bold mt-1">{documents.length}</h3>
              <p className="text-xs text-gray-400 mt-1">Files tracked in database</p>
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

          <div
            className="bg-white border-gray-200 border-dashed border-2 rounded-xl p-8 md:p-12 text-center transition-all duration-300 relative shadow-sm hover:border-purple-500 hover:shadow-md cursor-pointer flex flex-col items-center justify-center"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
          >
            {isUploading && (
               <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-xl">
                   <LoaderCircle size={40} className="text-purple-600 animate-spin mb-4" />
                   <h3 className="font-bold text-lg text-slate-800 animate-pulse">{extractionStatus}</h3>
                   <p className="text-sm text-slate-500 mt-2">Uploading and AI extraction in progress...</p>
               </div>
            )}
            
            <CloudUpload size={44} className="text-purple-600 mx-auto mb-4 animate-[bounce_3s_infinite]" />
            <h2 className="text-xl font-bold mb-1">Import Server Database</h2>
            <p className="text-sm text-gray-500 mb-5">
              Drag and drop files to automatically run AI extraction and sync to database.
            </p>

            <button
              className="bg-purple-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold tracking-wide shadow-sm hover:bg-purple-700 transition duration-150"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              Browse Local Folder
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

          <div className="flex flex-wrap items-center gap-3 bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
            <div className="relative flex-1 min-w-[240px]">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search matching content metrics..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && executeSearch(searchTerm)}
                className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              {isLoading && (
                <LoaderCircle size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-600 animate-spin" />
              )}
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
                  <option key={ext} value={ext}>
                    {ext.toUpperCase()}
                  </option>
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

          {filteredDocuments.length > 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm overflow-hidden flex flex-col">
              <h3 className="text-lg font-bold mb-4">PostgreSQL Document Records ({filteredDocuments.length})</h3>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm text-left">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                      <th className="pb-3 font-semibold">File Name & Content Matches</th>
                      <th className="pb-3 font-semibold">Type</th>
                      <th className="pb-3 font-semibold">Size</th>
                      <th className="pb-3 font-semibold text-center">Uploaded By</th>
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
                          <span className="text-slate-400 font-mono font-medium text-xs">{doc.username || 'HR Admin'}</span>
                        </td>
                        <td className="py-3 text-center">
                          <div className="inline-flex gap-2 justify-center">
                            <button
                              className="inline-flex items-center gap-1 bg-purple-600 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium shadow-sm hover:bg-purple-700 transition"
                              onClick={() => openPreview(doc)}
                              title="Preview File"
                            >
                              <Eye size={13} /> Preview
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
              <p>No documents found in database. Upload a file above to begin.</p>
            </div>
          ) : (
            <div className="text-center px-6 py-12 bg-white rounded-xl border border-gray-200 shadow-sm text-gray-400 text-sm">
              <p>No matching document details found matching the selection filters.</p>
            </div>
          )}
        </div>
      </div>

      {previewOpen && selectedFile && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000] backdrop-blur-sm" onClick={closePreview}>
          <div className="bg-white text-slate-900 rounded-xl max-w-3xl w-[92%] max-h-[85vh] overflow-hidden flex flex-col shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-slate-50">
              <h2 className="text-base font-bold truncate max-w-md">{selectedFile.fileName}</h2>
              <div className="flex gap-2 items-center">
                <button
                  className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:bg-purple-700 transition"
                  onClick={() => downloadFile(selectedFile)}
                >
                  <Download size={14} /> Download
                </button>
                <button className="bg-gray-100 text-gray-700 p-1.5 rounded-lg hover:bg-gray-200" onClick={closePreview}>
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