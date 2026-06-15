import React, { useState } from "react";
<<<<<<< HEAD:src/components/Navbar.jsx
import SupportModal from "./SupportModal";

import { useNavigate } from "react-router-dom";

const Navbar = () => {

  const [showModal, setShowModal] = useState(false);
=======
import { useNavigate } from 'react-router-dom';

const Navbar = () => {

  const nav = useNavigate();
  const navigateSearchCandidate = ()=>{
    nav('/searchCandidate');
  }
  const navigateHome = ()=>{
    nav('/home');
  }
  // Modal State
>>>>>>> dev:frontend/src/components/navBar/navBar.jsx

  const navigate = useNavigate();

  return (

    <>

      <nav className="w-full bg-white shadow-md px-10 py-4 flex items-center justify-between">

        {/* Logo */}

        <div>

          <h1 className="text-3xl font-bold text-purple-700">
            Hire-Radar
          </h1>

        </div>

        {/* Menu */}

        <div className="flex items-center gap-8 text-gray-700 font-medium">

<<<<<<< HEAD:src/components/Navbar.jsx
          <button className="hover:text-purple-700">
=======
          <a onClick={navigateHome}
            href="#"
            className="hover:text-purple-700 transition duration-300"
          >
>>>>>>> dev:frontend/src/components/navBar/navBar.jsx
            Home
          </button>

          <button className="hover:text-purple-700">
            Features
          </button>

          <button className="hover:text-purple-700">
            About
          </button>

          {/* Support */}

          <button
            onClick={() => setShowModal(true)}
            className="hover:text-purple-700"
          >
            Support
          </button>

        </div>

        {/* Login Button */}

<<<<<<< HEAD:src/components/Navbar.jsx
        <button
          onClick={() => navigate("/login")}
          className="bg-purple-700 hover:bg-purple-800 text-white px-6 py-2 rounded-lg"
        >
          Login
        </button>
=======
        <div>

          <button
            className="bg-purple-700 hover:bg-purple-800 text-white px-6 py-2 rounded-lg transition duration-300"
            onClick={navigateSearchCandidate}
          >
            Pages
          </button>

        </div>
>>>>>>> dev:frontend/src/components/navBar/navBar.jsx

      </nav>

      {/* Support Modal */}

      {
        showModal && (
          <SupportModal closeModal={() => setShowModal(false)} />
        )
      }

    </>

  );
};

export default Navbar;