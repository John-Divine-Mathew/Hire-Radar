import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function AssessmentForm() {
  const navigate = useNavigate();
  const location = useLocation();
  // Using optional chaining syntax to avoid crashing if state is null
  const { cndid, result, email, role, teststart, testend, testdate } = location.state || {};

  const [candidate, setCandidate] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const [message, setMessage] = useState({ text: "", type: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWindowOpen, setIsWindowOpen] = useState(false); // Track if test is active
  const [isEarly, setIsEarly] = useState(false); // Track if user is early
  const [isLate, setIsLate] = useState(false); // Track if user is late

// Setup the time checker
  useEffect(() => {
    // STRICT MODE: If the dates are missing from state, strictly block entry.
    if (!teststart || !testend) {
      setIsWindowOpen(false); 
      return;
    }

    // Convert "YYYY-MM-DD HH:mm:ss" to "YYYY-MM-DDTHH:mm:ss" for accurate JS Date parsing
    const testStartObj = new Date(teststart.replace(" ", "T"));
    const testEndObj = new Date(testend.replace(" ", "T"));

    const checkTime = () => {
      const now = new Date();
      
      // Let the Date objects handle both Date and Time validation simultaneously
      const isTimeValid = now >= testStartObj && now <= testEndObj;

      setIsWindowOpen(isTimeValid);
      
      // Check if the current time is before the scheduled start time
      setIsEarly(now < testStartObj); 
      // Check if the current time is after the scheduled end time
      setIsLate(now > testEndObj); 
    };

    checkTime(); // Check immediately
    const intervalId = setInterval(checkTime, 1000); // Re-evaluate every second

    return () => clearInterval(intervalId);
  }, [teststart, testend]);

  // Helper to trigger timed status notifications
  const showNotification = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => {
      setMessage({ text: "", type: "" });
    }, 4000);
  };


  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    try {
      const body = {
        cndid: cndid,
        name: candidate.name,
        phone: candidate.phone
      };
      
      const response = await fetch("http://localhost:5000/hireRadar/updateTestDetails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      
      if (!response.ok) throw new Error("Server rejected the update");

      showNotification("Candidate information saved successfully.", "success");
      setIsSubmitting(false);
      return true;

    } catch (err) {
      console.error(err.message);
      showNotification("Unable to save details. Please check your connection.", "error");
      setIsSubmitting(false);
      return false;
    }
  };

  // Start Assessment
  const startAssessment = async (e) => {
    e.preventDefault();

    if (
      !candidate.name.trim() ||
      !candidate.phone.trim()
    ) {
      showNotification("Please fill out all fields before continuing.", "error");
      return;
    }

    // 1. CHECK TIME WINDOW FIRST
    if (!isWindowOpen) {
      showNotification("The test window is currently closed. You cannot start the assessment.", "error");
      return;
    }

    // 2. THEN CHECK RESULT
    if (result) {
      showNotification("This candidate has already taken the assessment.", "error");
      return;
    }

    // Save details first; move forward only if the API call succeeds
    const saveSuccess = await handleSubmit(); 
    if (!saveSuccess) return;
    
    navigate("/assessment-test", {
      state: { 
        cndid: cndid,
        role: role,
      }
    });
  };

  // Reset Form
  const handleReset = () => {
    setCandidate({
      name: "",
      email: "",
      phone: ""
    });
    showNotification("Form fields cleared.", "info");
  };



  let displayDate = "TBD";
  let displayStartTime = "";
  let displayEndTime = "";

  if (teststart && testend) {
    const startD = new Date(teststart);
    const endD = new Date(testend);
    
    // Formats to: "Aug 4, 2026"
    displayDate = startD.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    // Formats to: "12:00 PM"
    displayStartTime = startD.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    displayEndTime = endD.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans antialiased text-slate-800">
      <div className="w-full max-w-xl bg-white border border-slate-100 shadow-2xl rounded-2xl overflow-hidden transition-all duration-300">
        
        <div className="p-8 sm:p-10">
          {/* Header Section */}
          <div className="mb-8 text-center sm:text-left">
            <h1 className="text-4xl font-bold text-purple-800">
              Candidate Registration
            </h1>
          </div>

          {/* Dynamic Time Window Notification Banner */}
          {testdate && (
            <div className={`mb-4 flex items-start gap-3 border p-4 rounded-xl text-sm transition-colors duration-300 ${
              isWindowOpen 
                ? "bg-blue-50 border-blue-200 text-blue-800" 
                : "bg-red-50 border-red-200 text-red-800"
            }`}>
              {isWindowOpen ? (
                <svg className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <div>
                {isWindowOpen ? (
                  <>
                    <span className="font-semibold">Test Open:</span> You should take the test within given interval. Scheduled for: {displayDate} between {displayStartTime} and {displayEndTime}.
                  </>
                ) : (
                  <>
                    <span className="font-semibold">Test Closed:</span> The test window is not currently active. Scheduled for: {displayDate} between {displayStartTime} and {displayEndTime}.
                  </>
                )}
              </div>
            </div>
          )}

          {/* Contextual Banner if Too Early */}
          {isEarly && !isWindowOpen && !result && (
            <div className="mb-6 flex items-start gap-3 bg-sky-50 border border-sky-200 text-sky-800 p-4 rounded-xl text-sm">
              <svg className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <span className="font-semibold">Notice:</span> You have arrived early. Please wait and come back during your allotted time window.
              </div>
            </div>
          )}
          {/* Contextual Banner if Too Late */}
          {isLate && !isWindowOpen && !result && (
            <div className="mb-6 flex items-start gap-3 bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-xl text-sm">
              <svg className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <span className="font-semibold">Notice:</span> You have arrived after your allotted time window. The assessment is no longer available.
              </div>
            </div>
          )}

          {/* Contextual Banner if Already Evaluated */}
          {result && (
            <div className="mb-6 flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm">
              <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <span className="font-semibold">Notice:</span> Record indicates this candidate token has finished a session. Repetition is disabled.
              </div>
            </div>
          )}

          {/* Toast-style Notification System */}
          {message.text && (
            <div className={`mb-6 flex items-center gap-3 border px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 transform translate-y-0
              ${message.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : ""}
              ${message.type === "error" ? "bg-rose-50 border-rose-200 text-rose-800" : ""}
              ${message.type === "info" ? "bg-blue-50 border-purple-200 text-purple-800" : ""}
            `}>
              {message.type === "success" && (
                <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {message.type === "error" && (
                <svg className="w-5 h-5 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {message.type === "info" && (
                <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <div>{message.text}</div>
            </div>
          )}

          {/* Form Stacked Vertically */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                disabled={isSubmitting}
                placeholder="Enter Full Name"
                className="w-full border border-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50 hover:bg-slate-50 transition text-sm disabled:opacity-60"
                value={candidate.name}
                onChange={(e) => setCandidate({ ...candidate, name: e.target.value })}
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                className="w-full border border-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50 hover:bg-slate-50 transition text-sm disabled:opacity-60"
                value={email || ""}
                readOnly
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Phone Number
              </label>
              <input
                type="tel"
                disabled={isSubmitting}
                placeholder="+91 9626749641"
                className="w-full border border-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50 hover:bg-slate-50 transition text-sm disabled:opacity-60"
                value={candidate.phone}
                onChange={(e) => setCandidate({ ...candidate, phone: e.target.value })}
              />
            </div>

            {/* Structured Action Row */}
            <div className="pt-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
              
              {/* Secondary Buttons Panel */}
              <div className="flex w-full sm:w-auto items-center gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleReset}
                  className="w-full sm:w-auto px-5 py-2.5 border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 active:bg-slate-100 transition text-sm text-center disabled:opacity-50"
                >
                  Clear Fields
                </button>
              </div>

              {/* Core CTA: Start Assessment */}
              <button
                type="button"
                // Button is disabled if submitting, already taken, OR window is closed
                disabled={isSubmitting || result || !isWindowOpen}
                onClick={startAssessment}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 text-white font-semibold rounded-xl active:transform active:scale-[0.99] transition shadow-md text-sm
                  ${(!isSubmitting && !result && isWindowOpen) 
                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-indigo-200 cursor-pointer" 
                    : "bg-gray-400 cursor-not-allowed opacity-70"}`}
              >
                <span>Start Assessment</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </form>

          {/* Footer Encouragement */}
          <p className="mt-8 text-center text-xs font-semibold text-slate-400 tracking-wider uppercase">
             Best of luck for your Career !
          </p>
        </div>

      </div>
    </div>
  );
}

export default AssessmentForm;