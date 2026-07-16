import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function AssessmentForm() {
  const navigate = useNavigate();
  const location = useLocation();
  // Using optional chaining syntax to avoid crashing if state is null
  const { cndid, result, email } = location.state || {};

  const [candidate, setCandidate] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const [message, setMessage] = useState({ text: "", type: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to trigger timed status notifications
  const showNotification = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => {
      setMessage({ text: "", type: "" });
    }, 4000);
  };

  // Submit Details (Returns true on success, false on failure)
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

    if (result) {
      showNotification("This candidate has already taken the assessment.", "error");
      return;
    }

    // Save details first; move forward only if the API call succeeds
    const saveSuccess = await handleSubmit(); 
    if (!saveSuccess) return;
    
    navigate("/assessment-test", {
      state: { 
        cndid: cndid
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
                disabled={isSubmitting || !!result}
                onClick={startAssessment}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-violet-700 hover:to-indigo-700 active:transform active:scale-[0.99] transition shadow-md shadow-indigo-200 disabled:opacity-50 disabled:pointer-events-none text-sm"
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