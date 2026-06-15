import React, { useState } from "react";
import SupportModal from "./SupportModal";

import { useNavigate } from "react-router-dom";

const Navbar = () => {

  const [showModal, setShowModal] = useState(false);

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

          <button className="hover:text-purple-700">
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

        <button
          onClick={() => navigate("/login")}
          className="bg-purple-700 hover:bg-purple-800 text-white px-6 py-2 rounded-lg"
        >
          Login
        </button>

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