import React from 'react';
import Sidebar from '../components/sideBar/sideBar.jsx';
import Navbar from "../components/navBar/navBar.jsx";

function QuestionBank() {
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
                        <div className="mb-6 shrink-0 border-b border-gray-100 pb-4">
                            <h2 className="text-2xl font-bold text-gray-900">Question Bank</h2>
                            <p className="text-sm text-gray-500 mt-1">Manage and organize your assessment questions here.</p>
                        </div>

                        {/* Scrollable Main Content Container */}
                        <div className="flex-1 min-h-0 overflow-y-auto pr-1 text-gray-700 text-sm">
                            {/* Your custom question bank dashboard content or lists go here */}
                            <div className="flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-12 bg-slate-25 text-center text-gray-400">
                                <p>Question bank workspace records placeholder.</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default QuestionBank;