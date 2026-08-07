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
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  ChevronsLeft
} from "lucide-react";

// --- GLOBAL CALENDAR HELPER FUNCTIONS ---
const DURATION_MINUTES = {
  "30 minutes": 30,
  "60 minutes": 60,
  "90 minutes": 90,
};

const GRID_START_MINUTES = 9 * 60;   // 9:00 AM
const GRID_END_MINUTES = 18 * 60;    // 6:00 PM

function parseTimeToMinutes(label) {
  const [time, modifier] = label.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (modifier === 'PM' && hours !== 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function formatMinutesToTime(totalMinutes) {
  const hours24 = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  const modifier = hours24 >= 12 ? 'PM' : 'AM';
  let displayHours = hours24 % 12;
  if (displayHours === 0) displayHours = 12;
  return `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${modifier}`;
}

function generateTimeSlots(startMinutes, endMinutes) {
  const slots = [];
  for (let m = startMinutes; m <= endMinutes; m += 30) {
    slots.push(formatMinutesToTime(m));
  }
  return slots;
}

// --- DEPARTMENT ROLES ---
const baseRoles = [
  'Software Development', 'Automation', 'Mechanical',
  'Quality Assurance', 'Human Resource', 'Production'
];

const extendedRoles = baseRoles.flatMap(role => [
  role,
  `Senior ${role}`,
  `Super Senior ${role}`
]);

// --- GLOBAL CALENDAR MODAL COMPONENT ---
function GlobalCalendarModal({ onClose }) {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [selectedDuration, setSelectedDuration] = useState("60 minutes");
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [isBooked, setIsBooked] = useState(false);
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null); 
  
  // Controls expanding/collapsing of the slots panel
  const [showSlots, setShowSlots] = useState(true); 

  // --- NEW: Global specific states for Candidates and Departments ---
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState(extendedRoles[0]);

  // Fetch candidates from cndpermsave on load
  useEffect(() => {
    fetch("http://localhost:5000/hireRadar/cndpermsave")
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setCandidates(data);
          setSelectedCandidateId(data[0].cndid);
        }
      })
      .catch(err => console.error("Error fetching candidates:", err));
  }, []);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const prefixDays = [28, 29, 30];
  const totalDays = 31;
  const suffixDays = [1, 2, 3, 4, 5, 6, 7, 8];

  const timeSlots = generateTimeSlots(GRID_START_MINUTES, GRID_END_MINUTES);
  const gridEndMinutes = GRID_END_MINUTES;

  function getRangeForStart(startTime, duration) {
    const startMinutes = parseTimeToMinutes(startTime);
    const durationMins = DURATION_MINUTES[duration] ?? 30;
    const endMinutes = startMinutes + durationMins;
    const blockLabels = timeSlots.filter((t) => {
      const m = parseTimeToMinutes(t);
      return m >= startMinutes && m <= endMinutes;
    });
    return { startMinutes, endMinutes, endLabel: formatMinutesToTime(endMinutes), blockLabels };
  }

  const selectSlot = (time) => {
    if (selectedSlot === time) {
      setSelectedSlot(null);
      return;
    }
    const { endMinutes } = getRangeForStart(time, selectedDuration);
    if (endMinutes > gridEndMinutes) return;
    setSelectedSlot(time);
  };

  useEffect(() => {
    if (!selectedSlot) return;
    const { endMinutes } = getRangeForStart(selectedSlot, selectedDuration);
    if (endMinutes > gridEndMinutes) setSelectedSlot(null);
  }, [selectedDuration]);

  const activeRange = selectedSlot ? getRangeForStart(selectedSlot, selectedDuration) : null;

  const handleBookSlot = () => {
    if (!selectedSlot) return;
    setIsBooked(false);
    setEmailStatus(null);
    setShowEmailPrompt(true); // Triggers the prompt for Candidate Name & Department
  };

  const handleConfirmSendEmail = async () => {
    if (!selectedCandidateId) {
        alert("Please select a candidate.");
        return;
    }

    try {
      const dateObj = new Date(currentYear, currentMonth, selectedDate);
      
      // Parse Start Time
      const [startHourStr, startMinStr, startMod] = selectedSlot.split(/[:\s]/);
      let startH = parseInt(startHourStr);
      if (startMod === 'PM' && startH !== 12) startH += 12;
      if (startMod === 'AM' && startH === 12) startH = 0;
      
      const startTime = new Date(dateObj);
      startTime.setHours(startH, parseInt(startMinStr), 0);
      
      // Parse End Time
      const [endHourStr, endMinStr, endMod] = activeRange.endLabel.split(/[:\s]/);
      let endH = parseInt(endHourStr);
      if (endMod === 'PM' && endH !== 12) endH += 12;
      if (endMod === 'AM' && endH === 12) endH = 0;
      
      const endTime = new Date(dateObj);
      endTime.setHours(endH, parseInt(endMinStr), 0);

      const payload = {
        cndid: selectedCandidateId,
        department: selectedDepartment,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        date: dateObj.toISOString()
      };

      const res = await fetch("http://localhost:5000/hireRadar/sendemail", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(payload)
      });

      if (res.ok) {
         setEmailStatus('sent');
         setIsBooked(true);
      } else {
         console.error("Failed to send email.");
         alert("Failed to send email. Please check server logs.");
      }
    } catch (e) {
       console.error("Booking Error:", e);
    }
  };

  const isPastDate = (day) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(currentYear, currentMonth, day);
    return targetDate < today;
  };

  const isPastTimeSlot = (timeLabel) => {
    const today = new Date();
    const targetDate = new Date(currentYear, currentMonth, selectedDate);
    const targetTime = targetDate.setHours(0,0,0,0);
    const todayTime = new Date().setHours(0,0,0,0);

    if (targetTime < todayTime) return true;
    if (targetTime > todayTime) return false;

    const currentMinutesSinceMidnight = today.getHours() * 60 + today.getMinutes();
    const slotMinutes = parseTimeToMinutes(timeLabel);
    return slotMinutes < currentMinutesSinceMidnight;
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4 transition-all">
      {/* Dynamic width container based on showSlots state */}
      <div className={`w-full mx-auto p-6 bg-white border border-gray-100 rounded-2xl shadow-xl font-sans text-gray-800 relative transition-all duration-300 ${showSlots ? 'max-w-4xl' : 'max-w-md'}`}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10" title="Close">
          <X size={20} />
        </button>

        <div className={`grid grid-cols-1 ${showSlots ? 'md:grid-cols-12 gap-8' : 'gap-0'}`}>
          
          {/* Left Side: Calendar */}
          <div className={`${showSlots ? 'md:col-span-5 border-r border-gray-100 pr-0 md:pr-6' : ''}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">{monthNames[currentMonth]}, {currentYear}</h2>
              <div className="flex items-center space-x-1">
                <button onClick={() => setCurrentMonth(prev => prev === 0 ? 11 : prev - 1)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
                  <ChevronLeft size={18} />
                </button>
                <button onClick={() => setCurrentMonth(prev => prev === 11 ? 0 : prev + 1)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
                  <ChevronRight size={18} />
                </button>
                
                {/* Expand / Collapse Button */}
                <div className="w-px h-5 bg-gray-200 mx-1"></div>
                <button 
                  onClick={() => setShowSlots(!showSlots)} 
                  className="p-1.5 rounded-lg hover:bg-purple-100 text-purple-700 transition-colors"
                  title={showSlots ? "Collapse Slots" : "Expand Slots"}
                >
                  {showSlots ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {daysOfWeek.map((day) => (<span key={day} className="text-sm font-semibold text-gray-400 py-1">{day}</span>))}
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {prefixDays.map((day, idx) => (<span key={`prev-${idx}`} className="text-sm text-gray-300 py-2.5">{day}</span>))}
              {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => {
                const isSelected = day === selectedDate;
                const isPast = isPastDate(day);
                return (
                  <button
                    key={`day-${day}`}
                    onClick={() => !isPast && setSelectedDate(day)}
                    disabled={isPast}
                    className={`text-sm font-medium py-2.5 rounded-full transition-all relative flex items-center justify-center m-auto h-9 w-9 ${isPast ? 'text-gray-300 cursor-not-allowed bg-transparent' : isSelected ? 'bg-purple-700 text-white font-bold shadow-md shadow-purple-200' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    {day}
                  </button>
                );
              })}
              {suffixDays.map((day, idx) => (<span key={`next-${idx}`} className="text-sm text-gray-300 py-2.5">{day}</span>))}
            </div>
          </div>

          {/* Right Side: Slots - Only renders if showSlots is true */}
          {showSlots && (
            <div className="md:col-span-7 flex flex-col justify-between animate-in fade-in zoom-in-95 duration-200">
              <div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Slots for {monthNames[currentMonth]} {selectedDate}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">9:00 AM - 6:00 PM</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full">
                    {selectedSlot ? `${selectedSlot} - ${activeRange?.endLabel}` : '0 Selected'}
                  </span>
                </div>

                <div className="mb-5">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Select Duration</label>
                  <div className="relative w-48">
                    <select value={selectedDuration} onChange={(e) => setSelectedDuration(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 appearance-none focus:outline-none focus:border-purple-700 cursor-pointer">
                      <option>30 minutes</option>
                      <option>60 minutes</option>
                      <option>90 minutes</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1">
                  {timeSlots.map((time) => {
                    const isInRange = !!activeRange && activeRange.blockLabels.includes(time);
                    const isStart = time === selectedSlot;
                    const { endMinutes } = getRangeForStart(time, selectedDuration);
                    const wouldOverflow = endMinutes > gridEndMinutes;
                    const isPastTime = isPastTimeSlot(time);

                    return (
                      <button
                        key={time}
                        onClick={() => selectSlot(time)}
                        disabled={isPastTime || (!isInRange && wouldOverflow)}
                        className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all text-center ${isInRange && !isPastTime ? isStart ? 'bg-purple-700 border-purple-700 text-white font-semibold' : 'bg-purple-50 border-purple-700 text-purple-700 font-semibold' : (wouldOverflow || isPastTime) ? 'bg-white border-gray-100 text-gray-300 cursor-not-allowed' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'}`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-end">
                <div className="flex space-x-2">
                  <button onClick={() => { setSelectedSlot(null); setIsBooked(false); }} className="px-4 py-2 text-xs font-semibold text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Clear</button>
                  <button onClick={handleBookSlot} disabled={!selectedSlot} className={`px-4 py-2 text-xs font-semibold rounded-lg shadow-sm transition-colors ${!selectedSlot ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-purple-700 text-white hover:bg-purple-800'}`}>Book Slot</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Global Prompt for Candidate Name and Department */}
        {showEmailPrompt && (
          <div className="absolute inset-0 bg-black/30 rounded-2xl flex items-center justify-center z-10">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-sm mx-4 p-6">
              {emailStatus === null && (
                <>
                  <div className="flex items-center gap-2 mb-4 text-purple-700">
                    <Mail size={20} />
                    <h4 className="text-base font-bold text-gray-900">Finalize Booking details</h4>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Select Candidate</label>
                      <select 
                        value={selectedCandidateId} 
                        onChange={(e) => setSelectedCandidateId(e.target.value)} 
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-purple-700 focus:ring-1 focus:ring-purple-700"
                      >
                        <option value="" disabled>Select a candidate</option>
                        {candidates.map(c => (
                          <option key={c.cndid} value={c.cndid}>
                            {c.cndname} ({c.cndemail})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Department / Role</label>
                      <select 
                        value={selectedDepartment} 
                        onChange={(e) => setSelectedDepartment(e.target.value)} 
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-purple-700 focus:ring-1 focus:ring-purple-700"
                      >
                        {extendedRoles.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button onClick={() => { setEmailStatus('skipped'); onClose(); }} className="px-4 py-2 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg transition-colors">Cancel</button>
                    <button onClick={handleConfirmSendEmail} className="px-4 py-2 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-sm transition-colors">Send Email</button>
                  </div>
                </>
              )}

              {emailStatus === 'sent' && (
                <>
                  <div className="flex items-center gap-2 mb-2 text-purple-700"><CheckCircle2 size={20} /><h4 className="text-base font-bold text-gray-900">Email sent</h4></div>
                  <div className="text-sm text-gray-500 mb-5">A confirmation email for the booked slot has been sent to the candidate.</div>
                  <div className="flex justify-end"><button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-sm transition-colors">Done</button></div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- NAVBAR COMPONENT ---
const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { name, email } = location.state || {};

  const [searchQuery, setSearchQuery] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showGlobalCalendar, setShowGlobalCalendar] = useState(false);
  const [activeTab, setActiveTab] = useState("company");
  const [savedSuccess, setSavedSuccess] = useState(false);

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

  useEffect(() => {
    if (name || email) {
      const existingUser = fallbackUser || {};
      const updatedUser = { ...existingUser, ...(name && { name }), ...(email && { email }) };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  }, [name, email]);

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
    setUserProfile((prev) => ({ ...prev, name: displayName, email: displayEmail }));
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

  return (
    <>
      <nav className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-sm">
        <div className="w-full px-4 sm:px-6 py-3 flex justify-between items-center gap-4">
          
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

          <div className="flex items-center gap-4">
            
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

            {/* --- GLOBAL CALENDAR BUTTON --- */}
            <button
              onClick={() => setShowGlobalCalendar(true)}
              className="p-2 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-full transition-colors relative"
              title="Global Calendar"
            >
              <Calendar className="w-5 h-5" />
            </button>

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

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="font-bold text-sm text-slate-800 truncate">{displayName}</p>
                    <p className="text-xs text-slate-500 truncate">{displayEmail}</p>
                  </div>

                  <button
                    onClick={() => { setShowUserMenu(false); setShowSettings(true); }}
                    className="w-full text-left px-4 py-2.5 hover:bg-purple-50 text-xs font-semibold text-purple-700 flex items-center gap-2 transition"
                  >
                    <SettingsIcon className="w-4 h-4 text-purple-600" /> Settings
                  </button>

                  <button
                    onClick={() => { setShowUserMenu(false); setShowLogoutConfirm(true); }}
                    className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-xs font-semibold text-red-600 flex items-center gap-2 transition"
                  >
                    <LogOut className="w-4 h-4 text-red-500" /> Logout
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </nav>

      {/* --- GLOBAL CALENDAR MODAL OVERLAY --- */}
      {showGlobalCalendar && (
        <GlobalCalendarModal onClose={() => setShowGlobalCalendar(false)} />
      )}

      {/* SETTINGS MODAL OVERLAY */}
      {showSettings && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-white w-full max-w-5xl h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
            
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

              <button onClick={() => setShowSettings(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 overflow-hidden">
              <div className="p-3 border-r border-slate-200 overflow-y-auto bg-slate-50/50 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${isActive ? "bg-purple-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-200/60"}`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>

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
                    <button type="submit" className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2 rounded-xl text-xs font-semibold hover:bg-purple-700 transition">
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
              <button onClick={() => setShowLogoutConfirm(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold">Cancel</button>
              <button onClick={() => { logoutUser(); localStorage.clear(); setShowLogoutConfirm(false); navigate("/"); }} className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 text-xs font-semibold">Logout</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;