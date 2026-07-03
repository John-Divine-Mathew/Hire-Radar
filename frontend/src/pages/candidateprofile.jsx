import Sidebar from '../components/sideBar/sideBar.jsx';
import Navbar from "../components/navBar/navBar.jsx";
import { ChevronLeft, Link, Download } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import React,{ useState, useEffect } from 'react';
import { v4 as uuid } from "uuid";

function CandidateProfile(){
    const nav = useNavigate();
    const loc = useLocation();
    const id = loc.state.tempCndId ? String(loc.state.tempCndId) : String(loc.state.permCndId);
    const permSave = loc.state.tempCndId ? false : true ;

    const [cndData,setCndData] = useState({});
    const getData = async()=>{
        try {
            const response = loc.state.tempCndId ? await fetch(`http://localhost:5000/hireRadar/cndtempsave/${id}`) : await fetch(`http://localhost:5000/hireRadar/cndpermsave/${id}`);
            const jsonData = await response.json();
            setCndData(jsonData);
        } catch (err) {
            console.error(err.message);
        }
    }
    const cndskills = cndData.cndskills || '';
    const skillsArray = cndskills ? cndskills.split(',').map(s => s.trim()).filter(Boolean) : [];
    useEffect(()=>{
        getData();
    },[]);

    const backFunc = ()=>{
        if (loc.key === 'default') {
            nav('/');
        } else {
            nav(-1);
        }
    }

    return( 
        <div className="flex h-screen flex-col overflow-hidden">
            <Navbar />
            <div className="flex flex-1 min-h-0">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col bg-slate-50 overflow-hidden">
                <div className="shrink-0 border-b border-slate-200 bg-slate-50 p-6">
                {/* Back Button */}
                <button 
                    onClick={()=>backFunc()}
                    className="flex items-center gap-2 text-purple-600 hover:text-purple-800 font-semibold mb-6 transition duration-200"
                >
                    <ChevronLeft size={24}/>
                    <span>Back to Search</span>
                </button>

                {/* Profile Header Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
                    <div className="flex gap-8 items-start">
                        {/* Profile Image and Info */}
                        <div className="flex gap-6 items-start flex-1">
                            <img 
                                className="h-32 w-32 rounded-full object-cover border-4 border-purple-200" 
                                src={cndData.cndphoto} 
                                alt={cndData.cndname} 
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-3xl font-bold text-gray-900">{cndData.cndname}</h1>
                                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                                        {cndData.cndstatus}
                                    </span>
                                </div>
                                <p className="text-xl text-gray-700 font-semibold mb-1">{cndData.cndrole}</p>
                                <p className="text-gray-600 mb-4">{cndData.cndexperience} Years of Experience • {cndData.cndlocation}</p>
                                <div className="flex gap-4">
                                    <button className="text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-2 transition duration-200">
                                        <Link size={18}/>
                                        LinkedIn Profile
                                    </button>
                                    <button className="text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-2 transition duration-200">
                                        <Download size={18}/>
                                        Download Resume
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Match Score Card */}
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200 text-center">
                            <p className="text-gray-600 text-sm font-medium mb-1">Match Score</p>
                            <p className="text-5xl font-bold text-purple-600 mb-2">92%</p>
                            <div className="text-green-600 font-bold mb-2">High Match</div>
                            <p className="text-sm text-gray-700">Great match for Design Engineer role</p>
                        </div>
                    </div>
                </div>

                {/* Tabs/Navigation */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                    <div className="flex border-b border-gray-200 overflow-x-auto">
                        {['Overview', 'Experience', 'Education', 'Skills', 'Projects', 'Resume', 'Activity'].map((tab) => (
                            <button 
                                key={tab}
                                className="px-6 py-4 text-gray-700 font-semibold hover:text-purple-600 border-b-2 border-transparent hover:border-purple-600 transition duration-200 whitespace-nowrap"
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
                </div>

                {/* Content Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-y-auto p-6">
                    {/* About & Skills */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
                        <p className="text-gray-700 leading-relaxed mb-6">
                            Mechanical Design Engineer with 3.6 years of experience in product design, 3D modeling, and engineering analysis. Skilled in SolidWorks, AutoCAD, CATIA, and ANSYS. Passionate about creating innovative and efficient designs.
                        </p>
                        
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Skills</h3>
                        <ul className="flex flex-wrap gap-2">
                            {skillsArray.map((s)=>(
                                <li key={uuid()} className="bg-white-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                                    {s}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Experience */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Experience</h2>
                        
                        <div className="mb-6">
                            <div className="flex items-start gap-3 mb-2">
                                <span className="text-xl font-bold text-gray-900 mt-1">•</span>
                                <div>
                                    <p className="text-lg font-bold text-gray-900">{cndData.cndrole}</p>
                                    <p className="text-gray-600">ABC Technologies</p>
                                    <p className="text-gray-500 text-sm">Jan 2022 – Present (2.6 yrs)</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-start gap-3 mb-2">
                                <span className="text-xl font-bold text-gray-900 mt-1">•</span>
                                <div>
                                    <p className="text-lg font-bold text-gray-900">Junior Design Engineer</p>
                                    <p className="text-gray-600">XYZ Solutions</p>
                                    <p className="text-gray-500 text-sm">Jun 2020 – Dec 2021 (1.6 yrs)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
}

export default CandidateProfile;
