import Sidebar from '../components/sideBar/sideBar.jsx';
import { Funnel } from 'lucide-react';
import RenderList from '../components/renderList/renderList.jsx';
import { useState } from 'react';

function SearchCandidatePage(){
    const [searchVar, setSearchVar] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [activeFilter, setActiveFilter] = useState(""); 


    function toggleFilter(filter) {
        setActiveFilter((prev) => (prev === filter ? "" : filter));
    }

    return(
        <div style={{ display: "flex", minHeight: "100vh" }}>
            <Sidebar />
            <div className="flex-1 min-h-screen bg-slate-50 p-6 overflow-x-hidden">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-6">Search Candidates</h1>
                    
                    {/* Search and Filter Bar */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex flex-col gap-4">
                            <div className="flex gap-4 items-center">
                                <input 
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg" 
                                    type="text" 
                                    placeholder={`Search Candidate by ${activeFilter===''? 'name': activeFilter.toLowerCase()} ...`}
                                    value={searchVar}
                                    onChange={(e)=>setSearchVar(e.target.value)}
                                />
                                <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition duration-200"
                                    onClick={()=>setSearchVar("")}
                                >
                                    Reset
                                </button>
                                
                                {/* Main Filter Button - Border active style */}
                                <button
                                    className={`border-2 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition duration-200 bg-white ${
                                        showFilters || activeFilter
                                            ? 'border-purple-600 text-purple-700'
                                            : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                                    }`}
                                    onClick={() => setShowFilters((prev) => !prev)}
                                >
                                    <Funnel size={20} />
                                    <span>Filters</span>
                                </button>
                            </div>
                            
                            {/* Filter Tags */}
                            {showFilters && (
                                <div className="flex flex-wrap gap-2 items-center pt-2 border-t border-gray-100">
                                    {['Experience', 'Skills', 'Location', 'Role', 'Status'].map((filter) => {
                                        const isActive = activeFilter === filter;
                                        return (
                                            <button 
                                                key={filter}
                                                onClick={() => toggleFilter(filter)}
                                                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition duration-200 border-2 bg-white ${
                                                    isActive
                                                        ? 'border-purple-600 text-purple-700 font-semibold'
                                                        : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                <span className="text-sm">{filter}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Candidates List */}
                <RenderList var1={searchVar} activeFilter={activeFilter}/>
            </div>
        </div>
    );
}

export default SearchCandidatePage;