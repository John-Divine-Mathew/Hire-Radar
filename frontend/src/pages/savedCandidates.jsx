import Sidebar from "../components/sideBar/sideBar";
import { Funnel, Eye, MoreVertical, UserKey } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from 'date-fns';
import { useNavigate } from "react-router-dom";
import { nanoid } from 'nanoid';

function SavedCandidates(){
    const [candidates, setCandidates] = useState([]);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [credentials, setCredentials] = useState({});
    const [openCredentialMenuId, setOpenCredentialMenuId] = useState(null);

    const getListData = async() => {
        try {
            const response = await fetch("http://localhost:5000/hireRadar/cndpermsave");
            const jsonData = await response.json();
            setCandidates(jsonData);
        } catch (err) {
            console.error(err.message);
        }
    }

    async function deleteRecord(ID){
        try {
            const response = await fetch(`http://localhost:5000/hireRadar/deleteCandidate/${String(ID)}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || 'Delete request failed');
            }

            // Remove from local state after successful delete
            setCandidates(prev => prev.filter(c => String(c.cndid) !== String(ID)));
            setOpenMenuId(null);
        } catch (err) {
            console.error('deleteRecord error:', err.message || err);
        }
    }

    useEffect(() => {
        getListData();
    }, []);

    useEffect(() => {
        function handleClickOutside(event) {
            const menuContainers = document.querySelectorAll('.menu-container');
            let clickedInsideMenu = false;
            
            menuContainers.forEach(container => {
                if (container.contains(event.target)) {
                    clickedInsideMenu = true;
                }
            });
            
            if (!clickedInsideMenu) {
                setOpenMenuId(null);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        function handleClickOutside(event) {
            const credentialContainers = document.querySelectorAll('.credential-container');
            let clickedInsideMenu = false;
            
            credentialContainers.forEach(container => {
                if (container.contains(event.target)) {
                    clickedInsideMenu = true;
                }
            });
            
            if (!clickedInsideMenu) {
                setOpenCredentialMenuId(null);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleMenu = (id) => {
        setOpenMenuId(openMenuId === id ? null : id);
    };

    const toggleCredentialMenu = (id) => {
        setOpenCredentialMenuId(openCredentialMenuId === id ? null : id);
    };

    const nav = useNavigate();
    function navigateSavedCandidateProfile(id){
        nav('/candidateProfile',{state:{tempCndId:null, permCndId:id}});
    }

    async function generateCredentials(ID){
        try {
            const username = nanoid(5);
            const password = nanoid(10);
            const response = await fetch("http://localhost:5000/hireRadar/insertTestDetails", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({'cndid':ID, 'username':username, 'password':password})
            });
            const result = await response.json();
            
            // Store credentials in state
            setCredentials(prev => ({
                ...prev,
                [ID]: { username, password }
            }));
            setOpenMenuId(null);
        } catch (err) {
            console.error('generateCredentials error:', err.message || err);
        }
    }

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // alert('Copied to clipboard!');
    };

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
                                                {credentials[candidate.cndid] && (
                                                    <div className="credential-container relative inline-block">
                                                        <button 
                                                            className="text-grey-600 hover:text-grey-800 transition duration-200" 
                                                            title="View credentials"
                                                            onClick={() => toggleCredentialMenu(candidate.cndid)}
                                                        >
                                                            <UserKey size={20} />
                                                        </button>
                                                        <div className={`absolute right-full top-1/2 -translate-y-1/2 -mr-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50 transition-opacity duration-200 ${openCredentialMenuId === candidate.cndid ? 'block opacity-100' : 'hidden opacity-0'}`}>
                                                            <div className="px-3 py-2 border-b border-gray-200 mb-2">
                                                                <p className="text-xs font-semibold text-gray-600 mb-1">Username</p>
                                                                <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                                                    <p className="text-sm font-mono text-gray-900">{credentials[candidate.cndid].username}</p>
                                                                    <button 
                                                                        onClick={() => copyToClipboard(credentials[candidate.cndid].username)}
                                                                        className="text-xs text-purple-600 hover:text-purple-800"
                                                                    >
                                                                        Copy
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div className="px-3 py-2">
                                                                <p className="text-xs font-semibold text-gray-600 mb-1">Password</p>
                                                                <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                                                    <p className="text-sm font-mono text-gray-900">{credentials[candidate.cndid].password}</p>
                                                                    <button 
                                                                        onClick={() => copyToClipboard(credentials[candidate.cndid].password)}
                                                                        className="text-xs text-purple-600 hover:text-purple-800"
                                                                    >
                                                                        Copy
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="menu-container relative inline-block">
                                                    <button 
                                                        className="text-gray-400 hover:text-gray-600 transition duration-200" 
                                                        title="More options"
                                                        onClick={() => toggleMenu(candidate.cndid)}
                                                    >
                                                        <MoreVertical size={20} />
                                                    </button>
                                                    <div className={`absolute right-full top-1/2 -translate-y-1/2 -mr-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50 transition-opacity duration-200 ${openMenuId === candidate.cndid ? 'block opacity-100' : 'hidden opacity-0'}`} id={`popupBox-${candidate.cndid}`}>
                                                        <a onClick={() => alert('Edit: ' + candidate.cndname)} className="block px-3 py-2 text-gray-700 text-sm rounded hover:bg-gray-100 cursor-pointer transition duration-150">Edit</a>
                                                        <a onClick={() => deleteRecord(candidate.cndid)} className="block px-3 py-2 text-gray-700 text-sm rounded hover:bg-gray-100 cursor-pointer transition duration-150">Delete</a>
                                                        <a onClick={() => alert('Send Message: ' + candidate.cndname)} className="block px-3 py-2 text-gray-700 text-sm rounded hover:bg-gray-100 cursor-pointer transition duration-150">Send Message</a>
                                                        <a onClick={() => generateCredentials(candidate.cndid)} className="block px-3 py-2 text-gray-700 text-sm rounded hover:bg-gray-100 cursor-pointer transition duration-150">Generate Credentials</a>
                                                    </div>
                                                </div>
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