import React from "react";
import Sidebar from '../components/sideBar/sideBar.jsx';
import Navbar from "../components/navBar/navBar.jsx";
function ManagerRequest(){
    return(
        <div className="flex h-screen flex-col overflow-hidden">
            <Navbar />
            <div className="flex flex-1 min-h-0">
                <Sidebar />
                <div className="flex min-w-0 flex-1 flex-col bg-slate-50 overflow-hidden">
                    <div className="shrink-0 border-b border-slate-200 bg-slate-50 p-6">
                        <h1 className="text-2xl font-semibold text-gray-900">Manager Request </h1>
                 
                            </div>
                        </div>
                    </div>
                </div>
            
    );
}

export default ManagerRequest;

