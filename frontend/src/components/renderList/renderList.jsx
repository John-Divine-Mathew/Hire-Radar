import { Bookmark, User, Check, Mars, Venus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { v4 as uuid } from "uuid";

// ── Gender-aware photo placeholder ──────────────────────────────────────────
function CandidateAvatar({ photo, gender, name }) {
    const g = (gender || '').toLowerCase();
    const isMale   = g === 'male'   || g === 'm';
    const isFemale = g === 'female' || g === 'f';

    if (photo) {
        return (
            <img
                src={photo}
                alt={name}
                className="h-20 w-20 rounded-full object-cover border-2 border-purple-200"
            />
        );
    }

    // No photo — show coloured circle with gender icon
    const bgClass    = isFemale ? 'bg-pink-100 border-pink-300'
                     : isMale   ? 'bg-blue-100 border-blue-300'
                     :            'bg-gray-100 border-gray-300';

    const iconColor  = isFemale ? '#be185d'   // pink-700
                     : isMale   ? '#1d4ed8'   // blue-700
                     :            '#6b7280';   // gray-500

    const Icon = isFemale ? Venus : isMale ? Mars : User;

    return (
        <div
            className={`h-20 w-20 rounded-full border-2 flex flex-col items-center justify-center gap-0.5 flex-shrink-0 ${bgClass}`}
        >
            <Icon size={28} color={iconColor} strokeWidth={1.8} />
            <span
                className="text-[9px] font-semibold uppercase tracking-wide"
                style={{ color: iconColor }}
            >
                {isFemale ? 'Female' : isMale ? 'Male' : 'N/A'}
            </span>
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────
function RenderList({ var1, activeFilters, filterValues }) {
    const [list, setList] = useState([]);
    const [savedCandidateIds, setSavedCandidateIds] = useState(new Set());

    const getListData = async () => {
        try {
            const params = new URLSearchParams();

            if (var1 && var1.trim() !== '') {
                params.append('search', var1.trim());
            }

            if (filterValues.JobTitle && filterValues.JobTitle.trim() !== '') {
                params.append('role', filterValues.JobTitle.trim());
            }

            if (filterValues.MinExp || filterValues.MaxExp) {
                const min = filterValues.MinExp ? String(filterValues.MinExp).trim() : '';
                const max = filterValues.MaxExp ? String(filterValues.MaxExp).trim() : '';
                if (min && max)       params.append('experience', `${min}-${max}`);
                else if (min)         params.append('experience', `${min}+`);
                else if (max)         params.append('experience', `0-${max}`);
            } else if (filterValues.SidebarExperience && filterValues.SidebarExperience.trim() !== '') {
                params.append('experience', filterValues.SidebarExperience.trim());
            }

            const locationCombined = [];
            if (Array.isArray(filterValues.LocationSearch)) {
                filterValues.LocationSearch.forEach(loc => {
                    if (loc && loc.trim() !== '') locationCombined.push(loc.trim());
                });
            }
            if (filterValues.SidebarLocation && filterValues.SidebarLocation.trim() !== '') {
                locationCombined.push(filterValues.SidebarLocation.trim());
            }
            if (locationCombined.length > 0) params.append('location', locationCombined.join(','));

            let skillsArr = [];
            if (Array.isArray(filterValues.Skills)) {
                filterValues.Skills.forEach(s => {
                    if (s && s.trim() !== '') skillsArr.push(s.trim());
                });
            }
            if (filterValues.SidebarSkills && filterValues.SidebarSkills.trim() !== '') {
                skillsArr.push(filterValues.SidebarSkills.trim());
            }
            if (skillsArr.length > 0) params.append('skills', skillsArr.join(','));

            if (filterValues.SidebarJobStatus && filterValues.SidebarJobStatus.trim() !== '') {
                params.append('status', filterValues.SidebarJobStatus.trim());
            }

            const queryString = params.toString();
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

            let cndPersonalData = {};
            try {
                const response2 = await fetch(`http://localhost:5000/hireRadar/cndpersonaldetails/${cndid}`);
                if (response2.ok) cndPersonalData = await response2.json();
            } catch (pErr) {
                console.warn("Could not fetch additional personal details for ID:", cndid);
            }

            const parsedExp = parseInt(cndTempData.cndexperience || 0, 10);

            const body = {
                date:            new Date().toISOString().split('T')[0],
                name:            cndTempData.cndname || "Unknown Candidate",
                email:           cndPersonalData.cndemail    || cndTempData.cndemail    || "noemail@domain.com",
                phone:           cndPersonalData.cndphone    || cndTempData.cndphone    || "",
                age:             cndPersonalData.cndage      ? parseInt(cndPersonalData.cndage, 10) : null,
                gender:          cndPersonalData.cndgender   || cndTempData.cndgender   || "",
                role:            cndPersonalData.cndrole     || cndTempData.cndrole     || "",
                skills:          cndTempData.cndskills       || "",
                texp:            String(parsedExp),
                experience:      isNaN(parsedExp) ? 0 : parsedExp,
                location:        cndPersonalData.cndlocation || cndTempData.cndlocation || "",
                teststatus:      cndTempData.teststatus      || 'NA',
                interviewstatus: cndTempData.interviewstatus || 'NA',
            };

            const response = await fetch("http://localhost:5000/hireRadar/insertCandidate", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify(body),
            });

            if (response.ok) {
                setSavedCandidateIds(prev => new Set(prev).add(cndid));
            }
        } catch (err) {
            console.error("saveCandidate error:", err.message);
        }
    }

    return (
        <div className="h-full w-full overflow-y-auto pr-2 space-y-4 minimal-scrollbar">
            {list.length === 0 ? (
                <div className="text-center py-12 text-gray-500 font-medium bg-white rounded-lg border border-dashed border-gray-200">
                    No candidates match your search criteria.
                </div>
            ) : (
                list.map((i) => {
                    const isSaved = savedCandidateIds.has(i.cndid);

                    return (
                        <div
                            key={i.cndid}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition duration-200"
                        >
                            <div className="flex items-center justify-between gap-6">
                                <div className="flex items-center gap-6 flex-1">

                                    {/* ── Photo holder with gender icon fallback ── */}
                                    <CandidateAvatar
                                        photo={i.cndphoto}
                                        gender={i.cndgender}
                                        name={i.cndname}
                                    />

                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-gray-900 mb-1">{i.cndname}</h3>
                                        <p className="text-gray-600 mb-3">
                                            {i.cndrole || 'Role N/A'} &bull; {`${i.cndexperience || 0} years`} &bull; {i.cndlocation || 'Location N/A'}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {i.cndskills && i.cndskills.split(',').map((s) => (
                                                <span
                                                    key={uuid()}
                                                    className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded"
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
                                        <p className="text-3xl font-bold text-purple-600">{i.matchScore || '80%'}</p>
                                    </div>
                                    <div className="flex gap-3 items-center">
                                        <button
                                            onClick={() => navigateCandidateProfile(i.cndid)}
                                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition duration-200 text-sm"
                                        >
                                            View Profile
                                        </button>
                                        <button
                                            onClick={() => saveCandidate(i.cndid)}
                                            disabled={isSaved}
                                            title={isSaved ? "Saved to Candidates" : "Bookmark Candidate"}
                                            className={`p-2 rounded-lg border transition duration-200 ${
                                                isSaved
                                                    ? 'bg-purple-50 text-purple-700 border-purple-200 cursor-default'
                                                    : 'text-gray-400 border-gray-200 hover:text-purple-600 hover:border-purple-300'
                                            }`}
                                        >
                                            {isSaved
                                                ? <Check size={20} className="text-purple-700" />
                                                : <Bookmark size={20} />
                                            }
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}

export default RenderList;