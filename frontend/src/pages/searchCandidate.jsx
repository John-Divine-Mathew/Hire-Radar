import Sidebar from '../components/sideBar/sideBar.jsx';
import Navbar from "../components/navBar/navBar.jsx";
import RenderList from '../components/renderList/renderList.jsx';
import { useState } from 'react';

function SearchCandidatePage() {
    const [searchVar, setSearchVar] = useState('');
    const [skillInput, setSkillInput] = useState('');
    const [keywordInput, setKeywordInput] = useState('');
    
    const [activeSourcingFilters, setActiveSourcingFilters] = useState({
        JobTitle: 'Software Developer', 
        MinExp: '2',
        MaxExp: '6',
        Skills: ['React', 'Next.js'],   
        Keywords: ['communication skills'],
        LocationSearch: 'Coimbatore, Tamil Nadu, India',
        SidebarLocation: '',
        SidebarExperience: '',
        SidebarJobStatus: '',
        SidebarOpenToWork: '',
        SidebarSkills: ''
    });

    const [filterValues, setFilterValues] = useState({ ...activeSourcingFilters });

    const handleSkillKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const trimmed = skillInput.trim();
            if (trimmed && !filterValues.Skills.includes(trimmed)) {
                setFilterValues({
                    ...filterValues,
                    Skills: [...filterValues.Skills, trimmed]
                });
            }
            setSkillInput('');
        }
    };

    const removeSkillTag = (skillToRemove) => {
        setFilterValues({
            ...filterValues,
            Skills: filterValues.Skills.filter(s => s !== skillToRemove)
        });
    };

    const handleKeywordKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const trimmed = keywordInput.trim();
            if (trimmed && !filterValues.Keywords.includes(trimmed)) {
                setFilterValues({
                    ...filterValues,
                    Keywords: [...filterValues.Keywords, trimmed]
                });
            }
            setKeywordInput('');
        }
    };

    const removeKeywordTag = (keywordToRemove) => {
        setFilterValues({
            ...filterValues,
            Keywords: filterValues.Keywords.filter(k => k !== keywordToRemove)
        });
    };

    const handleSearchSubmit = () => {
        if (!filterValues.JobTitle.trim()) return;
        setActiveSourcingFilters({ ...filterValues });
    };

    const handleClearFilters = () => {
        setSearchVar("");
        setSkillInput("");
        setKeywordInput("");
        const cleared = {
            JobTitle: '',
            MinExp: '',
            MaxExp: '',
            Skills: [],
            Keywords: [],
            LocationSearch: '',
            SidebarLocation: '',
            SidebarExperience: '',
            SidebarJobStatus: '',
            SidebarOpenToWork: '',
            SidebarSkills: ''
        };
        setFilterValues(cleared);
        setActiveSourcingFilters(cleared);
    };

    const isSearchDisabled = !filterValues.JobTitle.trim();

    return (
        <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-50">
            <Navbar />
            <div className="flex flex-1 min-h-0 w-full overflow-hidden">
                <Sidebar />
                
                {/* 
                  Main Sub-Workspace Viewport Frame:
                  Enforced strict h-full layout alignment bounds to prevent child components 
                  from overlapping the Navbar container space.
                */}
                <div className="flex-1 flex overflow-hidden min-w-0 h-full">
                    
                    {/* Left Pane: Sidebar Filters Input Panel */}
                    <div className="w-64 bg-white border-r border-gray-200 flex flex-col p-5 shrink-0 overflow-hidden h-full">
                        <div className="flex items-center justify-between mb-6 shrink-0">
                            <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                            <button 
                                onClick={handleClearFilters} 
                                className="text-purple-600 hover:text-purple-700 text-sm font-semibold underline"
                            >
                                Clear Filters
                            </button>
                        </div>

                        <div className="space-y-5 overflow-y-auto pr-1 flex-1 min-h-0">
                            {/* Location Box */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Location</label>
                                <input 
                                    type="text" 
                                    placeholder="Select location" 
                                    value={filterValues.SidebarLocation}
                                    onChange={(e) => setFilterValues({...filterValues, SidebarLocation: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            {/* Experience Box */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Experience</label>
                                <input 
                                    type="text" 
                                    placeholder="Select experience range" 
                                    value={filterValues.SidebarExperience}
                                    onChange={(e) => setFilterValues({...filterValues, SidebarExperience: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            {/* Job Status Box */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Job Status</label>
                                <input 
                                    type="text" 
                                    placeholder="Select job status" 
                                    value={filterValues.SidebarJobStatus}
                                    onChange={(e) => setFilterValues({...filterValues, SidebarJobStatus: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            {/* Open to Work Box */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Open to Work</label>
                                <input 
                                    type="text" 
                                    placeholder="Select option" 
                                    value={filterValues.SidebarOpenToWork}
                                    onChange={(e) => setFilterValues({...filterValues, SidebarOpenToWork: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            {/* Skills Box */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Skills</label>
                                <input 
                                    type="text" 
                                    placeholder="Search by skills..." 
                                    value={filterValues.SidebarSkills}
                                    onChange={(e) => setFilterValues({...filterValues, SidebarSkills: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Pane: Sourcing Workspace Container */}
                    <div className="flex-1 p-6 space-y-6 min-w-0 flex flex-col h-full overflow-hidden">
                        
                        {/* Top Input Form Container */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm grid grid-cols-12 gap-4 shrink-0">
                            <div className="col-span-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title*</label>
                                <input 
                                    type="text" 
                                    value={filterValues.JobTitle}
                                    onChange={(e) => setFilterValues({...filterValues, JobTitle: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="Required to run search"
                                />
                            </div>

                            <div className="col-span-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                                <div className="w-full px-3 py-1.5 border border-gray-300 rounded-lg flex flex-wrap gap-1.5 items-center bg-white min-h-[38px] focus-within:ring-1 focus-within:ring-purple-500 focus-within:border-purple-500">
                                    {filterValues.Skills.map(skill => (
                                        <span key={skill} className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-xs border border-purple-100 font-medium">
                                            {skill} 
                                            <button 
                                                type="button"
                                                onClick={() => removeSkillTag(skill)}
                                                className="font-bold text-purple-400 hover:text-purple-600 ml-0.5"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                    <input 
                                        type="text"
                                        placeholder={filterValues.Skills.length === 0 ? "Add skill..." : ""}
                                        value={skillInput}
                                        onChange={(e) => setSkillInput(e.target.value)}
                                        onKeyDown={handleSkillKeyDown}
                                        className="flex-1 min-w-[60px] text-sm bg-transparent outline-none border-none p-0 focus:ring-0"
                                    />
                                </div>
                            </div>

                            <div className="col-span-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
                                <div className="w-full px-3 py-1.5 border border-gray-300 rounded-lg flex flex-wrap gap-1.5 items-center bg-white min-h-[38px] focus-within:ring-1 focus-within:ring-purple-500 focus-within:border-purple-500">
                                    {filterValues.Keywords.map(kw => (
                                        <span key={kw} className="inline-flex items-center gap-1 bg-slate-100 text-gray-700 px-2 py-0.5 rounded text-xs border border-gray-200 font-medium">
                                            {kw} 
                                            <button 
                                                type="button"
                                                onClick={() => removeKeywordTag(kw)}
                                                className="font-bold text-gray-400 hover:text-gray-600 ml-0.5"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                    <input 
                                        type="text"
                                        placeholder={filterValues.Keywords.length === 0 ? "Add must include keywords..." : ""}
                                        value={keywordInput}
                                        onChange={(e) => setKeywordInput(e.target.value)}
                                        onKeyDown={handleKeywordKeyDown}
                                        className="flex-1 min-w-[60px] text-sm bg-transparent outline-none border-none p-0 focus:ring-0"
                                    />
                                </div>
                            </div>

                            <div className="col-span-4 flex gap-2">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
                                    <input 
                                        type="number" 
                                        value={filterValues.MinExp} 
                                        onChange={(e) => setFilterValues({...filterValues, MinExp: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-center focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-transparent mb-1">Max</label>
                                    <input 
                                        type="number" 
                                        value={filterValues.MaxExp} 
                                        onChange={(e) => setFilterValues({...filterValues, MaxExp: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-center focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                            </div>

                            <div className="col-span-5">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                <input 
                                    type="text" 
                                    placeholder="Search location (Optional)" 
                                    value={filterValues.LocationSearch}
                                    onChange={(e) => setFilterValues({...filterValues, LocationSearch: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div className="col-span-3 flex justify-end items-end pb-1">
                                <button 
                                    onClick={handleSearchSubmit}
                                    disabled={isSearchDisabled}
                                    className={`px-8 py-2.5 rounded-lg font-semibold tracking-wide transition duration-150 shadow-sm text-white ${
                                        isSearchDisabled 
                                        ? 'bg-gray-300 cursor-not-allowed opacity-60' 
                                        : 'bg-purple-600 hover:bg-purple-700'
                                    }`}
                                >
                                    Search
                                </button>
                            </div>
                        </div>

                        {/* Candidates Workspace Card Area */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
                            
                            {/* Inner Actions Row (Stays Static at Top) */}
                            <div className="flex justify-between items-center mb-6 gap-4 shrink-0">
                                <input 
                                    type="text"
                                    placeholder="Search candidates..."
                                    value={searchVar}
                                    onChange={(e) => setSearchVar(e.target.value)}
                                    className="max-w-md w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                <div className="flex items-center gap-2">
                                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition duration-150 flex items-center gap-1.5">
                                        📞 Get all phone
                                    </button>
                                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition duration-150 flex items-center gap-1.5">
                                        ✉️ Get all email
                                    </button>
                                </div>
                            </div>

                            {/* Enforced layout wrapper boundary to securely isolate RenderList rendering scope */}
                            <div className="flex-1 min-h-0 overflow-hidden">
                                <RenderList var1={searchVar} activeFilters={[]} filterValues={activeSourcingFilters} />
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}

export default SearchCandidatePage;