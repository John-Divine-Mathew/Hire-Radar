import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
 
const AdminLogin = () => {
 
  const navigate = useNavigate();
  let jsonData;
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [credentialsList, setCredentialsList] = useState([]);


  const fetchData = async()=>{
    try {
      const response = await fetch("http://localhost:5000/hireRadar/getTestDetails");
      jsonData = await response.json();
      setCredentialsList(jsonData);
    } catch (err) {
      console.error(err.message);
    }
  }
  useEffect(()=>{
    fetchData();
  },[]);

  const handleLogin = async(e) => {
    e.preventDefault();

    let flag=0;
    let cndid;
    for (const i of credentialsList){
      if ((i.username===userName) && (i.password===password)){
        flag=1;
        cndid = i.cndid;
      }
    }

    if (
      (flag===1) || ((userName === 'test') && (password === "Hirotec@123")) 
    ) {
 
      alert("Login Successful");

      navigate("/assessmentform",{state:cndid});

    } else {

      alert("Invalid Username or Password");

    }
 
  };
 
  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
 
      <div className="bg-white shadow-lg rounded-xl p-8 w-[400px]">
 
        <h1 className="text-3xl font-bold text-center text-purple-700 mb-6">
          User Login
        </h1>
 
        <form onSubmit={handleLogin}>
 
          <input
            type="text"
            placeholder="Enter username"
            className="w-full border p-3 rounded mb-4"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
 
          <input
            type="password"
            placeholder="Enter Password"
            className="w-full border p-3 rounded mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
 
          <button
            type="submit"
            className="w-full bg-purple-700 hover:bg-purple-800 text-white py-3 rounded-lg"
          >
            Login
          </button>
 
        </form>
 
      </div>
 
    </div>
  );
};
 
export default AdminLogin;
 