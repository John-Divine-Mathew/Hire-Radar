import Sidebar from "../../components/sideBar/sideBar";
import { Funnel, Eye, MoreVertical } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from 'date-fns';
import { useNavigate } from "react-router-dom";

function SavedCandidates(){
    const [candidates, setCandidates] = useState([]);

    const getListData = async() => {
        try {
            const response = await fetch("http://localhost:5000/hireRadar/cndpermsave");
            const jsonData = await response.json();
            setCandidates(jsonData);
        } catch (err) {
            console.error(err.message);
        }
    }

    useEffect(() => {
        getListData();
    }, []);

    const nav = useNavigate();
    function navigateSavedCandidateProfile(id){
        nav('/candidateProfile',{state:{tempCndId:null, permCndId:id}});
    }

    return(
        <div style={{ display: "flex", minHeight: "100vh" }}>
            <Sidebar />
            <div className="flex-1 min-h-screen bg-slate-50 p-6 overflow-x-hidden">
                {/* Header Section */}
                <div className="mb-6">
                    <h1 className="text-4xl font-bold text-gray-900 mb-6">Saved Candidates</h1>
                    
                    {/* Search and Filter Bar */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center justify-between">
                        <input 
                            type="text" 
                            placeholder="Search saved candidates..." 
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
                        />
                        <button className="ml-4 border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition duration-200">
                            <Funnel size={20} />
                            <span>Filter</span>
                        </button>
                    </div>
                </div>
                
                {/* Table Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden max-h-[calc(100vh-280px)] flex flex-col">
                    <div className="overflow-x-auto flex-1 overflow-y-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Candidate</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Role</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Experience</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Match Score</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Saved On</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {candidates.map((candidate) => (
                                    <tr key={candidate.cndid} className="hover:bg-gray-50 transition duration-150">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img 
                                                    src={candidate.cndphoto} 
                                                    alt={candidate.cndname} 
                                                    className="h-12 w-12 rounded-full object-cover"
                                                />
                                                <div>
                                                    <p className="font-semibold text-gray-900">{candidate.cndname}</p>
                                                    <p className="text-sm text-gray-600">{candidate.cndlocation}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">{candidate.cndrole}</td>
                                        <td className="px-6 py-4 text-gray-700">{candidate.cndexperience}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                                                {candidate.matchScore || '80%'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">{candidate.searchDate || format(new Date(), 'dd/MM/yyyy')}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <button 
                                                    onClick={()=>navigateSavedCandidateProfile(candidate.cndid)}
                                                    className="text-purple-600 hover:text-purple-800 transition duration-200"
                                                    title="View profile"
                                                >
                                                    <Eye size={20} />
                                                </button>
                                                <button className="text-gray-400 hover:text-gray-600 transition duration-200" title="More options">
                                                    <MoreVertical size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination */}
                    <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                        <p className="text-sm text-gray-700">Showing 1 to {candidates.length} of {candidates.length} results</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SavedCandidates;