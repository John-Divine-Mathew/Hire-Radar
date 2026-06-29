import Sidebar from "../components/sideBar/sideBar";
import { Funnel, Eye, MoreVertical, UserKey, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { format } from 'date-fns';
import { useNavigate } from "react-router-dom";
import { nanoid } from 'nanoid';

function SavedCandidates(){
    const [candidates, setCandidates] = useState([]);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [credentials, setCredentials] = useState({});
    const [openCredentialMenuId, setOpenCredentialMenuId] = useState(null);
    const [copyText1, setCopyText1] = useState('Copy');
    const [copyText2, setCopyText2] = useState('Copy');

    const [searchVar, setSearchVar] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    
    // Upgraded states to mirror the structural search pattern cleanly
    const [activeFilters, setActiveFilters] = useState([]);
    const [filterValues, setFilterValues] = useState({});
    const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);
    const skillsRef = useRef(null);

    const filterOptions = ['Experience', 'Skills', 'Location', 'Role', 'Status'].sort();

    const dropdownOptions = {
        Experience: ['0-1 years', '1-3 years', '3-5 years', '5+ years'],
        Skills: ['React', 'Node.js', 'Python', 'Tailwind CSS', 'TypeScript'],
        Location: ['Remote', 'New York', 'San Francisco', 'London', 'India'],
        Role: ['Frontend Developer', 'Backend Developer', 'Fullstack Engineer', 'UI/UX Designer'],
        Status: ['Applied', 'Interviewing', 'Offered', 'Rejected']
    };

    // Close custom menu if focused outside component bounds
    useEffect(() => {
        function handleClickOutside(event) {
            if (skillsRef.current && !skillsRef.current.contains(event.target)) {
                setShowSkillsDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getListData = async () => {
        try {
            // Evaluates active entries dynamically for your query string context
            const primaryActive = activeFilters[0] || "";
            const field = primaryActive === "" ? 'cndname' : `cnd${primaryActive.toLowerCase().trim()}`;
            
            // Extracts current active parameters safely
            let currentSearchQuery = searchVar;
            if (primaryActive && filterValues[primaryActive]) {
                currentSearchQuery = Array.isArray(filterValues[primaryActive]) 
                    ? filterValues[primaryActive].join(',') 
                    : filterValues[primaryActive];
            }

            const response = (currentSearchQuery === "")
                ? await fetch(`http://localhost:5000/hireRadar/cndpermsave`)
                : await fetch(`http://localhost:5000/hireRadar/cndpermsavesearch/${field}and${currentSearchQuery.toLowerCase().trim()}`);
            
            const jsonData = await response.json();
            setCandidates(jsonData);
        } catch (err) {
            console.error(err.message);
        }
    }

    // List updates in real-time as search text or chosen dropdown entries alter
    useEffect(() => {
        getListData();
    }, [searchVar, filterValues, activeFilters]);

    function handleDropdownChange(filter, value) {
        setFilterValues((prev) => {
            const updated = { ...prev, [filter]: value };
            if (!value) delete updated[filter];
            return updated;
        });

        setActiveFilters((prev) => {
            if (value && !prev.includes(filter)) {
                return [...prev, filter].sort();
            } else if (!value && prev.includes(filter)) {
                return prev.filter((f) => f !== filter);
            }
            return prev;
        });
    }

    function handleSkillToggle(skill) {
        setFilterValues((prev) => {
            const currentSkills = prev['Skills'] || [];
            const updatedSkills = currentSkills.includes(skill)
                ? currentSkills.filter((s) => s !== skill)
                : [...currentSkills, skill];

            const updated = { ...prev, Skills: updatedSkills };
            if (updatedSkills.length === 0) delete updated['Skills'];
            return updated;
        });

        setActiveFilters((prev) => {
            const currentSkills = filterValues['Skills'] || [];
            const isSkillCurrentlySelected = currentSkills.includes(skill);
            const willHaveSkills = isSkillCurrentlySelected 
                ? currentSkills.length > 1 
                : true;

            if (willHaveSkills && !prev.includes('Skills')) {
                return [...prev, 'Skills'].sort();
            } else if (!willHaveSkills && prev.includes('Skills')) {
                return prev.filter((f) => f !== 'Skills');
            }
            return prev;
        });
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

            setCandidates(prev => prev.filter(c => String(c.cndid) !== String(ID)));
            setOpenMenuId(null);
        } catch (err) {
            console.error('deleteRecord error:', err.message || err);
        }
    }

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
            await response.json();
            
            setCredentials(prev => ({
                ...prev,
                [ID]: { username, password }
            }));
            setOpenMenuId(null);
        } catch (err) {
            console.error('generateCredentials error:', err.message || err);
        }
    }

    const copyToClipboard = (text, n) => {
        if(n===1){
            setCopyText1('✓');
            navigator.clipboard.writeText(text);
            setTimeout(() => {
                setCopyText1("Copy");
            }, 2000);
        } else {
            setCopyText2('✓');
            navigator.clipboard.writeText(text);
            setTimeout(() => {
                setCopyText2("Copy");
            }, 2000);
        }
    };

    return(
        <div style={{ display: "flex", minHeight: "100vh" }}>
            <Sidebar />
            <div className="flex-1 min-h-screen bg-slate-50 p-6 overflow-x-hidden">
                <div className="mb-6">
                    <h1 className="text-4xl font-bold text-gray-900 mb-6">Saved Candidates</h1>
                    
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col gap-4">
                        <div className="flex items-center justify-between gap-4">
                            <input 
                                type="text" 
                                placeholder={`Search saved candidates by ${activeFilters.length === 0 ? 'name' : activeFilters.join(', ').toLowerCase()} ...`}
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
                                value={searchVar}
                                onChange={(e)=>setSearchVar(e.target.value)}
                            />
                            <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition duration-200"
                                onClick={()=>{
                                    setSearchVar("");
                                    setActiveFilters([]);
                                    setFilterValues({});
                                }}>
                                Reset
                            </button>
                            
                            {/* Filter Button - Circular framework removed, plain active text styling remains */}
                            <button
                                className={`border-2 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition duration-200 bg-white ${
                                    showFilters || activeFilters.length > 0
                                        ? 'border-purple-600 text-purple-700'
                                        : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                                }`}
                                onClick={() => setShowFilters((prev) => !prev)}
                            >
                                <Funnel size={20} />
                                <span>Filters</span>
                                {activeFilters.length > 0 && (
                                    <span className="ml-1 text-purple-600 font-bold">
                                        {activeFilters.length}
                                    </span>
                                )}
                            </button>
                        </div>

                        {showFilters && (
                            <div className="flex flex-wrap gap-2 items-center pt-2 border-t border-gray-100">
                                {filterOptions.map((filter) => {
                                    const isActive = activeFilters.includes(filter);

                                    // MULTI-SELECT DISPLAY PATTERN FOR SKILLS
                                    if (filter === 'Skills') {
                                        const selectedSkills = filterValues['Skills'] || [];
                                        const displayLabel = selectedSkills.length > 0 
                                            ? `Skills (${selectedSkills.length})` 
                                            : 'Skills';

                                        return (
                                            <div key={filter} className="relative inline-block" ref={skillsRef}>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowSkillsDropdown((prev) => !prev)}
                                                    className={`pl-4 pr-10 py-2 rounded-lg transition duration-200 border-2 bg-white text-sm font-medium flex items-center gap-2 cursor-pointer ${
                                                        isActive
                                                            ? 'border-purple-600 text-purple-700'
                                                            : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {displayLabel}
                                                    <div className={`absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none ${
                                                        isActive ? 'text-purple-600' : 'text-gray-400'
                                                    }`}>
                                                        <ChevronDown size={16} strokeWidth={2.5} />
                                                    </div>
                                                </button>

                                                {showSkillsDropdown && (
                                                    <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-2 flex flex-col gap-1 max-h-60 overflow-y-auto">
                                                        {dropdownOptions.Skills.map((skill) => {
                                                            const isChecked = selectedSkills.includes(skill);
                                                            return (
                                                                <label 
                                                                    key={skill} 
                                                                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-purple-50 cursor-pointer text-sm text-gray-700 font-normal transition duration-150"
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isChecked}
                                                                        onChange={() => handleSkillToggle(skill)}
                                                                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 h-4 w-4"
                                                                    />
                                                                    {skill}
                                                                </label>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }

                                    // SINGLE SELECT MENUS
                                    return (
                                        <div key={filter} className="relative inline-block">
                                            <select
                                                value={filterValues[filter] ?? ''}
                                                onChange={(e) => handleDropdownChange(filter, e.target.value)}
                                                className={`appearance-none pl-4 pr-10 py-2 rounded-lg transition duration-200 border-2 bg-white text-sm font-medium cursor-pointer focus:outline-none tracking-wide ${
                                                    isActive
                                                        ? 'border-purple-600 text-purple-700'
                                                        : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                <option value="" className="text-gray-400 font-normal">{filter}</option>
                                                {dropdownOptions[filter]?.map((option) => (
                                                    <option key={option} value={option} className="text-gray-900 font-normal">
                                                        {option}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className={`absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none ${
                                                isActive ? 'text-purple-600' : 'text-gray-400'
                                            }`}>
                                                <ChevronDown size={16} strokeWidth={2.5} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
                
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
                                                    onClick={() => navigateSavedCandidateProfile(candidate.cndid)}
                                                    className="text-purple-600 hover:text-purple-800 transition duration-200"
                                                    title="View profile"
                                                >
                                                    <Eye size={20} />
                                                </button>
                                                {credentials[candidate.cndid] && (
                                                    <div className="credential-container relative inline-block">
                                                        <button 
                                                            className="text-gray-600 hover:text-gray-800 transition duration-200" 
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
                                                                        onClick={() => copyToClipboard(credentials[candidate.cndid].username,1)}
                                                                        className="text-xs text-purple-600 hover:text-purple-800"
                                                                    >
                                                                        {copyText1}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div className="px-3 py-2">
                                                                <p className="text-xs font-semibold text-gray-600 mb-1">Password</p>
                                                                <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                                                    <p className="text-sm font-mono text-gray-900">{credentials[candidate.cndid].password}</p>
                                                                    <button 
                                                                        onClick={() => copyToClipboard(credentials[candidate.cndid].password,2)}
                                                                        className="text-xs text-purple-600 hover:text-purple-800"
                                                                    >
                                                                        {copyText2}
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
                    
                    <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                        <p className="text-sm text-gray-700">Showing 1 to {candidates.length} of {candidates.length} results</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SavedCandidates;