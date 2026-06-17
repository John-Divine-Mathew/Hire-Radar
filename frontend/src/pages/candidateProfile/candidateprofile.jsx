import Sidebar from '../../components/sideBar/sideBar.jsx';
import { ChevronLeft, Link, Download } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import React,{ useState, useEffect } from 'react';
import './candidateProfile.css';
import { v4 as uuid } from "uuid";

function CandidateProfile(){
    const nav = useNavigate();
    const loc = useLocation();
    const id = loc.state.tempCndId ? String(loc.state.tempCndId) : String(loc.state.permCndId);
    const permSave = loc.state.tempCndId ? false : true ;
    //console.log(`Fron permSave -> ${permSave}`);

    const [cndData,setCndData] = useState({});
    const getData = async()=>{
        try {
            const response = await fetch(`http://localhost:5000/hireRadar/cndtempsave/${id}`);
            const jsonData = await response.json();
            setCndData(jsonData);
        } catch (err) {
            console.error(err.message);
        }
    }
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

    return( <div className='mainDiv'>
                <Sidebar />
                <div className='mainpage'>


                    {/* <p style={{"background-color:black"}}>{permSave? 'Saved Candidate':  null}</p> */}


                    <div className='buttonDiv'><button className='btsButton' onClick={()=>backFunc()}><ChevronLeft size={24}/><p>Back to Search</p></button></div>
                    <div className='topDiv'>
                        <div className='profileDiv'>
                            <img className='profilePic' src={cndData.cndphoto} alt={cndData.cndname} />
                            <ul className='profileUL'>
                                <li className='profileLi'><p className='profileLP' style={{fontSize: '2.5vh', fontWeight: 'bold'}}>{cndData.cndname}</p><span style={{backgroundColor: 'hsl(120, 100%, 25%)', color: 'white', padding: '0.5vh 1vw', borderRadius: '4px', fontSize: '1.4vh', fontWeight: 'bold'}}>{cndData.cndstatus}</span></li>
                                <li className='profileLi'><p className='profileLP'>{cndData.cndrole}</p></li>
                                <li className='profileLi'><p className='profileLP'>{`${cndData.cndexperience} of Experience`}</p><p className='profileLP'>{cndData.cndlocation}</p></li>
                                <li className='profileLi'><button style={{background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(242, 100%, 50%)', textDecoration: 'underline', fontSize: '1.8vh', padding: 0, display: 'flex', alignItems: 'center', gap: '0.5vw'}}><Link size={18}/>LinkedIn Profile</button>
                                    <button style={{background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(242, 100%, 50%)', textDecoration: 'underline', fontSize: '1.8vh', padding: 0, display: 'flex', alignItems: 'center', gap: '0.5vw'}}><Download size={18}/>Download Resume</button>
                                </li>
                            </ul>
                        </div>
                        <div className='matchDiv'>
                            <p className='matchLabel'>Match Score</p>
                            <p className='matchScore'>92%</p>
                            <div style={{fontSize: '1.6vh', color: 'hsl(120, 100%, 40%)', fontWeight: 'bold'}}>High Match</div>
                            <p style={{fontSize: '1.6vh', color: 'hsl(0, 0%, 50%)', textAlign: 'center'}}>Great match for Design Engineer role</p>
                        </div>
                    </div>
                    <ul className='middleDiv'>
                        <li><button className='profileListItem'><p className='profileP'>Overview</p></button></li>
                        <li><button className='profileListItem'><p className='profileP'>Experience</p></button></li>
                        <li><button className='profileListItem'><p className='profileP'>Education</p></button></li>
                        <li><button className='profileListItem'><p className='profileP'>Skills</p></button></li>
                        <li><button className='profileListItem'><p className='profileP'>Projects</p></button></li>
                        <li><button className='profileListItem'><p className='profileP'>Resume</p></button></li>
                        <li><button className='profileListItem'><p className='profileP'>Activity</p></button></li>
                    </ul>
                    <div className='bottomDiv'>
                        <div>
                            <h3>About</h3>
                            <p>Mechanical Design Engineer with 3.6 years of experience in product design, 3D modeling, and engineering analysis. Skilled in SolidWorks, AutoCAD, CATIA, and ANSYS. Passionate about creating innovative and efficient designs.</p>
                            <h3>Skills</h3>
                            <ul className='skillsList'>
                                <li>AutoCAD</li>
                                <li>SolidWorks</li>
                                <li>ANSYS</li>
                                <li>CATIA</li>
                                <li>Creo</li>
                                <li>GD&T</li>
                                <li>DFM</li>
                                <li>3D Modeling</li>
                                <li>Gaming</li>
                            </ul>
                        </div>
                        <div>
                            <h3>Experience</h3>
                            <div style={{marginBottom: '2vh'}}>
                                <div style={{display: 'flex', alignItems: 'center', gap: '0.5vw', marginBottom: '0.5vh'}}>
                                    <span style={{fontSize: '1.8vh', fontWeight: 'bold', color: 'hsl(0, 0%, 0%)'}}>•</span>
                                    <p style={{fontSize: '1.8vh', fontWeight: 'bold', color: 'hsl(0, 0%, 0%)', margin: 0}}>{cndData.cndrole}</p>
                                </div>
                                <p style={{fontSize: '1.6vh', color: 'hsl(0, 0%, 40%)', margin: 0}}>ABC Technologies</p>
                                <p style={{fontSize: '1.6vh', color: 'hsl(0, 0%, 40%)', margin: 0}}>Jan 2022 – Present (2.6 yrs)</p>
                            </div>
                            <div>
                                <div style={{display: 'flex', alignItems: 'center', gap: '0.5vw', marginBottom: '0.5vh'}}>
                                    <span style={{fontSize: '1.8vh', fontWeight: 'bold', color: 'hsl(0, 0%, 0%)'}}>•</span>
                                    <p style={{fontSize: '1.8vh', fontWeight: 'bold', color: 'hsl(0, 0%, 0%)', margin: 0}}>Junior Design Engineer</p>
                                </div>
                                <p style={{fontSize: '1.6vh', color: 'hsl(0, 0%, 40%)', margin: 0}}>XYZ Solutions</p>
                                <p style={{fontSize: '1.6vh', color: 'hsl(0, 0%, 40%)', margin: 0}}>Jun 2020 – Dec 2021 (1.6 yrs)</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>);
}

export default CandidateProfile;