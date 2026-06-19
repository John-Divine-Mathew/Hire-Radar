import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {

  const navigate = useNavigate();
    
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const teamMembers = [
    "mathewdivine95@gmail.com",
    "bharathjeeva549@gmail.com",
    "vijayanandhaj@gmail.com",
    "test@gmail.com"
  ];

  const handleLogin = (e) => {

    e.preventDefault();

    if (
      teamMembers.includes(email) &&
      password === "Hirotec@123"
    ) {

      alert("Login Successful");

      navigate("/dashboard");

    } else {

      alert("Invalid Email or Password");

    }

  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">

      <div className="bg-white shadow-lg rounded-xl p-8 w-[400px]">

        <h1 className="text-3xl font-bold text-center text-purple-700 mb-6">
          HR / Admin Login
        </h1>

        <form onSubmit={handleLogin}>

            <input 
            type="text"
            placeholder="Enter Name"
            className="w-full border p-3 rounded mb-4"
            value={name}
            onChange={(e) => setName(e.target.value)}
            />  
    
          <input
            type="email"
            placeholder="Enter Email"
            className="w-full border p-3 rounded mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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