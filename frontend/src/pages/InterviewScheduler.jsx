import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from '../components/sideBar/sideBar.jsx';
import Navbar from "../components/navBar/navBar.jsx";


const InterviewScheduler = () => {
  return (
    <div className="min-h-screen bg-slate-50 p-8">

      <Navbar />    
      <Sidebar />
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Interview Scheduler</h1>
        <p className="text-gray-600 mb-6">
          This page is the Interview Scheduler placeholder. Add scheduling workflows,
          calendar integration, and interview management UI here.
        </p>
      </div>
    </div>
  );
};

export default InterviewScheduler;
