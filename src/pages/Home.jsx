import React from "react";
import Navbar from "../components/navBar/navBar.jsx";

const Home = () => {
  return (
    <div>

      {/* Navbar */}

      <Navbar />

      {/* Temporary Content */}

      <div className="flex justify-center items-center h-[80vh]">

        <h1 className="text-5xl font-bold text-purple-800">
          Welcome to Hire-Radar 
        </h1>

      </div>

    </div>
  );
};

export default Home;