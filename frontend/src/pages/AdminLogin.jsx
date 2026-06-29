import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const teamMembers = [
    "mathewdivine95@gmail.com",
    "bharathsnehan011@gmail.com",
    "vijayanandhaj@gmail.com",
    "test@gmail.com",
  ];

  const handleLogin = (e) => {

    e.preventDefault();

    if (
      teamMembers.includes(email) &&
      password === "Hirotec@123"
    ) {

      const userData = {
        name,
        email,
      };

      localStorage.setItem(
        "user",
        JSON.stringify(userData)
      );

      alert("Login Successful");

      navigate("/dashboard");

    } else {

      alert("Invalid Email or Password");

    }

  };

  return (

    <div className="min-h-screen flex overflow-hidden">

      {/* Left Side */}

      <div className="hidden lg:flex w-1/2 relative bg-gradient-to-br from-violet-100 via-purple-200 to-fuchsia-200 justify-center items-center overflow-hidden">

        {/* Animated Blobs */}

        <div className="absolute w-96 h-96 bg-purple-400 rounded-full opacity-20 blur-3xl animate-pulse top-0 -left-20"></div>

        <div className="absolute w-80 h-80 bg-pink-400 rounded-full opacity-20 blur-3xl animate-bounce bottom-10 right-10"></div>

        <div className="absolute w-60 h-60 bg-indigo-300 rounded-full opacity-20 blur-3xl animate-ping top-1/2 left-1/3"></div>

        <div className="relative text-center px-12 z-10">

          <h1 className="text-6xl font-extrabold text-purple-900 tracking-wide">

            Hire-Radar

          </h1>

          <p className="mt-6 text-2xl text-red-800 font-medium">

            Recruitment Management Platform

          </p>

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

      <div className="flex-1 relative flex justify-center items-center bg-gradient-to-bl from-blue-100 via-indigo-100 to-purple-100 overflow-hidden">

        {/* Background Animation */}

        <div className="absolute w-80 h-80 bg-violet-300 rounded-full blur-3xl opacity-20 animate-pulse -top-20 -right-20"></div>

        <div className="absolute w-96 h-96 bg-purple-400 rounded-full blur-3xl opacity-20 animate-bounce bottom-0 -left-20"></div>

        <div className="absolute w-60 h-60 bg-pink-300 rounded-full blur-3xl opacity-20 animate-ping top-40 right-40"></div>

        {/* Login Card */}

        <div className="relative bg-white/70 backdrop-blur-xl border border-white shadow-2xl rounded-3xl w-[450px] p-10">

          <div className="flex justify-center">

            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-700 to-indigo-700 flex items-center justify-center shadow-xl">

              <span className="text-4xl text-white">
                Hello
              </span>

            </div>

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
              type="text"
              placeholder="Enter Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none transition"
            />

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
              className="w-full bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white py-4 rounded-xl text-lg font-semibold shadow-lg transition transform hover:scale-105"
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