import React, { useState } from "react";
import Sidebar from "../components/sideBar/sideBar";
import Navbar from "../components/navBar/navBar";
import {
  Search,
  Edit3,
  Check,
  ListChecks,
  Settings2,
  Trash2,
  Plus,
  Briefcase,
  CheckCircle2,
  Clock,
  Users,
} from "lucide-react";

export default function FilterCandidate() {
  const [search, setSearch] = useState("");

  const MAX_ROUNDS = 6;

  const [candidates, setCandidates] = useState([
    {
      id: 1,
      name: "John David",
      role: "React Developer",
      gender: "male",
      status: "Interview Round 1",
      step: 5,
      rounds: [
        { id: 101, label: "Team Lead" },
        { id: 102, label: "HR Manager" },
      ],
    },
    {
      id: 2,
      name: "Arun Kumar",
      role: "UI/UX Designer",
      gender: "male",
      status: "Candidate Filter",
      step: 4,
      rounds: [{ id: 201, label: "Design Lead" }],
    },
    {
      id: 3,
      name: "Priya Sharma",
      role: "Software Tester",
      gender: "female",
      status: "Assessment",
      step: 6,
      rounds: [
        { id: 301, label: "QA Lead" },
        { id: 302, label: "Team Lead" },
        { id: 303, label: "HR" },
      ],
    },
    {
      id: 4,
      name: "Vignesh Kumar",
      role: "Java Full Stack Developer",
      gender: "male",
      status: "Onboarding",
      step: 7,
      rounds: [
        { id: 401, label: "Team Lead" },
        { id: 402, label: "Architect" },
        { id: 403, label: "HR" },
        { id: 404, label: "CTO" },
      ],
    },
    {
      id: 5,
      name: "Karthik Raj",
      role: "Python Developer",
      gender: "male",
      status: "Candidate Search",
      step: 3,
      rounds: [],
    },
  ]);

  // Dynamic Timeline Generation based on Candidate Rounds
  const buildDynamicStages = (candidateRounds) => {
    const preInterview = [
      "HR Approval",
      "Team Lead",
      "Candidate Search",
      "Candidate Filter",
    ];
    const postInterview = ["Assessment", "Onboarding"];

    let roundStages = [];
    if (!candidateRounds || candidateRounds.length === 0) {
      roundStages = ["Interview"];
    } else {
      roundStages = candidateRounds.map((r, idx) =>
        r.label ? `Round ${idx + 1}: ${r.label}` : `Round ${idx + 1}`
      );
    }

    return [...preInterview, ...roundStages, ...postInterview];
  };

  const GenderAvatar = ({ gender, completed }) => {
    const bgClass = completed ? "bg-green-600" : "bg-indigo-600";
    const bgHex = completed ? "#16A34A" : "#4F46E5";

    return (
      <div
        className={`w-14 h-14 shrink-0 rounded-full flex items-center justify-center shadow-md ring-2 ring-white ${bgClass}`}
      >
        {gender === "female" ? (
          <svg viewBox="0 0 100 100" className="w-9 h-9">
            {/* Hair silhouette */}
            <path
              d="M50,6 C64,6 74,17 74,30 C74,36 71,41 67,45 C74,52 78,62 78,74 L70,74 C70,63 67,54 61,48 C58,50 54,51 50,51 C46,51 42,50 39,48 C33,54 30,63 30,74 L22,74 C22,62 26,52 33,45 C29,41 26,36 26,30 C26,17 36,6 50,6 Z"
              fill="white"
            />
            {/* Head */}
            <circle cx="50" cy="29" r="15" fill="white" />
            {/* Shoulders / blazer */}
            <path
              d="M28,96 C28,78 38,66 50,66 C62,66 72,78 72,96 Z"
              fill="white"
            />
            {/* Blazer lapels */}
            <path d="M50,66 L40,74 L46,92 Z" fill={bgHex} />
            <path d="M50,66 L60,74 L54,92 Z" fill={bgHex} />
          </svg>
        ) : (
          <svg viewBox="0 0 100 100" className="w-9 h-9">
            {/* Shoulders / suit */}
            <path
              d="M20,96 C20,72 33,58 50,58 C67,58 80,72 80,96 Z"
              fill="white"
            />
            {/* Head */}
            <circle cx="50" cy="30" r="17" fill="white" />
            {/* Suit lapels */}
            <path d="M50,58 L38,68 L44,90 Z" fill={bgHex} />
            <path d="M50,58 L62,68 L56,90 Z" fill={bgHex} />
            {/* Tie */}
            <path d="M47,60 L53,60 L51,95 L49,95 Z" fill={bgHex} />
          </svg>
        )}
      </div>
    );
  };

  // ---------- Stage editing ----------
  const [editingStageId, setEditingStageId] = useState(null);
  const [draftStep, setDraftStep] = useState(1);

  const startEditingStage = (candidate) => {
    setEditingStageId(candidate.id);
    setDraftStep(candidate.step);
  };

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
    setDraftRounds((prev) => {
      if (prev.length >= MAX_ROUNDS) return prev;
      return [
        ...prev,
        { id: Date.now() + Math.floor(Math.random() * 1000), label: "" },
      ];
    });
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

  const filteredCandidates = candidates.filter((candidate) =>
    candidate.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen w-full bg-slate-100 overflow-hidden">
      {/* Sidebar: Fixed left column */}
      <aside className="w-64 shrink-0 h-full border-r border-slate-200 bg-white">
        <Sidebar />
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-y-auto">
        {/* Navbar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
          <Navbar />
        </header>

        {/* Page Main Content */}
        <main className="p-8 flex-1">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <h1 className="text-3xl font-bold text-slate-800">
              Filter Candidates
            </h1>
            <div className="h-8 border-l-2 border-slate-300"></div>
            <span className="text-slate-500 text-sm font-medium bg-slate-200/60 px-3 py-1 rounded-full">
              Smart Candidate Tracking
            </span>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
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
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
              </div>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 rounded-xl font-medium transition shadow-sm">
                Search
              </button>
            </div>
          </div>

          {/* Candidate List */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mt-8">
            <div className="border-b border-slate-200 px-8 py-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">
                Candidate List
              </h2>
              <span className="text-xs font-semibold bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full">
                {filteredCandidates.length} total
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredCandidates.map((candidate) => {
                const isEditingStage = editingStageId === candidate.id;
                const isEditingRounds = editingRoundsId === candidate.id;

                const roundsForTimeline = isEditingRounds
                  ? draftRounds
                  : candidate.rounds;
                const dynamicStages = buildDynamicStages(roundsForTimeline);

                const displayStep = isEditingStage
                  ? Math.min(draftStep, dynamicStages.length)
                  : Math.min(candidate.step, dynamicStages.length);

                const isCompleted = displayStep >= dynamicStages.length;

                return (
                  <div
                    key={candidate.id}
                    className="p-6 hover:bg-slate-50/60 transition"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <GenderAvatar
                          gender={candidate.gender}
                          completed={isCompleted}
                        />

                        <div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-xl font-bold text-slate-800">
                              {candidate.name}
                            </h3>
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600">
                              {dynamicStages[displayStep - 1] || "In Progress"}
                            </span>
                          </div>
                          <p className="text-slate-500 mt-1 flex items-center gap-1.5 text-sm">
                            <Briefcase size={14} className="text-slate-400" />
                            {candidate.role}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold shrink-0 ${
                          isCompleted
                            ? "bg-green-100 text-green-700"
                            : "bg-indigo-100 text-indigo-700"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 size={15} />
                        ) : (
                          <Clock size={15} />
                        )}
                        {isCompleted ? "Completed" : "In Progress"}
                      </span>
                    </div>

                    {/* Stage Timeline */}
                    <div className="mt-8 pt-6 border-t border-slate-100">
                      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
                        <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                            <Edit3 size={14} className="text-indigo-600" />
                          </span>
                          Hiring Progress
                        </h4>

                        <div className="flex items-center gap-3">
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
                            <button
                              onClick={() => handleSaveStage(candidate)}
                              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition shadow-sm"
                            >
                              <Check size={14} />
                              Save
                            </button>
                          ) : (
                            <button
                              onClick={() => startEditingStage(candidate)}
                              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition shadow-sm"
                            >
                              <Edit3 size={14} />
                              Edit Progress
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Visual Timeline Bar */}
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
                          {dynamicStages.map((stage, index) => {
                            const completed = index + 1 <= displayStep;
                            const isCurrent = index + 1 === displayStep;

                            return (
                              <div
                                key={index}
                                className={`flex flex-col items-center ${
                                  isEditingStage
                                    ? "cursor-pointer"
                                    : "cursor-default"
                                }`}
                                onClick={() => {
                                  if (isEditingStage) {
                                    setDraftStep(index + 1);
                                  }
                                }}
                              >
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold border-4 border-white shadow-md transition-all ${
                                    isEditingStage ? "hover:scale-105" : ""
                                  } ${
                                    completed ? "bg-green-600" : "bg-gray-300"
                                  } ${
                                    isCurrent
                                      ? "ring-2 ring-offset-2 ring-indigo-400"
                                      : ""
                                  }`}
                                >
                                  {index + 1}
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

                    {/* Interview Rounds Section */}
                    <div className="mt-6 pt-6 border-t border-slate-100">
                      <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
                        <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
                            <ListChecks size={14} className="text-purple-600" />
                          </span>
                          Interview Rounds
                          <span className="text-xs font-normal text-slate-400">
                            ({roundsForTimeline.length}/{MAX_ROUNDS})
                          </span>
                        </h4>

                        {isEditingRounds ? (
                          <button
                            onClick={() => handleSaveRounds(candidate)}
                            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition shadow-sm"
                          >
                            <Check size={14} />
                            Save Rounds
                          </button>
                        ) : (
                          <button
                            onClick={() => startEditingRounds(candidate)}
                            className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition shadow-sm"
                          >
                            <Settings2 size={14} />
                            Manage Rounds
                          </button>
                        )}
                      </div>

                      {isEditingRounds && (
                        <div className="space-y-2">
                          {roundsForTimeline.map((round, idx) => (
                            <div
                              key={round.id}
                              className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5"
                            >
                              <div className="flex items-center gap-2 flex-1">
                                <span className="w-16 shrink-0 text-xs font-semibold text-purple-600">
                                  Round {idx + 1}
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
                                  className="flex-1 bg-white text-sm font-medium text-slate-700 outline-none border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 rounded-md px-2 py-1.5 transition"
                                />
                              </div>

                              <button
                                onClick={() => handleDeleteRound(round.id)}
                                className="ml-3 text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-md transition"
                                title="Remove round"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}

                          {roundsForTimeline.length === 0 && (
                            <p className="text-sm text-slate-400 italic">
                              No interview rounds recorded yet.
                            </p>
                          )}

                          {roundsForTimeline.length < MAX_ROUNDS && (
                            <button
                              onClick={handleAddRound}
                              className="w-full mt-1 flex items-center justify-center gap-1.5 border-2 border-dashed border-purple-300 text-purple-600 hover:bg-purple-50 rounded-lg py-2 text-sm font-semibold transition"
                            >
                              <Plus size={14} />
                              Add Round
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredCandidates.length === 0 && (
                <div className="py-20 text-center">
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
        </main>
      </div>
    </div>
  );
}