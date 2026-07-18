import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAuthUser, logoutUser, isAuthenticated } from "../../utils/auth";
import { Search } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Safely capture destructuring with a fallback to avoid crash if location.state is null
  const { name, email } = location.state || {};

  const [searchQuery, setSearchQuery] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const authUser = getAuthUser();
  // Fallback to the 'user' key if hireRadarAuth is not set
  const fallbackUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch (e) {
      return null;
    }
  })();

  // 1. Resolve the display name string prioritizing router state
  const displayName = name || authUser?.name || fallbackUser?.name || email || authUser?.email || fallbackUser?.email || 'HR Admin';

  // 2. Resolve the display email string prioritizing router state
  const displayEmail = email || authUser?.email || fallbackUser?.email || '';

  // 3. Resolve the single initial character dynamically based on the available name
  const initial = displayName?.[0]?.toUpperCase() || "H";

  return (
    <>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full bg-white border-b border-slate-200">

        <div className="w-full px-3 sm:px-6 py-3 flex justify-between items-center gap-3 sm:gap-6">

          {/* Logo */}

          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <img
              src="/hirotec-logo.webp" 
              alt="HIROTEC Logo"
              className="h-10 sm:h-12 md:h-16 w-auto object-contain" 
            />

            <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-purple-700 whitespace-nowrap">
              Hire-Radar
            </h1>
          </div>

          {/* Buttons / Controls */}

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">

            {/* Search */}
            <div className="hidden sm:flex group relative h-10 w-10 overflow-hidden rounded-lg border border-transparent bg-white transition-all duration-200 hover:w-48 md:hover:w-64 hover:border-slate-200 focus-within:w-48 md:focus-within:w-64 focus-within:border-slate-200">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700 pointer-events-none">
                <Search className="h-5 w-5 text-current" />
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidates..."
                className="h-full w-full rounded-lg bg-transparent pl-10 pr-4 text-sm opacity-0 outline-none transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
              />
            </div>

            {/* Calendar button */}
            <button title="Calendar" className="p-2 rounded-lg hover:bg-gray-100">
              
            </button>

            {/* User Profile Avatar Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu((s) => !s)}
                title={`Logged in as ${displayName}`}
                className="h-10 w-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-semibold shadow transition-all duration-200 ease-in-out hover:scale-110 hover:shadow-lg hover:bg-purple-700 relative"
                aria-label="User menu"
              >
                {initial}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white absolute bottom-0 right-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b">
                    <p className="font-semibold text-sm truncate">{displayName}</p>
                    {displayEmail && (
                      <p className="text-xs text-gray-500 truncate">{displayEmail}</p>
                    )}
                  </div>

                  <button
                    onClick={() => { setShowUserMenu(false); setShowLogoutConfirm(true); }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600 transition-colors duration-150"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Confirm Logout</h3>
            <p className="text-gray-600 text-sm mb-6">Are you sure you want to logout? You will need to login again to continue.</p>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-150 font-medium"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  logoutUser();
                  setShowLogoutConfirm(false);
                  navigate("/");
                }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors duration-150 font-medium"
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