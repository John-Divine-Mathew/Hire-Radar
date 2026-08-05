import React, { useState, useEffect } from "react";
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
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Safely extract user details passed from router location state
  const { name, email } = location.state || {};

  // Component States
  const [searchQuery, setSearchQuery] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState("company");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Calendar & Booking Modal States
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  // Real-time Clock & Date State
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format date and time
  const formattedDate = currentTime.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const formattedTime = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // 2. Fetch authenticated user from auth utility
  const authUser = getAuthUser();

  // 3. Fallback reader for persisted user data in localStorage
  const fallbackUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch (e) {
      return null;
    }
  })();

  // 4. Resolve display name & email across all possible sources
  const displayName =
    name ||
    authUser?.name ||
    fallbackUser?.name ||
    email ||
    authUser?.email ||
    fallbackUser?.email ||
    "HR Admin";

  const displayEmail =
    email ||
    authUser?.email ||
    fallbackUser?.email ||
    "admin@hireradar.com";

  const initial = displayName?.[0]?.toUpperCase() || "H";

  // 5. Save incoming location.state user data to localStorage
  useEffect(() => {
    if (name || email) {
      const existingUser = fallbackUser || {};
      const updatedUser = {
        ...existingUser,
        ...(name && { name }),
        ...(email && { email }),
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  }, [name, email]);

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

  useEffect(() => {
    setUserProfile((prev) => ({
      ...prev,
      name: displayName,
      email: displayEmail,
    }));
  }, [displayName, displayEmail]);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    const updatedUser = { ...(fallbackUser || {}), name: userProfile.name, email: userProfile.email };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    
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

  // Calendar Helper Functions
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const availableSlots = [
    "09:00 AM - 09:30 AM",
    "10:00 AM - 10:30 AM",
    "11:30 AM - 12:00 PM",
    "02:00 PM - 02:30 PM",
    "03:30 PM - 04:00 PM",
    "04:30 PM - 05:00 PM",
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

            {/* Real-time Calendar & Clock Widget (Clickable) */}
            <div 
              onClick={() => setShowCalendarModal(true)}
              className="hidden md:flex items-center gap-3 px-3.5 py-1.5 bg-purple-50/70 border border-purple-200/60 rounded-xl shadow-2xs cursor-pointer hover:bg-purple-100/70 transition"
            >
              <div className="p-1.5 bg-purple-600 text-white rounded-lg shadow-2xs">
                <CalendarIcon className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-purple-900 leading-tight">
                  {formattedDate}
                </span>
                <span className="text-[11px] font-semibold text-purple-700/80 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3 text-purple-600" />
                  {formattedTime}
                </span>
              </div>
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

      {/* CALENDAR & SLOT BOOKING MODAL */}
      {showCalendarModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-xl text-purple-700">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Schedule Interview Slot</h2>
                  <p className="text-xs text-slate-500">Pick a date and choose an available time slot</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCalendarModal(false);
                  setSelectedSlot(null);
                  setBookingConfirmed(false);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Left Column: Calendar View */}
              <div className="border-r sm:pr-6 border-slate-100 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-800 text-sm">
                    {currentMonth.toLocaleString("default", { month: "long" })} {currentMonth.getFullYear()}
                  </h3>
                  <div className="flex gap-1">
                    <button onClick={handlePrevMonth} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={handleNextMonth} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Weekdays Header */}
                <div className="grid grid-cols-7 text-center text-[11px] font-bold text-slate-400 mb-2">
                  <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1 text-xs">
                  {Array.from({ length: getFirstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth()) }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {Array.from({ length: getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth()) }).map((_, i) => {
                    const dayNum = i + 1;
                    const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNum);
                    const isSelected = selectedDate.toDateString() === dateObj.toDateString();

                    return (
                      <button
                        key={dayNum}
                        onClick={() => {
                          setSelectedDate(dateObj);
                          setSelectedSlot(null);
                          setBookingConfirmed(false);
                        }}
                        className={`h-8 w-8 mx-auto rounded-full flex items-center justify-center font-semibold transition ${
                          isSelected
                            ? "bg-purple-600 text-white shadow-sm"
                            : "hover:bg-purple-50 text-slate-700"
                        }`}
                      >
                        {dayNum}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Time Slots */}
              <div className="flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm mb-2">
                    Available Slots for {selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </h3>
                  
                  {bookingConfirmed ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2 mt-6">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                      <p className="text-xs font-bold text-emerald-800">Slot Booked Successfully!</p>
                      <p className="text-[11px] text-emerald-600">
                        {selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} at {selectedSlot}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 mt-2 max-h-52 overflow-y-auto pr-1">
                      {availableSlots.map((slot, idx) => {
                        const isSlotSelected = selectedSlot === slot;
                        return (
                          <button
                            key={idx}
                            onClick={() => setSelectedSlot(slot)}
                            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold border transition ${
                              isSlotSelected
                                ? "border-purple-600 bg-purple-50 text-purple-700"
                                : "border-slate-200 hover:bg-slate-50 text-slate-700"
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {!bookingConfirmed && (
                  <button
                    disabled={!selectedSlot}
                    onClick={() => setBookingConfirmed(true)}
                    className={`w-full mt-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                      selectedSlot
                        ? "bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    Confirm Booking Slot
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* SETTINGS MODAL OVERLAY */}
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

                  {!["company", "profile", "roles", "recruitment"].includes(activeTab) && (
                    <div className="space-y-4">
                      <h3 className="font-bold text-slate-800 text-base pb-2 border-b capitalize">{activeTab} Settings</h3>
                      <p className="text-xs text-slate-500">Configure parameters for {activeTab}.</p>
                      <div className="p-4 bg-slate-50 border rounded-xl text-xs text-slate-600">
                        Feature options loaded for {activeTab}. Modify selections and click save below.
                      </div>
                    </div>
                  )}

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
                  localStorage.clear();
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