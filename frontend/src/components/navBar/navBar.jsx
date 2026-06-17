import React, { useState } from "react";
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

  const [showSupport, setShowSupport] = useState(false);

  return (

    <>
    
      {/* Navbar */}

      <nav className="w-full bg-white shadow-md px-10 py-4 flex items-center justify-between">

        {/* Logo */}

        <div>
          <h1 className="text-3xl font-bold text-purple-700">
            Hire-Radar
          </h1>
        </div>

        {/* Menu */}

        <div className="flex items-center gap-8 text-gray-700 font-medium">

          <a onClick={navigateHome}
            href="#"
            className="hover:text-purple-700 transition duration-300"
          >
            Home
          </a>

          <a
            href="#"
            className="hover:text-purple-700 transition duration-300"
          >
            Features
          </a>

          <a
            href="#"
            className="hover:text-purple-700 transition duration-300"
          >
            About
          </a>

          {/* Support Button */}

          <button
            onClick={() => setShowSupport(true)}
            className="hover:text-purple-800 transition duration-300"
          >
            Support
          </button>

        </div>

        {/* Login Button */}

        <div>

          <button
            className="bg-purple-700 hover:bg-purple-800 text-white px-6 py-2 rounded-lg transition duration-300"
            onClick={navigateSearchCandidate}
          >
            Pages
          </button>

        </div>

      </nav>

      {/* Support Modal */}

      {
        showSupport && (

          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">

            {/* Modal Box */}

            <div className="bg-white w-[400px] rounded-2xl shadow-2xl p-8">

              <h2 className="text-3xl font-bold text-purple-700 mb-6 text-center">
                Developer Support 
              </h2>

              {/* Details */}

              <div className="space-y-4 text-gray-700">

                <p>
                  <span className="font-bold">
                    Developer Name:
                  </span>
                  {" "}

                <p>John Divine Mathew J</p>
                <p> Vijayanandha </p>
                <p>Bharathsnehan</p>
                  
                 
                </p>

                <p>
                  <span className="font-bold">
                    Email:
                  </span>
                  {" "}
               
                </p>
                <p> mathewdivine95@gmail.com</p>
                <p>vijayanandhaj@gmail.com</p>
                <p>bharathsnehan@gmail.com</p>
                <p>
                  <span className="font-bold">
                    Phone & WhatsApp:
                  </span>
                  {" "}
                </p>
                 <p>+91 9626749641,+91 7373774847,+91 7448540072</p>

                <p>
                  <span className="font-bold">
                    Department:
                  </span>
                  {" "}
                  Automation
                </p>

                <p>
                  <span className="font-bold">
                    Working Hours:
                  </span>
                  {" "}
                  9:00 AM - 6:00 PM
                </p>

                <p>
                  <span className="font-bold">
                    Working Days:
                  </span>
                  {" "}
                  Monday to Friday 
                </p>

              </div>

              {/* Close Button */}

              <div className="mt-8 flex justify-center">

                <button
                  onClick={() => setShowSupport(false)}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition duration-300"
                >
                  Close
                </button>

              </div>

            </div>

          </div>

        )
      }

    </>
  );
};

export default Navbar;