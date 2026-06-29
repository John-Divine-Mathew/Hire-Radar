import Sidebar from '../components/sideBar/sideBar.jsx';
import { Funnel, ChevronDown } from 'lucide-react';
import RenderList from '../components/renderList/renderList.jsx';
import { useState, useRef, useEffect } from 'react';

function SearchCandidatePage() {
    const [searchVar, setSearchVar] = useState('');
    const [showFilters, setShowFilters] = useState(false);
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

    useEffect(() => {
        function handleClickOutside(event) {
            if (skillsRef.current && !skillsRef.current.contains(event.target)) {
                setShowSkillsDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

    return (
        <div style={{ display: "flex", minHeight: "100vh" }}>
            <Sidebar />
            <div className="flex-1 min-h-screen bg-slate-50 p-6 overflow-x-hidden">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-6">Search Candidates</h1>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex flex-col gap-4">
                            <div className="flex gap-4 items-center">
                                <input
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
                                    type="text"
                                    placeholder={`Search Candidate by ${activeFilters.length === 0 ? 'name' : activeFilters.join(', ').toLowerCase()} ...`}
                                    value={searchVar}
                                    onChange={(e) => setSearchVar(e.target.value)}
                                />

                                <div className="flex items-center gap-3">
                                    <button
                                        className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition duration-200"
                                        onClick={() => {
                                            setSearchVar("");
                                            setActiveFilters([]);
                                            setFilterValues({});
                                        }}
                                    >
                                        Reset
                                    </button>

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
                            </div>

                            {showFilters && (
                                <div className="flex flex-col gap-3 items-start">
                                    <div className="flex flex-wrap gap-2 items-center">
                                        {filterOptions.map((filter) => {
                                            const isActive = activeFilters.includes(filter);

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
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <RenderList var1={searchVar} activeFilters={activeFilters} filterValues={filterValues} />
            </div>
        </div>
    );
}

export default SearchCandidatePage;