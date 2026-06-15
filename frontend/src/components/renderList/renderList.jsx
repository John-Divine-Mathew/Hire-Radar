import { Bookmark, User } from 'lucide-react';
import './renderList.css';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
    

function RenderList(){
    const nav = useNavigate();
    const navigateCandidateProfile = ()=>{
        nav('/candidateProfile');
    }

    const [list,setList] = useState([]);
    const getListData = async()=>{
        try {
            const response = await fetch("http://localhost:5000/hireRadar/emptempsave"); // default get req
            const jsonData = await response.json();
            setList(jsonData);
        } catch (err) {
            console.error(err.message);
        }
    }
    useEffect(()=>{
        getListData();
    },[]);    

    return(
        <div className='renderListDiv'><ul>
            {list.map((i)=>(
                <li  key={i.cndid} className='renderListItem'>
                    <div className='profileDiv'>
                        <div className='cndIcon'><img src={i.cndphoto} alt={i.cndname}/></div>
                        <div className='cndDetails'> 
                            <p className='nameP'>{i.cndname}</p>
                            <ul className='detailsList'>
                                <li className='detailsListItem'>{i.cndrole}</li>
                                <li className='detailsListItem'>{i.cndexperience}</li>
                                <li className='detailsListItem'>{i.cndlocation}</li>
                                <li className='detailsListItem'>{i.cndstatus}</li>
                            </ul>
                            <ul className='skillsList'>
                                {i.cndskills.split(',').map((s)=>(<li className='skillListItem'>{s}</li>))}
                            </ul>
                        </div>
                    </div>
                    <div className='profileEndDiv'>
                        <Bookmark size='40' className='saveButton'/>
                        <ul className='cndScoreView'>
                            <li>Match Score</li>
                            <li>80%</li>
                            <li><button className='profileButton' onClick={navigateCandidateProfile}>View Profile</button></li>
                        </ul>
                    </div>
                </li>
            ))}

        </ul></div>
    );

}

export default RenderList;