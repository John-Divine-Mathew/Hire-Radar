import React, { useState } from "react";
import { useMsal } from "@azure/msal-react";
import { msalConfig } from "../authconfig.js"; // Ensure this matches your authConfig.js export
import Sidebar from "../components/sideBar/sideBar";
import Navbar from "../components/navBar/navBar";
import {
  Search,
  Edit3,
  Check,
  X,
  ListChecks,
  Settings2,
  Trash2,
  Plus,
  CheckCircle2,
<<<<<<< Updated upstream
  Clock,
  Briefcase,
=======
>>>>>>> Stashed changes
  Users,
  Video, // <-- Added for Teams Meeting
  LogIn, // <-- Added for MS Login
} from "lucide-react";

// Moved outside to prevent unnecessary re-renders
const GenderAvatar = ({ gender, completed }) => {
  const bgClass = completed ? "bg-green-600" : "bg-indigo-600";
  const bgHex = completed ? "#16A34A" : "#4F46E5";

  return (
    <div
      className={`w-14 h-14 shrink-0 rounded-full flex items-center justify-center shadow-md ring-2 ring-white ${bgClass}`}
    >
      {gender === "female" ? (
        <svg viewBox="0 0 100 100" className="w-9 h-9">
          <path
            d="M50,6 C64,6 74,17 74,30 C74,36 71,41 67,45 C74,52 78,62 78,74 L70,74 C70,63 67,54 61,48 C58,50 54,51 50,51 C46,51 42,50 39,48 C33,54 30,63 30,74 L22,74 C22,62 26,52 33,45 C29,41 26,36 26,30 C26,17 36,6 50,6 Z"
            fill="white"
          />
          <circle cx="50" cy="29" r="15" fill="white" />
          <path
            d="M28,96 C28,78 38,66 50,66 C62,66 72,78 72,96 Z"
            fill="white"
          />
          <path d="M50,66 L40,74 L46,92 Z" fill={bgHex} />
          <path d="M50,66 L60,74 L54,92 Z" fill={bgHex} />
        </svg>
      ) : (
        <svg viewBox="0 0 100 100" className="w-9 h-9">
          <path
            d="M20,96 C20,72 33,58 50,58 C67,58 80,72 80,96 Z"
            fill="white"
          />
          <circle cx="50" cy="30" r="17" fill="white" />
          <path d="M50,58 L38,68 L44,90 Z" fill={bgHex} />
          <path d="M50,58 L62,68 L56,90 Z" fill={bgHex} />
          <path d="M47,60 L53,60 L51,95 L49,95 Z" fill={bgHex} />
        </svg>
      )}
    </div>
  );
};

// Moved outside to prevent unnecessary re-renders
const Pill = ({ color, children }) => {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    amber: "bg-amber-50 text-amber-700",
    green: "bg-green-50 text-green-700",
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${colorMap[color]}`}
    >
      {children}
    </span>
  );
};

export default function FilterCandidate() {
  // ---------- Microsoft Authentication & Graph API Setup ----------
  const { instance, accounts } = useMsal();
  const isAuthenticated = accounts.length > 0;

  const handleLogin = () => {
    instance.loginPopup(loginRequest).catch((e) => console.error(e));
  };

  const scheduleTeamsMeeting = async (candidate) => {
    if (!isAuthenticated) {
      alert("Please connect your Microsoft account first!");
      return;
    }

    try {
      // 1. Silently acquire the token with Calendars.ReadWrite permission
      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
      });

      // 2. Schedule for tomorrow at 10:00 AM (for demonstration purposes)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      const endTime = new Date(tomorrow);
      endTime.setHours(11, 0, 0, 0);

      // 3. Define Graph API Payload
      const eventPayload = {
        subject: `Interview: ${candidate.name} - ${candidate.role}`,
        body: {
          contentType: "HTML",
          content: `Please join this Teams meeting for your ${candidate.status}.`,
        },
        start: {
          dateTime: tomorrow.toISOString(),
          timeZone: "UTC",
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: "UTC",
        },
        isOnlineMeeting: true,
        onlineMeetingProvider: "teamsForBusiness",
        isReminderOn: true,
        reminderMinutesBeforeStart: 15, // 15 minute reminder
      };

      // 4. Send the request
      const graphResponse = await fetch(
        "https://graph.microsoft.com/v1.0/me/events",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${response.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(eventPayload),
        }
      );

      if (graphResponse.ok) {
        const data = await graphResponse.json();
        alert(`Meeting created successfully!\n\nJoin URL: ${data.onlineMeeting.joinUrl}`);
      } else {
        const error = await graphResponse.json();
        console.error(error);
        alert("Failed to create Teams meeting. Check console for details.");
      }
    } catch (error) {
      console.error("Error scheduling meeting:", error);
      // Fallback if silent token acquisition fails
      if (error.name === "InteractionRequiredAuthError") {
        instance.acquireTokenPopup(loginRequest);
      }
    }
  };
  // -----------------------------------------------------------------

  const [search, setSearch] = useState("");

  // Freshly initialized with exactly the 6 requested rounds
  const defaultRounds = [
    { id: 1, label: "Written Test" },
    { id: 2, label: "Technical Test" },
    { id: 3, label: "Technical Interview" },
    { id: 4, label: "HR" },
    { id: 5, label: "HR Screening" },
    { id: 6, label: "Hiring Manager Screening" },
  ];

  const [candidates, setCandidates] = useState([
    {
      id: 1,
      name: "John David",
      role: "React Developer",
      gender: "male",
      status: "Technical Test",
      step: 2,
      rounds: defaultRounds,
    },
    {
      id: 2,
      name: "Arun Kumar",
      role: "UI/UX Designer",
      gender: "male",
      status: "Written Test",
      step: 1,
      rounds: defaultRounds,
    },
    {
      id: 3,
      name: "Priya Sharma",
      role: "Software Tester",
      gender: "female",
      status: "HR",
      step: 4,
      rounds: defaultRounds,
    },
    {
      id: 4,
      name: "Vignesh Kumar",
      role: "Java Full Stack Developer",
      gender: "male",
      status: "Hiring Manager Screening",
      step: 6,
      rounds: defaultRounds,
    },
    {
      id: 5,
      name: "Karthik Raj",
      role: "Python Developer",
      gender: "male",
      status: "Technical Interview",
      step: 3,
      rounds: defaultRounds,
    },
  ]);

  // Track which candidate's interview rounds panel is open
  const [openRoundsCandidateId, setOpenRoundsCandidateId] = useState(null);

  const toggleRoundsPanel = (candidateId) => {
    setOpenRoundsCandidateId((prev) => (prev === candidateId ? null : candidateId));
  };

  // Dynamic Timeline Generation based solely on Candidate Rounds (Only round names displayed)
  const buildDynamicStages = (candidateRounds) => {
    if (!candidateRounds || candidateRounds.length === 0) {
      return ["Written Test", "Technical Test", "Technical Interview", "HR", "HR Screening", "Hiring Manager Screening"];
    }
    return candidateRounds.map((r) => r.label || "Round");
  };

  // ---------- Stage editing ----------
  const [editingStageId, setEditingStageId] = useState(null);
  const [draftStep, setDraftStep] = useState(1);

  const startEditingStage = (candidate) => {
    setEditingStageId(candidate.id);
    setDraftStep(candidate.step);
  };

  const cancelEditingStage = () => setEditingStageId(null);

  const handleSaveStage = (candidate) => {
    const currentStages = buildDynamicStages(candidate.rounds);
    const validStep = Math.min(draftStep, currentStages.length);

    setCandidates((prev) =>
      prev.map((c) =>
        c.id === candidate.id
          ? { ...c, step: validStep, status: currentStages[validStep - 1] }
          : c
      )
    );
    setEditingStageId(null);
  };

  // ---------- Interview rounds editing ----------
  const [editingRoundsId, setEditingRoundsId] = useState(null);
  const [draftRounds, setDraftRounds] = useState([]);

  const startEditingRounds = (candidate) => {
    setEditingRoundsId(candidate.id);
    setDraftRounds(candidate.rounds.map((r) => ({ ...r })));
  };

  const handleAddRound = () => {
    setDraftRounds((prev) => [
      ...prev,
      { id: Date.now() + Math.floor(Math.random() * 1000), label: "" },
    ]);
  };

  const handleRoundLabelChange = (roundId, value) => {
    setDraftRounds((prev) =>
      prev.map((r) => (r.id === roundId ? { ...r, label: value } : r))
    );
  };

  const handleDeleteRound = (roundId) => {
    setDraftRounds((prev) => prev.filter((r) => r.id !== roundId));
  };

  const handleSaveRounds = (candidate) => {
    const newStages = buildDynamicStages(draftRounds);
    const adjustedStep = Math.min(candidate.step, newStages.length);

    setCandidates((prev) =>
      prev.map((c) =>
        c.id === candidate.id
          ? {
              ...c,
              rounds: draftRounds,
              step: adjustedStep,
              status: newStages[adjustedStep - 1],
            }
          : c
      )
    );
    setEditingRoundsId(null);
  };

  // ---------- Delete candidate ----------
  const handleDeleteCandidate = (candidateId) => {
    setCandidates((prev) => prev.filter((c) => c.id !== candidateId));
    if (editingStageId === candidateId) setEditingStageId(null);
    if (editingRoundsId === candidateId) setEditingRoundsId(null);
    if (openRoundsCandidateId === candidateId) setOpenRoundsCandidateId(null);
  };

  const filteredCandidates = candidates.filter((candidate) =>
    candidate.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Navbar span across the top */}
      <Navbar />

      <div className="flex flex-1 min-h-0">
        {/* Sidebar fixed to the left */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col bg-slate-50 overflow-y-auto w-full">
          <div className="p-6 w-full flex flex-col gap-6">
            
            {/* Header with MSAL Auth */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <h1 className="text-4xl font-bold text-gray-900">
                  Filter Candidates
                </h1>
                <div className="h-8 border-l-2 border-slate-300 hidden md:block"></div>
                <span className="text-slate-500 text-sm font-medium bg-slate-200/60 px-3 py-1 rounded-full hidden md:inline-block">
                  Smart Candidate Tracking
                </span>
              </div>

              {/* Login Status & Button */}
              {!isAuthenticated ? (
                <button
                  onClick={handleLogin}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-sm font-semibold transition shadow-sm"
                >
                  <LogIn size={18} />
                  Connect Microsoft
                </button>
              ) : (
                <div className="text-sm font-medium text-slate-700 bg-white border border-slate-200 shadow-sm px-4 py-2 rounded-xl flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  {accounts[0]?.name}
                </div>
              )}
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 w-full">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Search Candidate..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-base"
                  />
                </div>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 rounded-xl font-semibold transition duration-200 shadow-sm">
                  Search
                </button>
              </div>
            </div>

            {/* Candidate Count */}
            <div className="flex items-center justify-between mt-8 mb-4 px-1">
              <h2 className="text-xl font-bold text-slate-800">
                Candidate List
              </h2>
              <span className="text-xs font-semibold bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full">
                {filteredCandidates.length} total
              </span>
            </div>

            {/* Candidate Cards */}
            <div className="space-y-6">
              {filteredCandidates.map((candidate, index) => {
                const isEditingStage = editingStageId === candidate.id;
                const isEditingRounds = editingRoundsId === candidate.id;
                const isRoundsOpen = openRoundsCandidateId === candidate.id;

                const roundsForTimeline = isEditingRounds
                  ? draftRounds
                  : candidate.rounds;
                const dynamicStages = buildDynamicStages(roundsForTimeline);

                const displayStep = isEditingStage
                  ? Math.min(draftStep, dynamicStages.length)
                  : Math.min(candidate.step, dynamicStages.length);

                const isCompleted = displayStep >= dynamicStages.length;
                const currentStageLabel =
                  dynamicStages[displayStep - 1] || "In Progress";

                return (
                  <div
                    key={candidate.id}
                    className="relative bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition"
                  >
                    {/* Left accent bar */}
                    <div className="absolute left-0 top-0 h-full w-1.5 bg-purple-600" />

                    <div className="pl-7 pr-6 py-6">
                      {/* Top row: tag pills + action icons */}
                      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
                        <div className="flex flex-wrap gap-2">
                          <Pill color="blue">{candidate.role}</Pill>
                          <Pill color="purple">{currentStageLabel}</Pill>
                          <Pill color={isCompleted ? "green" : "amber"}>
                            {isCompleted ? "Completed" : "In Progress"}
                          </Pill>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isEditingStage && (
                            <select
                              value={displayStep}
                              onChange={(e) =>
                                setDraftStep(Number(e.target.value))
                              }
                              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none font-medium cursor-pointer"
                            >
                              {dynamicStages.map((stg, idx) => (
                                <option key={idx} value={idx + 1}>
                                  Step {idx + 1}: {stg}
                                </option>
                              ))}
                            </select>
                          )}

                          {isEditingStage ? (
                            <>
                              <button
                                onClick={() => handleSaveStage(candidate)}
                                className="text-green-600 hover:bg-green-50 p-1.5 rounded-lg transition"
                                title="Save progress"
                              >
                                <Check size={18} />
                              </button>
                              <button
                                onClick={cancelEditingStage}
                                className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-lg transition"
                                title="Cancel"
                              >
                                <X size={18} />
                              </button>
                            </>
                          ) : (
                            <>
                              {/* Graph API: Schedule Teams Meeting Button */}
                              <button
                                onClick={() => scheduleTeamsMeeting(candidate)}
                                className="text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 p-1.5 rounded-lg transition"
                                title="Schedule Teams Meeting"
                              >
                                <Video size={18} />
                              </button>

                              {/* Edit Progress Button */}
                              <button
                                onClick={() => startEditingStage(candidate)}
                                className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-lg transition"
                                title="Edit progress"
                              >
                                <Edit3 size={18} />
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => handleDeleteCandidate(candidate.id)}
                            className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition"
                            title="Delete candidate"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      {/* Title row: avatar + name */}
                      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
                        <div className="flex items-center gap-4">
                          <GenderAvatar
                            gender={candidate.gender}
                            completed={isCompleted}
                          />
                          <h3 className="text-xl font-bold text-slate-800">
                            {String(index + 1).padStart(2, "0")}.{" "}
                            {candidate.name}
                          </h3>
                        </div>
                      </div>

                      {/* Hiring Progress Timeline */}
                      <div className="mb-2">
                        <h4 className="text-sm font-semibold text-slate-500 mb-4">
                          Hiring Progress Timeline (Touch any stage to open Interview Rounds)
                        </h4>

                        <div className="relative pt-4 pb-2">
                          <div className="absolute top-9 left-0 right-0 h-1.5 bg-slate-200 rounded-full"></div>

                          <div
                            className="absolute top-9 left-0 h-1.5 bg-green-500 rounded-full transition-all duration-500"
                            style={{
                              width: `${
                                ((displayStep - 1) /
                                  Math.max(1, dynamicStages.length - 1)) *
                                100
                              }%`,
                            }}
                          ></div>

                          <div
                            className="grid relative z-10 gap-2"
                            style={{
                              gridTemplateColumns: `repeat(${dynamicStages.length}, minmax(0, 1fr))`,
                            }}
                          >
                            {dynamicStages.map((stage, idx) => {
                              const completed = idx + 1 <= displayStep;
                              const isCurrent = idx + 1 === displayStep;

                              return (
                                <div
                                  key={idx}
                                  className="flex flex-col items-center cursor-pointer group"
                                  onClick={() => {
                                    if (isEditingStage) {
                                      setDraftStep(idx + 1);
                                    }
                                    toggleRoundsPanel(candidate.id);
                                  }}
                                >
                                  <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold border-4 border-white shadow-md transition-all group-hover:scale-105 ${
                                      completed ? "bg-green-600" : "bg-gray-300"
                                    } ${
                                      isCurrent
                                        ? "ring-2 ring-offset-2 ring-indigo-400"
                                        : ""
                                    }`}
                                  >
                                    {idx + 1}
                                  </div>
                                  <p
                                    className={`text-[11px] mt-3 text-center font-medium line-clamp-2 px-1 ${
                                      completed
                                        ? "text-slate-800 font-semibold"
                                        : "text-slate-400"
                                    }`}
                                  >
                                    {stage}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Interview Rounds Grid */}
                      {isRoundsOpen && (
                        <div className="mt-6 border-t border-slate-100 pt-5 animate-fadeIn">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-slate-500 flex items-center gap-2">
                              <ListChecks size={15} className="text-purple-600" />
                              Interview Rounds
                              <span className="text-xs font-normal text-slate-400">
                                ({roundsForTimeline.length})
                              </span>
                            </h4>

                            <div className="flex items-center gap-2">
                              {isEditingRounds && (
                                <button
                                  onClick={handleAddRound}
                                  className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white px-2.5 py-1 rounded-lg text-xs font-semibold transition"
                                  title="Add new round"
                                >
                                  <Plus size={14} />
                                  Add Round
                                </button>
                              )}

                              {isEditingRounds ? (
                                <button
                                  onClick={() => handleSaveRounds(candidate)}
                                  className="flex items-center gap-1.5 text-green-600 hover:bg-green-50 px-2.5 py-1 rounded-lg text-xs font-semibold transition"
                                  title="Save rounds"
                                >
                                  <Check size={14} />
                                  Save
                                </button>
                              ) : (
                                <button
                                  onClick={() => startEditingRounds(candidate)}
                                  className="text-slate-400 hover:text-purple-600 hover:bg-purple-50 p-1.5 rounded-lg transition"
                                  title="Manage rounds"
                                >
                                  <Settings2 size={16} />
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-3">
                            {roundsForTimeline.map((round, idx) =>
                              isEditingRounds ? (
                                <div
                                  key={round.id}
                                  className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5"
                                >
                                  <span className="text-xs font-bold text-purple-600 shrink-0">
                                    R{idx + 1}
                                  </span>
                                  <input
                                    type="text"
                                    value={round.label}
                                    onChange={(e) =>
                                      handleRoundLabelChange(
                                        round.id,
                                        e.target.value
                                      )
                                    }
                                    placeholder="e.g. Technical Round"
                                    className="flex-1 min-w-0 bg-white text-sm font-medium text-slate-700 outline-none border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 rounded-md px-2 py-1 transition"
                                  />
                                  <button
                                    onClick={() => handleDeleteRound(round.id)}
                                    className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded transition shrink-0"
                                    title="Remove round"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              ) : (
                                <div
                                  key={round.id}
                                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3"
                                >
                                  <span className="text-xs font-bold text-purple-600">
                                    Round {idx + 1}
                                  </span>
                                  <p className="text-sm font-medium text-slate-700 mt-0.5">
                                    {round.label || "Interviewer not set"}
                                  </p>
                                </div>
                              )
                            )}

                            {roundsForTimeline.length === 0 && (
                              <p className="col-span-2 text-sm text-slate-400 italic">
                                No interview rounds recorded yet.
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Current Stage banner */}
                      <div className="mt-6 flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-5 py-3">
                        <CheckCircle2
                          size={16}
                          className="text-green-600 shrink-0"
                        />
                        <span className="text-sm font-bold text-green-700">
                          Current Stage:
                        </span>
                        <span className="text-sm text-green-700">
                          {currentStageLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredCandidates.length === 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 py-20 text-center">
                  <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <Users size={24} className="text-slate-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-700">
                    No Candidate Found
                  </h2>
                  <p className="text-slate-500 mt-2">
                    Try searching with another candidate name.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}