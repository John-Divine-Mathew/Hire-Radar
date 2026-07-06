import { Bookmark, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { v4 as uuid } from "uuid";

function RenderList({ var1, activeFilters, filterValues }) {
    const [list, setList] = useState([]);

    const getListData = async () => {
        try {
            const params = new URLSearchParams();

            // 1. Text search box maps to backend 'search'
            if (var1 && var1.trim() !== '') {
                params.append('search', var1.trim());
            }

            // 2. Job Title mapping
            if (filterValues.JobTitle && filterValues.JobTitle.trim() !== '') {
                params.append('role', filterValues.JobTitle.trim());
            }

            // 3. Experience parameters
            if (filterValues.MinExp || filterValues.MaxExp) {
                const min = filterValues.MinExp ? String(filterValues.MinExp).trim() : '';
                const max = filterValues.MaxExp ? String(filterValues.MaxExp).trim() : '';

                if (min && max) {
                    params.append('experience', `${min}-${max}`);
                } else if (min) {
                    params.append('experience', `${min}+`);
                } else if (max) {
                    params.append('experience', `0-${max}`);
                }
            } else if (filterValues.SidebarExperience && filterValues.SidebarExperience.trim() !== '') {
                params.append('experience', filterValues.SidebarExperience.trim());
            }

            // 4. Locations array
            const locationCombined = [];
            if (Array.isArray(filterValues.LocationSearch)) {
                filterValues.LocationSearch.forEach(loc => {
                    if (loc && loc.trim() !== '') locationCombined.push(loc.trim());
                });
            }
            if (filterValues.SidebarLocation && filterValues.SidebarLocation.trim() !== '') {
                locationCombined.push(filterValues.SidebarLocation.trim());
            }
            if (locationCombined.length > 0) {
                params.append('location', locationCombined.join(','));
            }

            // 5. Skills array
            let skillsArr = [];
            if (Array.isArray(filterValues.Skills)) {
                filterValues.Skills.forEach(s => {
                    if (s && s.trim() !== '') skillsArr.push(s.trim());
                });
            }
            if (filterValues.SidebarSkills && filterValues.SidebarSkills.trim() !== '') {
                skillsArr.push(filterValues.SidebarSkills.trim());
            }
            if (skillsArr.length > 0) {
                params.append('skills', skillsArr.join(','));
            }

            // 6. Sidebar Status
            if (filterValues.SidebarJobStatus && filterValues.SidebarJobStatus.trim() !== '') {
                params.append('status', filterValues.SidebarJobStatus.trim());
            }

            const queryString = params.toString();
            
            // If query parameters are explicitly present, query search route; otherwise load the dynamic base data list
            const url = queryString
                ? `http://localhost:5000/hireRadar/cndtempsavesearch?${queryString}`
                : `http://localhost:5000/hireRadar/cndtempsave`;

            const response = await fetch(url);
            const jsonData = await response.json();
            setList(Array.isArray(jsonData) ? jsonData : []);
        } catch (err) {
            console.error("Error fetching filtered list:", err.message);
            setList([]);
        }
    };

    useEffect(() => {
        getListData();
    }, [var1, filterValues]);

    const nav = useNavigate();
    function navigateCandidateProfile(id) {
        nav('/candidateProfile', { state: { tempCndId: id, permCndId: null } });
    }

    async function saveCandidate(cndid) {
        try {
            const response1 = await fetch(`http://localhost:5000/hireRadar/cndtempsave/${cndid}`);
            const cndTempData = await response1.json();

            const response2 = await fetch(`http://localhost:5000/hireRadar/cndpersonaldetails/${cndid}`);
            const cndPersonalData = await response2.json();

            const body = {
                date: new Date(),
                name: cndTempData.cndname,
                email: cndPersonalData.cndemail,
                phone: cndPersonalData.cndphone,
                age: cndPersonalData.cndage,
                gender: cndPersonalData.cndgender,
                role: cndPersonalData.cndrole,
                skills: cndTempData.cndskills,
                texp: cndTempData.cndexperience,
                experience: cndTempData.cndexperience,
                location: cndPersonalData.cndlocation,
                status: cndTempData.cndstatus
            };

            const response = await fetch("http://localhost:5000/hireRadar/insertCandidate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            await response.json();
        } catch (err) {
            console.error(err.message);
        }
    }

    return (
        <div className="h-full w-full overflow-y-auto pr-2 space-y-4 minimal-scrollbar">
            {list.length === 0 ? (
                <div className="text-center py-12 text-gray-500 font-medium bg-white rounded-lg border border-dashed border-gray-200">
                    No candidates match your search criteria.
                </div>
            ) : (
                list.map((i) => (
                    <div  
                        key={i.cndid} 
                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition duration-200"
                    >
                        <div className="flex items-center justify-between gap-6">
                            <div className="flex items-center gap-6 flex-1">
                                <img 
                                    src={i.cndphoto || 'https://via.placeholder.com/150'} 
                                    alt={i.cndname}
                                    className="h-20 w-20 rounded-full object-cover border-2 border-purple-200"
                                />
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">{i.cndname}</h3>
                                    <p className="text-gray-600 mb-3">{i.cndrole} • {`${i.cndexperience} years`} • {i.cndlocation}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {i.cndskills && i.cndskills.split(',').map((s) => (
                                            <span 
                                                key={uuid()}
                                                className="inline-block px-2 py-1 bg-gray-200 text-gray-700 text-xs font-medium rounded"
                                            >
                                                {s.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <p className="text-gray-600 text-sm font-medium mb-1">Match Score</p>
                                    <p className="text-3xl font-bold text-purple-600">80%</p>
                                </div>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => navigateCandidateProfile(i.cndid)}
                                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition duration-200"
                                    >
                                        View Profile
                                    </button>
                                    <button 
                                        className="p-2 text-gray-400 hover:text-purple-600 transition duration-200"
                                    >
                                        <Bookmark size={24} onClick={() => saveCandidate(i.cndid)}/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

export default RenderList;