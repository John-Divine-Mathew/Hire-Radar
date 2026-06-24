import Sidebar from '../components/sideBar/sideBar.jsx';
import { ChevronDown, Funnel } from 'lucide-react';
import RenderList from '../components/renderList/renderList.jsx';
import { useState, useEffect } from 'react';

function SearchCandidatePage(){

    const [searchVar, setSearchVar] = useState('');
    const [propsVar, setPropsVar] = useState("");
    function handleClick(){
        setPropsVar(searchVar);
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
                                    placeholder="Search candidates by name ..."
                                    value={searchVar}
                                    onChange={(e)=>setSearchVar(e.target.value)}
                                />
                                <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition duration-200"
                                    onClick={()=>handleClick()}
                                >
                                    Search
                                </button>
                                <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition duration-200">
                                    <Funnel size={20} />
                                    <span>Filters</span>
                                </button>
                            </div>
                            
                            {/* Filter Tags */}
                            <div className="flex flex-wrap gap-2 items-center">
                                {['Experience', 'Skills', 'Location', 'Education', 'Availability', 'More Filters'].map((filter) => (
                                    <button 
                                        key={filter}
                                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition duration-200 border border-gray-200"
                                    >
                                        <span className="text-sm font-medium">{filter}</span>
                                        <ChevronDown size={16} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Candidates List */}
                <RenderList var1={propsVar}/>
            </div>
        </div>
    );
}

export default SearchCandidatePage;