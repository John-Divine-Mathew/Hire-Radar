import Sidebar from '../components/sideBar/sideBar.jsx';
import Navbar from "../components/navBar/navBar.jsx";
import RenderList from '../components/renderList/renderList.jsx';
import { useState } from 'react';

function SearchCandidatePage() {
    const [searchVar, setSearchVar] = useState('');
    const [skillInput, setSkillInput] = useState('');
    const [keywordInput, setKeywordInput] = useState('');
    const [locationInput, setLocationInput] = useState(''); 
    const [errorMessage, setErrorMessage] = useState('');
    
    // Tracks the active filters driving RenderList API queries
    const [activeSourcingFilters, setActiveSourcingFilters] = useState({
        JobTitle: '', 
        MinExp: '',
        MaxExp: '',
        Skills: [],   
        Keywords: [],
        LocationSearch: [], 
        SidebarLocation: '',
        SidebarExperience: '',
        SidebarJobStatus: '',
        SidebarOpenToWork: '',
        SidebarSkills: '',
        Gender: '' // Added Gender filter state
    });

    // Pending state container for inputs
    const [filterValues, setFilterValues] = useState({ ...activeSourcingFilters });

    const handleSidebarChange = (field, value) => {
        setFilterValues((prev) => ({ ...prev, [field]: value }));
        setActiveSourcingFilters((prev) => ({ ...prev, [field]: value }));
    };

    const handleSkillKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const trimmed = skillInput.trim();
            if (trimmed && !filterValues.Skills.includes(trimmed)) {
                setFilterValues((prev) => ({
                    ...prev,
                    Skills: [...prev.Skills, trimmed]
                }));
            }
            setSkillInput('');
        }
    };

    const removeSkillTag = (skillToRemove) => {
        setFilterValues((prev) => ({
            ...prev,
            Skills: prev.Skills.filter(s => s !== skillToRemove)
        }));
    };

    const handleKeywordKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const trimmed = keywordInput.trim();
            if (trimmed && !filterValues.Keywords.includes(trimmed)) {
                setFilterValues((prev) => ({
                    ...prev,
                    Keywords: [...prev.Keywords, trimmed]
                }));
            }
            setKeywordInput('');
        }
    };

    const removeKeywordTag = (keywordToRemove) => {
        setFilterValues((prev) => ({
            ...prev,
            Keywords: prev.Keywords.filter(k => k !== keywordToRemove)
        }));
    };

    const handleLocationKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const trimmed = locationInput.trim();
            if (trimmed && !filterValues.LocationSearch.includes(trimmed)) {
                setFilterValues((prev) => ({
                    ...prev,
                    LocationSearch: [...prev.LocationSearch, trimmed]
                }));
            }
            setLocationInput('');
        }
    };

    const removeLocationTag = (locationToRemove) => {
        setFilterValues((prev) => ({
            ...prev,
            LocationSearch: prev.LocationSearch.filter(l => l !== locationToRemove)
        }));
    };

    const handleSearchSubmit = () => {
        setErrorMessage('');
        setActiveSourcingFilters({ ...filterValues });
    };

    const handleClearFilters = () => {
        setErrorMessage("");
        
        const clearedSidebar = {
            SidebarLocation: '',
            SidebarExperience: '',
            SidebarJobStatus: '',
            SidebarOpenToWork: '',
            SidebarSkills: '',
            Gender: ''
        };
        
        setFilterValues((prev) => ({ ...prev, ...clearedSidebar }));
        setActiveSourcingFilters((prev) => ({ ...prev, ...clearedSidebar }));
    };

    return (
        <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-50">
            <Navbar />
            <div className="flex flex-1 min-h-0 w-full overflow-hidden">
                <Sidebar />
                
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
                            
                            {/* Gender Selection with Icons */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Gender</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {/* Male Option */}
                                    <button
                                        type="button"
                                        onClick={() => handleSidebarChange('Gender', filterValues.Gender === 'male' ? '' : 'male')}
                                        className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-medium transition ${
                                            filterValues.Gender === 'male'
                                                ? 'border-purple-600 bg-purple-50 text-purple-700'
                                                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        <svg className="w-4 h-4 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 3h5v5m0-5l-6 6M10 14a5 5 0 110-10 5 5 0 010 10z" />
                                        </svg>
                                        Male
                                    </button>

                                    {/* Female Option */}
                                    <button
                                        type="button"
                                        onClick={() => handleSidebarChange('Gender', filterValues.Gender === 'female' ? '' : 'female')}
                                        className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-medium transition ${
                                            filterValues.Gender === 'female'
                                                ? 'border-purple-600 bg-purple-50 text-purple-700'
                                                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        <svg className="w-4 h-4 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15a5 5 0 100-10 5 5 0 000 10zm0 0v6m-3-3h6" />
                                        </svg>
                                        Female
                                    </button>

                                    {/* Any / All Option */}
                                    <button
                                        type="button"
                                        onClick={() => handleSidebarChange('Gender', '')}
                                        className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-medium transition ${
                                            filterValues.Gender === ''
                                                ? 'border-purple-600 bg-purple-50 text-purple-700'
                                                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        <svg className="w-4 h-4 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5 5 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        All
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Location</label>
                                <input 
                                    type="text" 
                                    placeholder="Select location" 
                                    value={filterValues.SidebarLocation}
                                    onChange={(e) => handleSidebarChange('SidebarLocation', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Experience</label>
                                <input 
                                    type="text" 
                                    placeholder="Select experience range" 
                                    value={filterValues.SidebarExperience}
                                    onChange={(e) => handleSidebarChange('SidebarExperience', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Job Status</label>
                                <input 
                                    type="text" 
                                    placeholder="Select job status" 
                                    value={filterValues.SidebarJobStatus}
                                    onChange={(e) => handleSidebarChange('SidebarJobStatus', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Open to Work</label>
                                <input 
                                    type="text" 
                                    placeholder="Select option" 
                                    value={filterValues.SidebarOpenToWork}
                                    onChange={(e) => handleSidebarChange('SidebarOpenToWork', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Skills</label>
                                <input 
                                    type="text" 
                                    placeholder="Search by skills..." 
                                    value={filterValues.SidebarSkills}
                                    onChange={(e) => handleSidebarChange('SidebarSkills', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Pane: Workspace Container */}
                    <div className="flex-1 p-6 space-y-6 min-w-0 flex flex-col h-full overflow-hidden">
                        
                        {/* Top Input Form Container */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm grid grid-cols-12 gap-4 shrink-0">
                            <div className="col-span-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Job Title
                                </label>
                                <input 
                                    type="text" 
                                    value={filterValues.JobTitle}
                                    onChange={(e) => {
                                        setFilterValues({...filterValues, JobTitle: e.target.value});
                                        if (e.target.value.trim()) setErrorMessage('');
                                    }}
                                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 ${errorMessage ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'}`}
                                    placeholder="Search job title..."
                                />
                                {errorMessage && <p className="text-xs text-red-500 mt-1">{errorMessage}</p>}
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
                                        placeholder="Min"
                                        value={filterValues.MinExp} 
                                        onChange={(e) => setFilterValues({...filterValues, MinExp: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-center focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-transparent mb-1">Max</label>
                                    <input 
                                        type="number" 
                                        placeholder="Max"
                                        value={filterValues.MaxExp} 
                                        onChange={(e) => setFilterValues({...filterValues, MaxExp: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-center focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                            </div>

                            <div className="col-span-5">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                <div className="w-full px-3 py-1.5 border border-gray-300 rounded-lg flex flex-wrap gap-1.5 items-center bg-white min-h-[38px] focus-within:ring-1 focus-within:ring-purple-500 focus-within:border-purple-500">
                                    {filterValues.LocationSearch.map(loc => (
                                        <span key={loc} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs border border-blue-100 font-medium">
                                            {loc} 
                                            <button 
                                                type="button"
                                                onClick={() => removeLocationTag(loc)}
                                                className="font-bold text-blue-400 hover:text-blue-600 ml-0.5"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                    <input 
                                        type="text"
                                        placeholder={filterValues.LocationSearch.length === 0 ? "Add location..." : ""}
                                        value={locationInput}
                                        onChange={(e) => setLocationInput(e.target.value)}
                                        onKeyDown={handleLocationKeyDown}
                                        className="flex-1 min-w-[60px] text-sm bg-transparent outline-none border-none p-0 focus:ring-0"
                                    />
                                </div>
                            </div>

                            <div className="col-span-3 flex justify-end items-end pb-1">
                                <button 
                                    onClick={handleSearchSubmit}
                                    className="px-8 py-2.5 rounded-lg font-semibold tracking-wide transition duration-150 shadow-sm text-white bg-purple-600 hover:bg-purple-700"
                                >
                                    Search
                                </button>
                            </div>
                        </div>

                        {/* Candidates Workspace Card Area */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
                            <div className="mb-6 shrink-0">
                                <input 
                                    type="text"
                                    placeholder="Search candidates by name..."
                                    value={searchVar}
                                    onChange={(e) => setSearchVar(e.target.value)}
                                    className="max-w-md w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

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