import React, { useState, useEffect } from 'react';
import Sidebar from '../components/sideBar/sideBar.jsx';
import Navbar from "../components/navBar/navBar.jsx";

// Adjust this URL to point to your backend API server address
const API_BASE_URL = 'http://localhost:5000/api';

function QuestionBank() {
    // Core Layout States
    const [departments, setDepartments] = useState([]);
    const [selectedDept, setSelectedDept] = useState(null);
    const [selectedDifficulty, setSelectedDifficulty] = useState('');
    const [showLevelModal, setShowLevelModal] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);

    // Question Editing Management States
    const [editingId, setEditingId] = useState(null);
    const [editingText, setEditingText] = useState('');

    // Fetch unique departments from your database assessment records on layout mount
    useEffect(() => {
        fetch(`${API_BASE_URL}/departments`)
            .then((res) => res.json())
            .then((data) => setDepartments(data))
            .catch((err) => {
                console.error('Error fetching departments:', err);
                // Secure fallback labels if your database is completely empty during initialization
                setDepartments(['Software Development', 'HR', 'Marketing', 'Sales', 'Finance']);
            });
    }, []);

    // Handles querying database entries based on dynamic filter switches
    const fetchQuestions = (dept, difficulty) => {
        setLoading(true);
        fetch(`${API_BASE_URL}/questions?department=${encodeURIComponent(dept)}&difficulty=${difficulty}`)
            .then((res) => res.json())
            .then((data) => {
                setQuestions(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching questions:', err);
                setLoading(false);
            });
    };

    const handleDeptClick = (dept) => {
        setSelectedDept(dept);
        setShowLevelModal(true);
    };

    const handleDifficultySelect = (level) => {
        setSelectedDifficulty(level);
        setShowLevelModal(false);
        fetchQuestions(selectedDept, level);
    };

    const handleStartEdit = (q) => {
        setEditingId(q.id);
        setEditingText(q.question_text);
    };

    const handleSaveEdit = (id) => {
        if (!editingText.trim()) return;

        fetch(`${API_BASE_URL}/questions/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question_text: editingText }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    // Instantly patch UI local array state 
                    setQuestions(prev =>
                        prev.map(q => (q.id === id ? { ...q, question_text: editingText } : q))
                    );
                    setEditingId(null);
                } else {
                    alert('Failed to save update execution context.');
                }
            })
            .catch((err) => console.error('Error updating question structure:', err));
    };

    return (
        <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-50">
            {/* Top Sticky Navbar */}
            <Navbar />
            
            {/* Main Page Layout Container */}
            <div className="flex flex-1 min-h-0 w-full overflow-hidden">
                {/* Left Navigation Sidebar */}
                <Sidebar />
                
                {/* Core Content Area */}
                <div className="flex-1 flex overflow-hidden min-w-0 h-full p-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
                        
                        {/* Header Area */}
                        <div className="mb-6 shrink-0 border-b border-gray-100 pb-4 flex justify-between items-end">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Question Bank</h2>
                                <p className="text-sm text-gray-500 mt-1">Manage and organize your assessment questions here.</p>
                            </div>
                            {selectedDept && selectedDifficulty && (
                                <div className="flex gap-2">
                                    <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                                        {selectedDept}
                                    </span>
                                    <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100">
                                        {selectedDifficulty} Level
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Scrollable Main Content Container */}
                        <div className="flex-1 min-h-0 overflow-y-auto pr-1 text-gray-700 text-sm">
                            
                            {/* Department Grid Header Selector */}
                            <div className="mb-8">
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Select Department Folder</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                    {departments.map((dept) => (
                                        <button
                                            key={dept}
                                            onClick={() => handleDeptClick(dept)}
                                            className={`p-4 rounded-xl border text-left transition duration-150 font-medium ${
                                                selectedDept === dept
                                                    ? 'border-blue-500 bg-blue-50/50 text-blue-700 ring-2 ring-blue-500/20'
                                                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="text-gray-900 font-semibold">{dept}</div>
                                            <div className="text-xs text-gray-400 mt-1 font-normal">Click to browse levels</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Question Entries Output Render Engine */}
                            {selectedDept && selectedDifficulty ? (
                                <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                                    <div className="bg-gray-50/70 border-b border-gray-200 px-4 py-3 flex justify-between items-center">
                                        <span className="font-semibold text-gray-700">Allotted Dynamic Assessment Questions</span>
                                        <button 
                                            onClick={() => setShowLevelModal(true)} 
                                            className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                                        >
                                            Change Target Difficulty Level →
                                        </button>
                                    </div>

                                    {loading ? (
                                        <div className="text-center py-12 text-gray-400">Loading dynamic question indices...</div>
                                    ) : questions.length === 0 ? (
                                        <div className="text-center py-16 text-gray-400">
                                            <p className="font-medium mb-1">No active questions found</p>
                                            <p className="text-xs text-gray-400">There are no records for {selectedDept} ({selectedDifficulty} Level).</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-200">
                                            {questions.map((q) => (
                                                <div key={q.id} className="p-4 flex items-start gap-4 hover:bg-gray-50/50 transition">
                                                    <span className="font-mono text-xs text-gray-400 mt-1 bg-gray-100 px-2 py-0.5 rounded">ID #{q.id}</span>
                                                    <div className="flex-1 min-w-0">
                                                        {editingId === q.id ? (
                                                            <textarea
                                                                rows="2"
                                                                value={editingText}
                                                                onChange={(e) => setEditingText(e.target.value)}
                                                                className="w-full text-sm p-3 border border-blue-400 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 bg-white shadow-inner"
                                                            />
                                                        ) : (
                                                            <p className="text-gray-900 text-sm leading-relaxed whitespace-pre-line">{q.question_text}</p>
                                                        )}
                                                    </div>
                                                    <div className="shrink-0 ml-4">
                                                        {editingId === q.id ? (
                                                            <div className="flex gap-1.5">
                                                                <button
                                                                    onClick={() => handleSaveEdit(q.id)}
                                                                    className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-700 transition"
                                                                >
                                                                    Save
                                                                </button>
                                                                <button
                                                                    onClick={() => setEditingId(null)}
                                                                    className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-200 transition"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleStartEdit(q)}
                                                                className="inline-flex items-center gap-1.5 border border-gray-200 text-gray-600 bg-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:border-gray-300 hover:text-gray-800 transition shadow-sm"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                                Modify
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-12 bg-slate-25/50 text-center text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                    <p className="text-gray-500 font-medium">No Department Target Selected</p>
                                    <p className="text-xs text-gray-400 mt-1 max-w-xs">Select a department workspace bubble from above to filter and manage active assessment tasks.</p>
                                </div>
                            )}

                        </div>

                    </div>
                </div>
            </div>

            {/* 4. Trigger Pop-Up Filter Prompt Modal */}
            {showLevelModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-bold text-gray-900">Select Question Type</h3>
                            <button
                                onClick={() => setShowLevelModal(false)}
                                className="text-gray-400 hover:text-gray-600 text-xl font-semibold leading-none"
                            >
                                &times;
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mb-5">
                            Target routing workspace: <span className="font-semibold text-blue-600">{selectedDept}</span>
                        </p>
                        
                        <div className="space-y-2.5">
                            {[
                                { key: 'Beginner', label: 'Beginner level questions' },
                                { key: 'Moderate', label: 'Moderate level questions' },
                                { key: 'Advanced', label: 'Advanced level questions' }
                            ].map((level) => (
                                <button
                                    key={level.key}
                                    onClick={() => handleDifficultySelect(level.key)}
                                    className="w-full py-3 px-4 rounded-xl text-left border border-gray-200 hover:border-blue-500 hover:bg-blue-50/50 text-gray-700 font-medium transition duration-100 flex justify-between items-center group"
                                >
                                    <span>{level.label}</span>
                                    <span className="text-gray-300 group-hover:text-blue-500 transition text-sm">→</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default QuestionBank;