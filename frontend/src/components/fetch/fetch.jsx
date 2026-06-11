import React, { useState, useEffect } from 'react';
import RenderList from '../renderList/renderList.jsx';
import './fetch.css';

function FetchListData(){
    
    const [list,setList] = useState([])

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
    //console.log(list);

    return(
            <div className='renderListDiv'><ul>
                {list.map((i)=>(
                    <RenderList key={i.cndid} name={i.cndname} role={i.cndrole} location={i.cndlocation} status={i.cndstatus} 
                    experience={i.cndexperience} skills={i.cndskills} />
                ))}
            </ul></div>
    );
}
export default FetchListData;