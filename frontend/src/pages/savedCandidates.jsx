import Sidebar from "../components/sideBar/sideBar";
import Navbar from "../components/navBar/navBar.jsx";
import { Funnel, Eye, MoreVertical, ChevronDown, ChevronLeft, ChevronRight, X, CheckCircle2, Mail, Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { format } from 'date-fns';
import { useNavigate } from "react-router-dom";
import { nanoid } from 'nanoid';

// Minutes-per-duration lookup, used to work out how many consecutive
// 30-minute blocks a booking should span.
const DURATION_MINUTES = {
  "30 minutes": 30,
  "60 minutes": 60,
  "90 minutes": 90,
};

// Booking window: 9:00 AM to 6:00 PM
const GRID_START_MINUTES = 9 * 60;   // 9:00 AM
const GRID_END_MINUTES = 18 * 60;    // 6:00 PM

// "01:00 PM" -> 780 (minutes since midnight)
function parseTimeToMinutes(label) {
  const [time, modifier] = label.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (modifier === 'PM' && hours !== 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

// 780 -> "01:00 PM"
function formatMinutesToTime(totalMinutes) {
  const hours24 = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  const modifier = hours24 >= 12 ? 'PM' : 'AM';
  let displayHours = hours24 % 12;
  if (displayHours === 0) displayHours = 12;
  return `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${modifier}`;
}

// Builds every 30-minute mark from 9:00 AM through 6:00 PM inclusive
function generateTimeSlots(startMinutes, endMinutes) {
  const slots = [];
  for (let m = startMinutes; m <= endMinutes; m += 30) {
    slots.push(formatMinutesToTime(m));
  }
  return slots;
}

function InlineCalendarBooking({ candidateName, onClose, onBookSlot, onSendEmail }) {
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(6); // 0-indexed, 6 = July 
  const [selectedDate, setSelectedDate] = useState(14); // Matches context timeline layout
  const [selectedDuration, setSelectedDuration] = useState("60 minutes");
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [isBooked, setIsBooked] = useState(false);
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null); // null | 'sent' | 'skipped'

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Layout for July 2026
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
    return {
      startMinutes,
      endMinutes,
      endLabel: formatMinutesToTime(endMinutes),
      blockLabels,
    };
  }

  const selectSlot = (time) => {
    if (selectedSlot === time) {
      setSelectedSlot(null);
      return;
    }
    const { endMinutes } = getRangeForStart(time, selectedDuration);
    if (endMinutes > gridEndMinutes) {
      return;
    }
    setSelectedSlot(time);
  };

  useEffect(() => {
    if (!selectedSlot) return;
    const { endMinutes } = getRangeForStart(selectedSlot, selectedDuration);
    if (endMinutes > gridEndMinutes) {
      setSelectedSlot(null);
    }
  }, [selectedDuration]);

  const goToPrevMonth = () => {
    setCurrentMonth((prev) => {
      if (prev === 0) {
        setCurrentYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => {
      if (prev === 11) {
        setCurrentYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  const activeRange = selectedSlot ? getRangeForStart(selectedSlot, selectedDuration) : null;

  const bookingDetails = {
    date: `${monthNames[currentMonth]} ${selectedDate}, ${currentYear}`,
    duration: selectedDuration,
    startTime: selectedSlot,
    endTime: activeRange?.endLabel ?? null,
  };

  const handleBookSlot = () => {
    if (!selectedSlot) return;
    onBookSlot?.(bookingDetails);
    setIsBooked(false); 
    setEmailStatus(null);
    setShowEmailPrompt(true);
  };

  const handleConfirmSendEmail = () => {
    const startDateInstance = new Date(currentYear, currentMonth, selectedDate);
    const endDateInstance = new Date(currentYear, currentMonth, selectedDate);

    const startMinutes = parseTimeToMinutes(selectedSlot);
    const endMinutes = activeRange ? activeRange.endMinutes : startMinutes + 30;

    startDateInstance.setMinutes(startDateInstance.getMinutes() + startMinutes);
    endDateInstance.setMinutes(endDateInstance.getMinutes() + endMinutes);

    const completeBookingDetails = {
      ...bookingDetails,
      startIsoString: startDateInstance.toISOString(),
      endIsoString: endDateInstance.toISOString()
    };

    onSendEmail?.(completeBookingDetails);
    setEmailStatus('sent');
    setIsBooked(true);
  };

  const handleSkipSendEmail = () => {
    setEmailStatus('skipped');
    if (onClose) {
      onClose();
    }
  };

  const closeEmailPrompt = () => {
    setShowEmailPrompt(false);
    setEmailStatus(null);
    if (onClose) {
      onClose();
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
    
    if (targetDate.setHours(0,0,0,0) < new Date().setHours(0,0,0,0)) {
      return true;
    }
    if (targetDate.setHours(0,0,0,0) > new Date().setHours(0,0,0,0)) {
      return false;
    }

    const currentMinutesSinceMidnight = today.getHours() * 60 + today.getMinutes();
    const slotMinutes = parseTimeToMinutes(timeLabel);
    return slotMinutes < currentMinutesSinceMidnight;
  };

  return (
    <div className="max-w-4xl mx-auto my-8 p-6 bg-white border border-gray-100 rounded-2xl shadow-xl font-sans text-gray-800 relative">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          title="Close"
        >
          <X size={20} />
        </button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Side: Calendar */}
        <div className="md:col-span-5 border-r border-gray-100 pr-0 md:pr-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {monthNames[currentMonth]}, {currentYear}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={goToPrevMonth}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={goToNextMonth}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {daysOfWeek.map((day) => (
              <span key={day} className="text-sm font-semibold text-gray-400 py-1">
                {day}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {prefixDays.map((day, idx) => (
              <span key={`prev-${idx}`} className="text-sm text-gray-300 py-2.5">
                {day}
              </span>
            ))}

            {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => {
              const isSelected = day === selectedDate;
              const isPast = isPastDate(day);

              return (
                <button
                  key={`day-${day}`}
                  onClick={() => !isPast && setSelectedDate(day)}
                  disabled={isPast}
                  className={`text-sm font-medium py-2.5 rounded-full transition-all relative flex items-center justify-center m-auto h-9 w-9
                    ${isPast 
                      ? 'text-gray-300 cursor-not-allowed bg-transparent' 
                      : isSelected
                        ? 'bg-purple-700 text-white font-bold shadow-md shadow-purple-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  {day}
                </button>
              );
            })}

            {suffixDays.map((day, idx) => (
              <span key={`next-${idx}`} className="text-sm text-gray-300 py-2.5">
                {day}
              </span>
            ))}
          </div>
        </div>

        {/* Right Side: Slots configuration */}
        <div className="md:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Slots for {monthNames[currentMonth]} {selectedDate}, {currentYear}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">9:00 AM - 6:00 PM</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full">
                {selectedSlot ? `${selectedSlot} - ${activeRange.endLabel}` : '0 Selected'}
              </span>
            </div>

            {isBooked && (
              <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 text-purple-700 text-xs font-medium px-3 py-2 rounded-lg mb-4">
                <CheckCircle2 size={16} />
                Slot booked for {monthNames[currentMonth]} {selectedDate}, {currentYear}
              </div>
            )}

            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Select Duration
              </label>
              <div className="relative w-48">
                <select
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 appearance-none focus:outline-none focus:border-purple-700 cursor-pointer"
                >
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
                    title={isPastTime ? "This time has already passed" : !isInRange && wouldOverflow ? `Not enough room for a ${selectedDuration} booking starting here` : undefined}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all text-center
                      ${isInRange && !isPastTime
                        ? isStart
                          ? 'bg-purple-700 border-purple-700 text-white font-semibold'
                          : 'bg-purple-50 border-purple-700 text-purple-700 font-semibold'
                        : (wouldOverflow || isPastTime)
                          ? 'bg-white border-gray-100 text-gray-300 cursor-not-allowed'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
                      }`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-end">
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setSelectedSlot(null);
                  setIsBooked(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={handleBookSlot}
                disabled={!selectedSlot}
                className={`px-4 py-2 text-xs font-semibold rounded-lg shadow-sm transition-colors ${
                  !selectedSlot
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-purple-700 text-white hover:bg-purple-800'
                }`}
              >
                Book Slot
              </button>
            </div>
          </div>
        </div>
      </div>

      {showEmailPrompt && (
        <div className="absolute inset-0 bg-black/30 rounded-2xl flex items-center justify-center z-10">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-sm mx-4 p-6">
            {emailStatus === null && (
              <>
                <div className="flex items-center gap-2 mb-2 text-purple-700">
                  <Mail size={20} />
                  <h4 className="text-base font-bold text-gray-900">Send confirmation email?</h4>
                </div>
                <div className="text-sm text-gray-500 mb-5">
                  The {selectedDuration} slot for {monthNames[currentMonth]} {selectedDate}, {currentYear} from{' '}
                  {selectedSlot} to {activeRange?.endLabel} has been booked. Would you like to email {candidateName} a
                  confirmation now?
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={handleSkipSendEmail}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg transition-colors"
                  >
                    No thanks
                  </button>
                  <button
                    onClick={handleConfirmSendEmail}
                    className="px-4 py-2 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-sm transition-colors"
                  >
                    Send Email
                  </button>
                </div>
              </>
            )}

            {emailStatus === 'sent' && (
              <>
                <div className="flex items-center gap-2 mb-2 text-purple-700">
                  <CheckCircle2 size={20} />
                  <h4 className="text-base font-bold text-gray-900">Email sent</h4>
                </div>
                <div className="text-sm text-gray-500 mb-5">
                  A confirmation email for the booked slot has been sent to {candidateName}.
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={closeEmailPrompt}
                    className="px-4 py-2 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-sm transition-colors"
                  >
                    Done
                  </button>
                </div>
              </>
            )}

            {emailStatus === 'skipped' && (
              <>
                <h4 className="text-base font-bold text-gray-900 mb-2">No email sent</h4>
                <div className="text-sm text-gray-500 mb-5">
                  The slot is booked. You can always send a confirmation email later.
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={closeEmailPrompt}
                    className="px-4 py-2 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-sm transition-colors"
                  >
                    Done
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SavedCandidates() {
  const [candidates, setCandidates] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [credentials, setCredentials] = useState({});
  const [openCredentialMenuId, setOpenCredentialMenuId] = useState(null);

  const [searchVar, setSearchVar] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [activeFilters, setActiveFilters] = useState([]);
  const [filterValues, setFilterValues] = useState({});
  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const skillsRef = useRef(null);
  const locationRef = useRef(null);

  const [bookingCandidate, setBookingCandidate] = useState(null);

  // Inline editing status states
  const [editingCndId, setEditingCndId] = useState(null);
  const [editStatusForm, setEditStatusForm] = useState({
    teststatus: "NA",
    interviewstatus: "NA"
  });

  const filterOptions = ['Experience', 'Skills', 'Location', 'Role', 'Status'].sort();

  const dropdownOptions = {
    Experience: ['0-1 years', '1-3 years', '3-5 years', '5+ years'],
    Skills: [
      'React', 'Node.js', 'Python', 'TypeScript', 'PyTorch',
      'Apache Spark', 'Figma', 'C++', 'RTOS', 'Selenium',
      'AWS', 'Terraform', 'PostgreSQL', 'GraphQL', 'Modbus',
      'Docker', 'Kubernetes', 'Go', 'Swin Transformer', 'Java',
      'CAN bus', 'I2C', 'Tailwind CSS', 'Next.js', 'Kafka'
    ],
    Location: [
      'Remote', 'Bangalore', 'Mumbai', 'Hyderabad', 'Chennai',
      'Pune', 'Kochi', 'Coimbatore', 'Ahmedabad', 'Kolkata',
      'London', 'Berlin', 'Singapore', 'Tokyo', 'Amsterdam', 'Toronto'
    ],
    Role: [
      'Machine Learning Engineer', 'Data Engineer', 'Cloud Architect',
      'Embedded Systems Developer', 'Fullstack Engineer', 'UI/UX Designer',
      'QA Automation Engineer', 'DevOps Engineer', 'Backend Developer',
      'Frontend Developer', 'IoT Systems Engineer'
    ],
    Status: ['NA', 'Pending', 'Scheduled', 'Completed', 'Passed', 'Failed']
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (skillsRef.current && !skillsRef.current.contains(event.target)) {
        setShowSkillsDropdown(false);
      }
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setShowLocationDropdown(false);
      }

      const menuContainers = document.querySelectorAll('.menu-container');
      let clickedInsideMenu = false;
      menuContainers.forEach(container => {
        if (container.contains(event.target)) clickedInsideMenu = true;
      });
      if (!clickedInsideMenu) setOpenMenuId(null);

      const credentialContainers = document.querySelectorAll('.credential-container');
      let clickedInsideCreds = false;
      credentialContainers.forEach(container => {
        if (container.contains(event.target)) clickedInsideCreds = true;
      });
      if (!clickedInsideCreds) setOpenCredentialMenuId(null);
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const normalizeFilterValue = (key, value) => {
    if (Array.isArray(value)) {
      return value
        .map((item) => normalizeFilterValue(key, item))
        .filter((item) => item !== null && item !== undefined && item !== '');
    }
    if (typeof value !== 'string') return value;
    const normalizedKey = key.toLowerCase();

    if (normalizedKey.includes('experience') || normalizedKey.includes('exp') || normalizedKey.includes('year')) {
      const matches = value.match(/\d+/g);
      if (matches && matches.length >= 2) {
        return `${matches[0]}-${matches[matches.length - 1]}`;
      }
      if (matches && matches.length === 1) {
        if (value.includes('+')) return `${matches[0]}-50`;
        return matches[0];
      }
      return '';
    }
    return value;
  };

  const getListData = async () => {
    try {
      const params = new URLSearchParams();
      if (searchVar) params.append('search', searchVar);

      Object.keys(filterValues).forEach((key) => {
        const val = filterValues[key];
        const normalizedValue = normalizeFilterValue(key.toLowerCase(), val);
        if (Array.isArray(normalizedValue)) {
          if (normalizedValue.length > 0) {
            params.append(key.toLowerCase(), normalizedValue.join(','));
          }
        } else if (normalizedValue !== null && normalizedValue !== undefined && normalizedValue !== '') {
          params.append(key.toLowerCase(), String(normalizedValue));
        }
      });

      const queryString = params.toString();
      const url = queryString
        ? `http://localhost:5000/hireRadar/cndpermsavesearch?${queryString}`
        : `http://localhost:5000/hireRadar/cndpermsave`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`Request failed with status ${response.status}`);

      const jsonData = await response.json();
      setCandidates(Array.isArray(jsonData) ? jsonData : []);
    } catch (err) {
      console.error("Error fetching filtered saved candidates:", err.message || err);
      setCandidates([]);
    }
  };

  useEffect(() => {
    getListData();
  }, [searchVar, filterValues]);

  function handleDropdownChange(filter, value) {
    setFilterValues((prev) => {
      const updated = { ...prev, [filter]: value };
      if (!value) delete updated[filter];
      return updated;
    });

    setActiveFilters((prev) => {
      if (value && !prev.includes(filter)) {
        return [...prev, filter].sort();
      } else if (!value && prev.includes(filter)) {
        return prev.filter((f) => f !== filter);
      }
      return prev;
    });
  }

  function handleSkillToggle(skill) {
    setFilterValues((prev) => {
      const currentSkills = prev['Skills'] || [];
      const updatedSkills = currentSkills.includes(skill)
        ? currentSkills.filter((s) => s !== skill)
        : [...currentSkills, skill];

      const updated = { ...prev };
      if (updatedSkills.length === 0) {
        delete updated['Skills'];
      } else {
        updated['Skills'] = updatedSkills;
      }

      setActiveFilters((prevFilters) => {
        const hasSkills = updatedSkills.length > 0;
        if (hasSkills && !prevFilters.includes('Skills')) {
          return [...prevFilters, 'Skills'].sort();
        } else if (!hasSkills && prevFilters.includes('Skills')) {
          return prevFilters.filter((f) => f !== 'Skills');
        }
        return prevFilters;
      });

      return updated;
    });
  }

  function handleLocationToggle(location) {
    setFilterValues((prev) => {
      const currentLocations = prev['Location'] || [];
      const updatedLocations = currentLocations.includes(location)
        ? currentLocations.filter((l) => l !== location)
        : [...currentLocations, location];

      const updated = { ...prev };
      if (updatedLocations.length === 0) {
        delete updated['Location'];
      } else {
        updated['Location'] = updatedLocations;
      }

      setActiveFilters((prevFilters) => {
        const hasLocations = updatedLocations.length > 0;
        if (hasLocations && !prevFilters.includes('Location')) {
          return [...prevFilters, 'Location'].sort();
        } else if (!hasLocations && prevFilters.includes('Location')) {
          return prevFilters.filter((f) => f !== 'Location');
        }
        return prevFilters;
      });

      return updated;
    });
  }

  async function deleteRecord(ID) {
    try {
      const response = await fetch(`http://localhost:5000/hireRadar/deleteCandidate/${String(ID)}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Delete request failed');
      }
      setCandidates(prev => prev.filter(c => String(c.cndid) !== String(ID)));
      setOpenMenuId(null);
    } catch (err) {
      console.error('deleteRecord error:', err.message || err);
    }
  }

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const nav = useNavigate();

  function navigateSavedCandidateProfile(id) {
    nav('/candidateProfile', { state: { tempCndId: null, permCndId: id } });
  }

  function openCalendar(candidate) {
    setBookingCandidate(candidate);
    setOpenMenuId(null);
  }

  function closeCalendar() {
    setBookingCandidate(null);
  }

  // Handle Edit Action Click - Pre-fills with existing candidate status
  const handleEditClick = (candidate) => {
    setEditingCndId(candidate.cndid);
    setEditStatusForm({
      teststatus: candidate.teststatus || "NA",
      interviewstatus: candidate.interviewstatus || "NA"
    });
    setOpenMenuId(null);
  };

  // Save Candidate Statuses
  const saveCandidateStatus = async (cndid) => {
    try {
      const response = await fetch(`http://localhost:5000/hireRadar/updateCandidateStatus/${cndid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teststatus: editStatusForm.teststatus,
          interviewstatus: editStatusForm.interviewstatus
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to update status");
      }

      setEditingCndId(null);
      await getListData();
    } catch (err) {
      console.error("Error saving candidate status:", err.message || err);
    }
  };

  async function handleSendEmailAction(bookingDetails) {
    const candidateId = bookingCandidate?.cndid;
    if (!candidateId) return;

    let creds = credentials[candidateId];

    if (!creds) {
      const generatedUsername = nanoid(5);
      const generatedPassword = nanoid(10);

      try {
        const response = await fetch("http://localhost:5000/hireRadar/insertTestDetails", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cndid: candidateId,
            username: generatedUsername,
            password: generatedPassword,
            starttime: bookingDetails.startIsoString,
            endtime: bookingDetails.endIsoString,
            email: bookingCandidate?.cndemail,
            name: bookingCandidate?.cndname
          })
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || "Credential generation failed");
        }

        const responseText = await response.text();
        let parsedResponse = null;

        if (responseText) {
          try {
            parsedResponse = JSON.parse(responseText);
          } catch (parseError) {
            console.warn("insertTestDetails returned non-JSON response:", responseText);
          }
        }

        creds = {
          username: parsedResponse?.username || generatedUsername,
          password: parsedResponse?.password || generatedPassword
        };

        setCredentials(prev => ({
          ...prev,
          [candidateId]: creds
        }));
      } catch (err) {
        console.error("Error generating credentials during email dispatch context:", err.message || err);
        creds = { username: generatedUsername, password: generatedPassword };
      }
    }

    const emailPayload = {
      candidateName: bookingCandidate?.cndname || "Unknown Candidate",
      startTime: bookingDetails.startIsoString,
      endTime: bookingDetails.endIsoString,
      username: creds.username,
      password: creds.password,
      email: bookingCandidate?.cndemail || "nomailfound@gmail.com"
    };

    try {
      const emailResponse = await fetch("http://localhost:5000/hireRadar/sendemail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailPayload)
      });

      if (!emailResponse.ok) {
        const text = await emailResponse.text();
        throw new Error(text || "Email sending failed");
      }
    } catch (err) {
      console.error("Error sending confirmation email:", err.message || err);
    }
  }

  // Helper for rendering status badges
  const renderStatusBadge = (status) => {
    const s = status || 'NA';
    let bgClasses = 'bg-gray-100 text-gray-700 border-gray-200';

    if (['pass', 'passed', 'completed', 'offered'].includes(s.toLowerCase())) {
      bgClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    } else if (['scheduled', 'interviewing', 'pending', 'applied'].includes(s.toLowerCase())) {
      bgClasses = 'bg-amber-50 text-amber-700 border-amber-200';
    } else if (['fail', 'failed', 'rejected'].includes(s.toLowerCase())) {
      bgClasses = 'bg-rose-50 text-rose-700 border-rose-200';
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${bgClasses}`}>
        {s}
      </span>
    );
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Navbar />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col bg-slate-50 overflow-hidden">
          <div className="shrink-0 border-b border-slate-200 bg-slate-50 p-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">Uploaded Candidates</h1>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4">
                <input
                  type="text"
                  placeholder="Search saved candidates by name ..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
                  value={searchVar}
                  onChange={(e) => setSearchVar(e.target.value)}
                />
                <button
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition duration-200"
                  onClick={() => {
                    setSearchVar("");
                    setActiveFilters([]);
                    setFilterValues({});
                    setShowSkillsDropdown(false);
                    setShowLocationDropdown(false);
                  }}
                >
                  Reset
                </button>

                <button
                  className={`border-2 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition duration-200 bg-white ${
                    showFilters || activeFilters.length > 0
                      ? 'border-purple-600 text-purple-700'
                      : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                  }`}
                  onClick={() => setShowFilters((prev) => !prev)}
                >
                  <Funnel size={20} />
                  <span>Filters</span>
                  {activeFilters.length > 0 && (
                    <span className="ml-1 text-purple-600 font-bold">
                      {activeFilters.length}
                    </span>
                  )}
                </button>
              </div>

              {showFilters && (
                <div className="flex flex-wrap gap-2 items-center pt-2 border-t border-gray-100">
                  {filterOptions.map((filter) => {
                    const isActive = activeFilters.includes(filter);

                    if (filter === 'Skills') {
                      const selectedSkills = filterValues['Skills'] || [];
                      const displayLabel = selectedSkills.length > 0 ? `Skills (${selectedSkills.length})` : 'Skills';
                      return (
                        <div key={filter} className="relative inline-block" ref={skillsRef}>
                          <button
                            type="button"
                            onClick={() => setShowSkillsDropdown((prev) => !prev)}
                            className={`pl-4 pr-10 py-2 rounded-lg transition duration-200 border-2 bg-white text-sm font-medium flex items-center gap-2 cursor-pointer ${
                              isActive ? 'border-purple-600 text-purple-700' : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {displayLabel}
                            <div className={`absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none ${isActive ? 'text-purple-600' : 'text-gray-400'}`}>
                              <ChevronDown size={16} strokeWidth={2.5} />
                            </div>
                          </button>
                          {showSkillsDropdown && (
                            <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-2 flex flex-col gap-1 max-h-60 overflow-y-auto">
                              {dropdownOptions.Skills.map((skill) => (
                                <label key={skill} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-purple-50 cursor-pointer text-sm text-gray-700 font-normal transition duration-150">
                                  <input
                                    type="checkbox"
                                    checked={selectedSkills.includes(skill)}
                                    onChange={() => handleSkillToggle(skill)}
                                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 h-4 w-4"
                                  />
                                  {skill}
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }

                    if (filter === 'Location') {
                      const selectedLocations = filterValues['Location'] || [];
                      const displayLabel = selectedLocations.length > 0 ? `Location (${selectedLocations.length})` : 'Location';
                      return (
                        <div key={filter} className="relative inline-block" ref={locationRef}>
                          <button
                            type="button"
                            onClick={() => setShowLocationDropdown((prev) => !prev)}
                            className={`pl-4 pr-10 py-2 rounded-lg transition duration-200 border-2 bg-white text-sm font-medium flex items-center gap-2 cursor-pointer ${
                              isActive ? 'border-purple-600 text-purple-700' : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {displayLabel}
                            <div className={`absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none ${isActive ? 'text-purple-600' : 'text-gray-400'}`}>
                              <ChevronDown size={16} strokeWidth={2.5} />
                            </div>
                          </button>
                          {showLocationDropdown && (
                            <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-2 flex flex-col gap-1 max-h-60 overflow-y-auto">
                              {dropdownOptions.Location.map((loc) => (
                                <label key={loc} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-purple-50 cursor-pointer text-sm text-gray-700 font-normal transition duration-150">
                                  <input
                                    type="checkbox"
                                    checked={selectedLocations.includes(loc)}
                                    onChange={() => handleLocationToggle(loc)}
                                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 h-4 w-4"
                                  />
                                  {loc}
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div key={filter} className="relative inline-block">
                        <select
                          value={filterValues[filter] ?? ''}
                          onChange={(e) => handleDropdownChange(filter, e.target.value)}
                          className={`appearance-none pl-4 pr-10 py-2 rounded-lg transition duration-200 border-2 bg-white text-sm font-medium cursor-pointer focus:outline-none tracking-wide ${
                            isActive ? 'border-purple-600 text-purple-700' : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <option value="">{filter}</option>
                          {dropdownOptions[filter]?.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                        <div className={`absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none ${isActive ? 'text-purple-600' : 'text-gray-400'}`}>
                          <ChevronDown size={16} strokeWidth={2.5} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="m-6 min-h-0 max-h-[65vh] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col self-start w-[calc(100%-3rem)]">
            <div className="overflow-x-auto overflow-y-auto flex-1">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Candidate</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Experience</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Match Score</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Saved On</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Test Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Interview Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {candidates.map((candidate) => {
                    const isEditing = editingCndId === candidate.cndid;

                    return (
                      <tr key={candidate.cndid} className="hover:bg-gray-50 transition duration-150">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={candidate.cndphoto} alt={candidate.cndname} className="h-12 w-12 rounded-full object-cover" />
                            <div>
                              <p className="font-semibold text-gray-900">{candidate.cndname}</p>
                              <p className="text-sm text-gray-600">{candidate.cndlocation}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-700">{candidate.cndrole}</td>
                        <td className="px-6 py-4 text-gray-700">{`${candidate.cndexperience} years`}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                            {candidate.matchScore || '80%'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700">{candidate.searchdate || candidate.searchDate || format(new Date(), 'dd/MM/yyyy')}</td>
                        
                        {/* Test Status Column */}
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <div className="relative inline-block w-32">
                              <select
                                value={editStatusForm.teststatus}
                                onChange={(e) => setEditStatusForm({ ...editStatusForm, teststatus: e.target.value })}
                                className="w-full appearance-none px-3 py-1.5 border border-purple-300 rounded-lg text-xs font-semibold bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer shadow-sm pr-7"
                              >
                                <option value="NA">NA</option>
                                <option value="Pass">Pass</option>
                                <option value="Fail">Fail</option>
                                <option value="Pending">Pending</option>
                                <option value="Scheduled">Scheduled</option>
                                <option value="Completed">Completed</option>
                              </select>
                              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                          ) : (
                            renderStatusBadge(candidate.teststatus)
                          )}
                        </td>

                        {/* Interview Status Column */}
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <div className="relative inline-block w-32">
                              <select
                                value={editStatusForm.interviewstatus}
                                onChange={(e) => setEditStatusForm({ ...editStatusForm, interviewstatus: e.target.value })}
                                className="w-full appearance-none px-3 py-1.5 border border-purple-300 rounded-lg text-xs font-semibold bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer shadow-sm pr-7"
                              >
                                <option value="NA">NA</option>
                                <option value="Pass">Pass</option>
                                <option value="Fail">Fail</option>
                                <option value="Pending">Pending</option>
                                <option value="Scheduled">Scheduled</option>
                                <option value="Completed">Completed</option>
                              </select>
                              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                          ) : (
                            renderStatusBadge(candidate.interviewstatus)
                          )}
                        </td>

                        {/* Actions Column */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {isEditing ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => saveCandidateStatus(candidate.cndid)}
                                  className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition duration-150"
                                  title="Save Status"
                                >
                                  <Check size={18} />
                                </button>
                                <button
                                  onClick={() => setEditingCndId(null)}
                                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition duration-150"
                                  title="Cancel Edit"
                                >
                                  <X size={18} />
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() => navigateSavedCandidateProfile(candidate.cndid)}
                                  className="text-purple-600 hover:text-purple-800 transition duration-200"
                                  title="View profile"
                                >
                                  <Eye size={20} />
                                </button>
                                <div className="menu-container relative inline-block">
                                  <button
                                    className="text-gray-400 hover:text-gray-600 transition duration-200"
                                    title="More options"
                                    onClick={() => toggleMenu(candidate.cndid)}
                                  >
                                    <MoreVertical size={20} />
                                  </button>
                                  <div className={`absolute right-full top-1/2 -translate-y-1/2 -mr-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50 transition-opacity duration-200 ${openMenuId === candidate.cndid ? 'block opacity-100' : 'hidden opacity-0'}`}>
                                    <a onClick={() => handleEditClick(candidate)} className="block px-3 py-2 text-gray-700 text-sm rounded hover:bg-gray-100 cursor-pointer transition duration-150">Edit</a>
                                    <a onClick={() => deleteRecord(candidate.cndid)} className="block px-3 py-2 text-gray-700 text-sm rounded hover:bg-gray-100 cursor-pointer transition duration-150">Delete</a>
                                    <a onClick={() => openCalendar(candidate)} className="block px-3 py-2 text-gray-700 text-sm rounded hover:bg-gray-100 cursor-pointer transition duration-150">Book slot</a>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 shrink-0">
              <p className="text-sm text-gray-700">Showing 1 to {candidates.length} of {candidates.length} results</p>
            </div>
          </div>
        </div>
      </div>

      {bookingCandidate !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
          <InlineCalendarBooking 
            candidateName={bookingCandidate.cndname}
            onClose={closeCalendar} 
            onSendEmail={handleSendEmailAction}
          />
        </div>
      )}
    </div>
  );
}

export default SavedCandidates;