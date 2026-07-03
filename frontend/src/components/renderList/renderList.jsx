import { Bookmark, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { v4 as uuid } from "uuid";
import { format } from 'date-fns';

function RenderList({ var1, activeFilters, filterValues }) {
    const [list, setList] = useState([]);

    const normalizeFilterValue = (key, value) => {
        if (Array.isArray(value)) {
            return value
                .map((item) => normalizeFilterValue(key, item))
                .filter((item) => item !== null && item !== undefined && item !== '');
        }

        if (typeof value !== 'string') {
            return value;
        }

        const normalizedKey = key.toLowerCase();

        if (normalizedKey.includes('experience') || normalizedKey.includes('exp') || normalizedKey.includes('year')) {
            const matches = value.match(/\d+/g);

            if (matches && matches.length >= 2) {
                return `${matches[0]}-${matches[matches.length - 1]}`;
            }

            if (matches && matches.length === 1) {
                // Check if the user selected a plus-bounded open range (e.g., "5+ years")
                if (value.includes('+')) {
                    return `${matches[0]}+`;
                }
                return matches[0];
            }

            return '';
        }

        return value;
    };

    const getListData = async () => {
        try {
            const params = new URLSearchParams();

            if (var1) {
                params.append('search', var1);
            }

            Object.keys(filterValues).forEach((key) => {
                const val = filterValues[key];
                const normalizedValue = normalizeFilterValue(key, val);

                if (Array.isArray(normalizedValue)) {
                    if (normalizedValue.length > 0) {
                        params.append(key.toLowerCase(), normalizedValue.join(','));
                    }
                } else if (normalizedValue !== null && normalizedValue !== undefined && normalizedValue !== '') {
                    params.append(key.toLowerCase(), String(normalizedValue));
                }
            });

            const queryString = params.toString();
            const url = queryString
                ? `http://localhost:5000/hireRadar/cndtempsavesearch?${queryString}`
                : `http://localhost:5000/hireRadar/cndtempsave`;

            const response = await fetch(url);
            const jsonData = await response.json();
            setList(jsonData);
        } catch (err) {
            console.error("Error fetching filtered list:", err.message);
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
            const result = await response.json();
            console.log("Candidate saved successfully:", result);
        } catch (err) {
            console.error(err.message);
        }
    }

    return (
        <div className="space-y-4 max-h-[calc(100vh-320px)] overflow-y-auto pr-2">
            {list.map((i) => (
                <div  
                    key={i.cndid} 
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition duration-200"
                >
                    <div className="flex items-center justify-between gap-6">
                        <div className="flex items-center gap-6 flex-1">
                            <img 
                                src={i.cndphoto} 
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
                                    className="p-2 text-gray-400 hover:text-purple-600 transition duration-200">
                                    <Bookmark size={24} onClick={() => saveCandidate(i.cndid)}/>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default RenderList;