import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthUser, logoutUser, isAuthenticated } from "../../utils/auth";

const Navbar = () => {


  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const authUser = getAuthUser();
  // fallback to the 'user' key (used by AdminLogin) if hireRadarAuth is not set
  const fallbackUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch (e) {
      return null;
    }
  })();

  const initial =
    authUser?.name?.[0]?.toUpperCase() ||
    authUser?.role?.[0]?.toUpperCase() ||
    fallbackUser?.name?.[0]?.toUpperCase() ||
    fallbackUser?.email?.[0]?.toUpperCase() ||
    "H";

  return (
    <>
      {/* Navbar */}

      <nav className="sticky top-0 z-50 bg-white shadow-lg border-b">

        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">

          {/* Logo */}

          <div className="flex items-center gap-4">
            <img
              src="/hirotec-logo.webp" 
              alt="HIROTEC Logo"
              className="h-20 w-auto object-contain" 
            />

            <h1 className="text-3xl font-extrabold text-purple-700 ">
              Hire-Radar
            </h1>

          </div>

          {/* Buttons / Controls */}

          <div className="flex items-center gap-4">

            {/* Search */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7 7 0 1116.65 16.65z" />
                </svg>
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidates..."
                className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Calendar button */}
            <button title="Calendar" className="p-2 rounded-lg hover:bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>

            {/* Support removed from navbar (moved to landing page) */}

            {/* Auth / User initial */}
            {isAuthenticated() ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown((s) => !s)}
                  className="h-10 w-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-semibold shadow"
                  aria-label="User menu"
                >
                  {initial}
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg py-2">
                    <button
                      onClick={() => { setShowDropdown(false); setShowLogoutConfirm(true); }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                
              </>
            )}

          </div>

        </div>

      </nav>

      {/* Support removed from navbar (moved to landing page) */}

      {/* Logout Confirmation Modal */}

      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white w-[380px] rounded-2xl shadow-2xl p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Are you sure to quit?</h3>
            <p className="text-sm text-gray-600 mb-6">You will be logged out from the admin session.</p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 rounded-lg border hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  logoutUser();
                  setShowLogoutConfirm(false);
                  navigate("/");
                }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default Navbar;