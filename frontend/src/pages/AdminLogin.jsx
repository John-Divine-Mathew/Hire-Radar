import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userCredentials, setUserCredentials] = useState([]);
  const [name, setName] = useState("");

  async function fetchTeamMembers(){
    try{
      const response = await fetch("http://localhost:5000/hireRadar/adminlogin");
      const data = await response.json();
      setUserCredentials(data);
      console.log(data);
    } catch(err){
      console.error(err.message);
    }
  }
  useEffect(()=>{
    fetchTeamMembers()
  },[]);

  const handleLogin = (e) => {
    e.preventDefault();

    let matchedUser = null;

    
    for (const user of userCredentials) {
      if (user.useremail === email && user.password === password) {
        matchedUser = user;
        break;
      }
    }

    if (matchedUser) {
      alert("Login Successful");
      const resolvedName = matchedUser.username;
      setName(resolvedName);

      navigate("/dashboard", { state: { name: resolvedName, email: email } });
    } else {
      alert("Invalid Email or Password");
    }
  };

  return (

<div className="relative min-h-screen flex overflow-hidden bg-[#F5F0FF]">

  {/* Background */}

<div className="absolute inset-0 overflow-hidden">

  {/* Purple Glow */}

  <div className="absolute -left-40 top-20 w-[700px] h-[700px]
  rounded-full bg-violet-300/40 blur-[180px]"></div>

  {/* Pink Glow */}

  <div className="absolute -right-40 top-32 w-[650px] h-[650px]
  rounded-full bg-pink-300/40 blur-[180px]"></div>

  {/* Blue Glow */}

  <div className="absolute left-1/2 bottom-[-200px]
  -translate-x-1/2 w-[700px] h-[700px]
  rounded-full bg-indigo-300/20 blur-[200px]"></div>

  {/* Small Glow */}

  <div className="absolute top-10 left-1/3
  w-[300px] h-[300px]
  rounded-full bg-purple-400/20 blur-[120px]"></div>

</div>

      {/* Left Side */}

     <div className="hidden lg:flex w-1/2 relative z-10 justify-center items-center">

        {/* Animated Blobs */}

        <div className="absolute w-96 h-96 bg-purple-400 rounded-full opacity-20 blur-3xl animate-pulse top-0 -left-20"></div>

        <div className="absolute w-80 h-80 bg-pink-400 rounded-full opacity-20 blur-3xl animate-bounce bottom-10 right-10"></div>

        <div className="absolute w-60 h-60 bg-indigo-300 rounded-full opacity-20 blur-3xl animate-ping top-1/2 left-1/3"></div>

        <div className="relative text-center px-12 z-10">

          <h1 className="text-6xl font-extrabold text-purple-900 tracking-wide">

            Hire-Radar

          </h1>

        
          <p className="mt-4 text-lg text-green-700 leading-8">

            AI Powered Recruitment
            <br />
            Candidate Assessment
            <br />
            HR Management Dashboard

          </p>

        </div>

      </div>

      {/* Right Side */}

     <div className="flex-1 relative z-10 flex justify-center items-center">



     {/* Background Decorations */}

<div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-purple-400/30 blur-[150px]"></div>

<div className="absolute top-20 right-0 w-[450px] h-[450px] rounded-full bg-pink-400/30 blur-[150px]"></div>

<div className="absolute bottom-0 left-1/3 w-[450px] h-[450px] rounded-full bg-indigo-400/20 blur-[150px]"></div>
        {/* Login Card */}

   <div   className="
relative
w-[470px]
rounded-[32px]
bg-white/55
backdrop-blur-3xl
border
border-white/60
shadow-[0_30px_80px_rgba(124,58,237,0.20)]
p-10
">

          <div className="flex justify-center">

           

          </div>

          <h1 className="text-4xl font-bold text-center text-purple-700 mt-6">

            HR / Admin Login

          </h1>

          <p className="text-center text-gray-600 mt-3">

            Secure access to Hire-Radar Dashboard

          </p>

          <form
            onSubmit={handleLogin}
            className="mt-8 space-y-5"
          >

            <input
              type="email"
              placeholder="Enter Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none transition"
            />

            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none transition"
            />

            <button
              type="submit"
             className="w-full bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 hover:from-indigo-800 hover:via-purple-800 hover:to-pink-700 text-white py-4 rounded-xl text-lg font-semibold shadow-xl transition-all duration-300 hover:scale-105"
            >

              Login

            </button>

          </form>

          <div className="mt-8 text-center">

            <p className="text-gray-500 text-sm">

              © 2026 Hire-Radar

            </p>

            <p className="text-gray-400 text-xs mt-2">

              Recruitment & Assessment Management System

            </p>

          </div>

        </div>

      </div>

    </div>

  );
};

export default AdminLogin;