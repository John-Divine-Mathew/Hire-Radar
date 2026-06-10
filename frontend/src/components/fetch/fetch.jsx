import React, { useState, useEffect } from 'react';
import RenderList from '../renderList/renderList.jsx';
import './fetch.css';

function FetchListData(){
    
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
                {/* {list.map(()=>{
                    <RenderList />
                })} */}-
                <RenderList />
                <RenderList />
                <RenderList />
            </ul></div>
    );
}
export default FetchListData;