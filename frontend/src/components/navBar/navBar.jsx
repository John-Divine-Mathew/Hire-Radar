import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAuthUser, logoutUser } from "../../utils/auth";
import {
  Search,
  Settings as SettingsIcon,
  LogOut,
  ChevronDown,
  X,
  Building2,
  User,
  ShieldCheck,
  Briefcase,
  Mail,
  Bell,
  FileText,
  Palette,
  Globe,
  BarChart3,
  Lock,
  Database,
  Info,
  Save,
  CheckCircle2,
  Upload,
  Download
} from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { name, email } = location.state || {};

  // Component States
  const [searchQuery, setSearchQuery] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false); // Controls Settings Modal
  const [activeTab, setActiveTab] = useState("company");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // User details resolution
  const authUser = getAuthUser();
  const fallbackUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch (e) {
      return null;
    }
  })();

  const displayName = name || authUser?.name || fallbackUser?.name || email || authUser?.email || fallbackUser?.email || "HR Admin";
  const displayEmail = email || authUser?.email || fallbackUser?.email || "admin@hireradar.com";
  const initial = displayName?.[0]?.toUpperCase() || "H";

  // Dummy Settings Form States
  const [companySettings, setCompanySettings] = useState({
    name: "HIROTEC INDIA",
    logo: "/hirotec-logo.webp",
    email: "hr@hirotecindia.com",
    phone: "+91 98765 43210",
    address: "SF No. 558/2, Saravanampatti Road, Coimbatore, TN",
    website: "https://www.hirotecindia.com",
  });

  const [userProfile, setUserProfile] = useState({
    name: displayName,
    email: displayEmail,
    phone: "+91 91234 56789",
    designation: "Senior HR Manager",
  });

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const navItems = [
    { id: "company", label: "Company Settings", icon: Building2 },
    { id: "profile", label: "User Profile", icon: User },
    { id: "roles", label: "Roles & Permissions", icon: ShieldCheck },
    { id: "recruitment", label: "Recruitment", icon: Briefcase },
    { id: "email", label: "Email Settings", icon: Mail },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "resume", label: "Resume Settings", icon: FileText },
    { id: "theme", label: "Theme", icon: Palette },
    { id: "language", label: "Language", icon: Globe },
    { id: "reports", label: "Reports", icon: BarChart3 },
    { id: "security", label: "Security", icon: Lock },
    { id: "backup", label: "Backup & Restore", icon: Database },
    { id: "about", label: "About", icon: Info },
  ];

  return (
    <>
      {/* Navbar Header */}
      <nav className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-sm">
        <div className="w-full px-4 sm:px-6 py-3 flex justify-between items-center gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/dashboard")}>
            <img
              src="/hirotec-logo.webp"
              alt="HIROTEC Logo"
              className="h-10 sm:h-12 w-auto object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = "none";
              }}
            />
            <h1 className="text-xl sm:text-2xl font-extrabold text-purple-700 tracking-tight">
              Hire-Radar
            </h1>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            
            {/* Search Input */}
            <div className="hidden sm:flex group relative h-10 w-10 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition-all duration-200 hover:w-56 focus-within:w-56 focus-within:border-purple-400 focus-within:bg-white">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidates..."
                className="h-full w-full bg-transparent pl-9 pr-3 text-sm opacity-0 outline-none transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
              />
            </div>

            {/* Profile Avatar Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu((prev) => !prev)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition"
              >
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-700 to-indigo-600 text-white font-bold text-base flex items-center justify-center shadow-sm border border-purple-200">
                  {initial}
                </div>
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </button>

              {/* User Menu Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="font-bold text-sm text-slate-800 truncate">{displayName}</p>
                    <p className="text-xs text-slate-500 truncate">{displayEmail}</p>
                  </div>

                  {/* TRIGGERS SETTINGS MODAL */}
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      setShowSettings(true);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-purple-50 text-xs font-semibold text-purple-700 flex items-center gap-2 transition"
                  >
                    <SettingsIcon className="w-4 h-4 text-purple-600" />
                    Settings
                  </button>

                  {/* TRIGGERS LOGOUT CONFIRMATION */}
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      setShowLogoutConfirm(true);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-xs font-semibold text-red-600 flex items-center gap-2 transition"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    Logout
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </nav>

      {/* ==========================================
          SETTINGS MODAL OVERLAY (Triggered by Button)
         ========================================== */}
      {showSettings && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-white w-full max-w-5xl h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-xl text-purple-700">
                  <SettingsIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">System Settings</h2>
                  <p className="text-xs text-slate-500">Manage application features and parameters</p>
                </div>
              </div>

              {savedSuccess && (
                <div className="hidden sm:flex items-center gap-2 bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Settings Saved!
                </div>
              )}

              <button
                onClick={() => setShowSettings(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Grid */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 overflow-hidden">
              
              {/* Settings Nav Sidebar */}
              <div className="p-3 border-r border-slate-200 overflow-y-auto bg-slate-50/50 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                        isActive
                          ? "bg-purple-600 text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-200/60"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Feature Display Area */}
              <div className="md:col-span-3 p-6 overflow-y-auto bg-white">
                <form onSubmit={handleSaveSettings} className="space-y-6">
                  
                  {/* 1. Company Settings */}
                  {activeTab === "company" && (
                    <div className="space-y-4">
                      <h3 className="font-bold text-slate-800 text-base pb-2 border-b">Company Settings</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-slate-600">Company Name</label>
                          <input type="text" value={companySettings.name} onChange={(e)=>setCompanySettings({...companySettings, name: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-purple-500 outline-none" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-600">Company Email</label>
                          <input type="email" value={companySettings.email} onChange={(e)=>setCompanySettings({...companySettings, email: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-purple-500 outline-none" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-600">Contact Number</label>
                          <input type="text" value={companySettings.phone} onChange={(e)=>setCompanySettings({...companySettings, phone: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-purple-500 outline-none" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-600">Website</label>
                          <input type="text" value={companySettings.website} onChange={(e)=>setCompanySettings({...companySettings, website: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-purple-500 outline-none" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. User Profile */}
                  {activeTab === "profile" && (
                    <div className="space-y-4">
                      <h3 className="font-bold text-slate-800 text-base pb-2 border-b">User Profile</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-slate-600">Full Name</label>
                          <input type="text" value={userProfile.name} onChange={(e)=>setUserProfile({...userProfile, name: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-xl text-xs outline-none" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-600">Designation</label>
                          <input type="text" value={userProfile.designation} onChange={(e)=>setUserProfile({...userProfile, designation: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-xl text-xs outline-none" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. Roles & Permissions */}
                  {activeTab === "roles" && (
                    <div className="space-y-3">
                      <h3 className="font-bold text-slate-800 text-base pb-2 border-b">Roles & Permissions</h3>
                      {["HR Admin", "HR Executive", "Manager", "Interview Panel", "Employee"].map((role, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 border rounded-xl">
                          <span className="text-xs font-semibold text-slate-700">{role}</span>
                          <input type="checkbox" defaultChecked={idx < 2} className="w-4 h-4 text-purple-600" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 4. Recruitment Settings */}
                  {activeTab === "recruitment" && (
                    <div className="space-y-4">
                      <h3 className="font-bold text-slate-800 text-base pb-2 border-b">Recruitment Settings</h3>
                      <div>
                        <label className="text-xs font-medium text-slate-600">Default Interview Duration</label>
                        <select className="w-full mt-1 px-3 py-2 border rounded-xl text-xs outline-none">
                          <option>30 Minutes</option>
                          <option>45 Minutes</option>
                          <option>60 Minutes</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Fallback for rest of features */}
                  {!["company", "profile", "roles", "recruitment"].includes(activeTab) && (
                    <div className="space-y-4">
                      <h3 className="font-bold text-slate-800 text-base pb-2 border-b capitalize">{activeTab} Settings</h3>
                      <p className="text-xs text-slate-500">Configure parameters for {activeTab}.</p>
                      <div className="p-4 bg-slate-50 border rounded-xl text-xs text-slate-600">
                        Feature options loaded for {activeTab}. Modify selections and click save below.
                      </div>
                    </div>
                  )}

                  {/* Save Action */}
                  <div className="pt-4 border-t flex justify-end">
                    <button
                      type="submit"
                      className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2 rounded-xl text-xs font-semibold hover:bg-purple-700 transition"
                    >
                      <Save className="w-4 h-4" /> Save Changes
                    </button>
                  </div>

                </form>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Confirm Logout</h3>
            <p className="text-slate-600 text-sm mb-6">Are you sure you want to log out of Hire Radar?</p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  logoutUser();
                  setShowLogoutConfirm(false);
                  navigate("/");
                }}
                className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 text-xs font-semibold"
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