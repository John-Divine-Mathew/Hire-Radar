import React, { useState, useEffect } from 'react';

function FetchListData(){

    const getListData = async()=>{
        try {
            const response = await fetch("http://localhost:5000/hireRadar/emptempsave"); // default get req
            const jsonData = await response.json();
            console.log(jsonData);
            
        } catch (err) {
            console.error(err.message);
        }
    }
    useEffect(()=>{
        getListData();
    },[]);
}
export default FetchListData;