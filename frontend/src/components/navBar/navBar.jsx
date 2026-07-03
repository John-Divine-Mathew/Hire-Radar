import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthUser, logoutUser, isAuthenticated } from "../../utils/auth";
import { Search } from "lucide-react";

const Navbar = () => {


  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

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

      <nav className="sticky top-0 z-50 w-full bg-white border-b border-slate-200">

        <div className="w-full px-6 py-3 flex justify-between items-center gap-6">

          {/* Logo */}

          <div className="flex items-center gap-4 min-w-0">
            <img
              src="/hirotec-logo.webp" 
              alt="HIROTEC Logo"
              className="h-16 w-auto object-contain" 
            />

            <h1 className="text-3xl font-extrabold text-purple-700 whitespace-nowrap">
              Hire-Radar
            </h1>

          </div>

          {/* Buttons / Controls */}

          <div className="flex items-center gap-4 shrink-0">

            {/* Search */}
            <div className="group relative h-10 w-10 overflow-hidden rounded-lg border border-transparent bg-white transition-all duration-200 hover:w-64 hover:border-slate-200 focus-within:w-64 focus-within:border-slate-200">
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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>

              {/* Logged-in info button (near calendar) */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu((s) => !s)}
                  title="Logged in user"
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
                      <p className="font-semibold text-sm">{authUser?.name || fallbackUser?.name || authUser?.email || fallbackUser?.email || 'HR Admin'}</p>
                      <p className="text-xs text-gray-500">{authUser?.email || fallbackUser?.email || ''}</p>
                </div>

                    <button
                      onClick={() => { setShowUserMenu(false); setShowLogoutConfirm(true); }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors duration-150"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>

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
            <h3 className="text-xl font-semibold text-gray-800 mb-4">are u confirm to logout</h3>

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
