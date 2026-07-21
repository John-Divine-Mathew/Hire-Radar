import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from '../components/sideBar/sideBar.jsx';
import Navbar from "../components/navBar/navBar.jsx";

const InterviewScheduler = () => {
  const [candidates, setCandidates] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");

  // Form State
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [interviewer, setInterviewer] = useState("");
  const [interviewType, setInterviewType] = useState("Technical Round 1");
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [notes, setNotes] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const candRes = await axios.get("http://localhost:5000/hireRadar/candidates");
      setCandidates(candRes.data || []);

      const intRes = await axios.get("http://localhost:5000/hireRadar/interviews");
      setInterviews(intRes.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSchedule = async (e) => {
    e.preventDefault();

    if (!selectedCandidate || !interviewDate || !interviewTime || !interviewer) {
      alert("Please fill in all required fields.");
      return;
    }

    const candidateObj = candidates.find(
      (c) => c.candidate_id?.toString() === selectedCandidate || c.email === selectedCandidate
    );

    const newInterview = {
      interview_id: Date.now(),
      candidate_name: candidateObj ? candidateObj.name || candidateObj.candidate_name : selectedCandidate,
      candidate_email: candidateObj ? candidateObj.email : "",
      interviewer_name: interviewer,
      interview_type: interviewType,
      date: interviewDate,
      time: interviewTime,
      meeting_link: meetingLink,
      notes: notes,
      status: "Scheduled",
    };

    try {
      await axios.post("http://localhost:5000/hireRadar/scheduleInterview", newInterview);
      alert("Interview Scheduled Successfully!");
    } catch (err) {
      console.warn("Backend API unavailable, saving locally:", err);
      setInterviews((prev) => [newInterview, ...prev]);
    }

    setSelectedCandidate("");
    setInterviewer("");
    setInterviewType("Technical Round 1");
    setInterviewDate("");
    setInterviewTime("");
    setMeetingLink("");
    setNotes("");
  };

  const filteredInterviews = interviews.filter((item) => {
    if (filterStatus === "All") return true;
    return item.status === filterStatus;
  });

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#FAF8FF]">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Container */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <Sidebar />

        {/* Scrollable Content Workspace */}
        <div className="flex min-w-0 flex-1 flex-col overflow-y-auto p-8">
          
          {/* Top Info Banner Card */}
         
            <h1 className="text-3xl font-bold text-black mb-3">
              Interview Scheduler
            </h1>

          {/* Section Header */}
          <div className="text-center my-6">
            <h2 className="text-3xl font-bold text-[#7C24D3]">
              Schedule & Manage Interviews
            </h2>
          </div>

          {/* Grid Layout Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
            
            {/* Left Card: Scheduling Form */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100/50">
                <h3 className="text-xl font-bold text-[#7C24D3] mb-2">
                  Create Interview Round
                </h3>
                <p className="text-gray-600 text-sm mb-6">
                  Fill in candidate and panel information to notify all parties.
                </p>

                <form onSubmit={handleSchedule} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Candidate Profile *
                    </label>
                    <select
                      value={selectedCandidate}
                      onChange={(e) => setSelectedCandidate(e.target.value)}
                      required
                      className="w-full p-3.5 rounded-2xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#7C24D3] outline-none transition"
                    >
                      <option value="">Select Candidate</option>
                      {candidates.map((c, idx) => (
                        <option key={c.candidate_id || idx} value={c.candidate_id || c.email || c.name}>
                          {c.name || c.candidate_name} ({c.email || c.job_title || "Applicant"})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Interviewer / Panel Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Alex Morgan"
                      value={interviewer}
                      onChange={(e) => setInterviewer(e.target.value)}
                      required
                      className="w-full p-3.5 rounded-2xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#7C24D3] outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Round Type
                    </label>
                    <select
                      value={interviewType}
                      onChange={(e) => setInterviewType(e.target.value)}
                      className="w-full p-3.5 rounded-2xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#7C24D3] outline-none transition"
                    >
                      <option value="HR Screening">HR Screening</option>
                      <option value="Technical Round 1">Technical Round 1</option>
                      <option value="Technical Round 2">Technical Round 2</option>
                      <option value="System Design">System Design</option>
                      <option value="Managerial Round">Managerial Round</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Date *
                      </label>
                      <input
                        type="date"
                        value={interviewDate}
                        onChange={(e) => setInterviewDate(e.target.value)}
                        required
                        className="w-full p-3.5 rounded-2xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#7C24D3] outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Time *
                      </label>
                      <input
                        type="time"
                        value={interviewTime}
                        onChange={(e) => setInterviewTime(e.target.value)}
                        required
                        className="w-full p-3.5 rounded-2xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#7C24D3] outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Meeting Link
                    </label>
                    <input
                      type="url"
                      placeholder="https://meet.google.com/..."
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                      className="w-full p-3.5 rounded-2xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#7C24D3] outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      rows="2"
                      placeholder="Add evaluation criteria..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full p-3.5 rounded-2xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#7C24D3] outline-none transition resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 bg-[#7C24D3] hover:bg-[#681cb7] text-white py-3.5 rounded-2xl font-bold text-base shadow-sm transition duration-200"
                  >
                    Schedule Interview
                  </button>
                </form>
              </div>
            </div>

            {/* Right Card: Scheduled Table */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100/50 h-full flex flex-col">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-[#7C24D3]">
                      Scheduled Sessions
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Track active candidate interviews across rounds.
                    </p>
                  </div>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="p-2.5 px-4 rounded-xl border border-gray-200 text-sm bg-gray-50 text-gray-700 outline-none focus:ring-2 focus:ring-[#7C24D3] transition"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="py-3 px-4 text-sm font-bold text-[#7C24D3]">
                          Candidate
                        </th>
                        <th className="py-3 px-4 text-sm font-bold text-[#7C24D3]">
                          Round & Panel
                        </th>
                        <th className="py-3 px-4 text-sm font-bold text-[#7C24D3]">
                          Date & Time
                        </th>
                        <th className="py-3 px-4 text-sm font-bold text-[#7C24D3]">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {loading ? (
                        <tr>
                          <td colSpan={4} className="text-center py-10 text-gray-500">
                            Loading schedule...
                          </td>
                        </tr>
                      ) : filteredInterviews.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-10 text-gray-500">
                            No scheduled interviews found.
                          </td>
                        </tr>
                      ) : (
                        filteredInterviews.map((item, index) => (
                          <tr key={item.interview_id || index} className="hover:bg-purple-50/20 transition">
                            <td className="py-4 px-4">
                              <div className="font-semibold text-gray-900">
                                {item.candidate_name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {item.candidate_email}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="text-sm font-medium text-gray-800">
                                {item.interview_type}
                              </div>
                              <div className="text-xs text-gray-500">
                                {item.interviewer_name}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="text-sm font-medium text-gray-800">
                                {item.date}
                              </div>
                              <div className="text-xs text-gray-500">
                                {item.time}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-[#7C24D3]">
                                {item.status || "Scheduled"}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default InterviewScheduler;