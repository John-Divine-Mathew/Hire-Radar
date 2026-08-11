import React, { useEffect, useMemo, useState } from "react";

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
  Clock,
  Users,
  AlertCircle,
  ChevronDown,
  UserRound,
  UserRoundCheck,
} from "lucide-react";

// ============================================================
// GENDER AVATAR
// ============================================================

const GenderAvatar = ({ gender, completed }) => {
  const bgClass = completed ? "bg-green-600" : "bg-indigo-600";

  return (
    <div
      className={`w-14 h-14 shrink-0 rounded-full flex items-center justify-center shadow-md ring-2 ring-white ${bgClass}`}
    >
      {gender === "female" ? (
        <UserRound className="text-white" size={28} />
      ) : (
        <UserRoundCheck className="text-white" size={28} />
      )}
    </div>
  );
};

// ============================================================
// PILL
// ============================================================

const Pill = ({ color = "blue", children }) => {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    amber: "bg-amber-50 text-amber-700",
    green: "bg-green-50 text-green-700",
    red: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        colorMap[color] || colorMap.blue
      }`}
    >
      {children}
    </span>
  );
};

// ============================================================
// TIMING BADGE
// ============================================================

const TimingBadge = ({ timingStatus, delayDays }) => {
  const isDelayed = timingStatus === "Delayed";

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${
        isDelayed
          ? "bg-red-50 text-red-700 border-red-100"
          : "bg-green-50 text-green-700 border-green-100"
      }`}
    >
      {isDelayed ? (
        <AlertCircle size={14} />
      ) : (
        <CheckCircle2 size={14} />
      )}

      <span>{isDelayed ? "Delayed" : "On Time"}</span>

      {isDelayed && delayDays > 0 && (
        <span>
          +{delayDays} day{delayDays > 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
};

// ============================================================
// DATE PARSER
// ============================================================

const parseScheduledDate = (scheduledDate) => {
  if (!scheduledDate) {
    return new Date(NaN);
  }

  const parsed = new Date(scheduledDate);

  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }

  const match = String(scheduledDate)
    .trim()
    .match(
      /^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})$/
    );

  if (!match) {
    return new Date(NaN);
  }

  const [, monthName, day, year] = match;

  const monthIndex = new Date(
    `${monthName} 1, ${year}`
  ).getMonth();

  return new Date(
    Number(year),
    monthIndex,
    Number(day)
  );
};

// ============================================================
// DATE ONLY
// ============================================================

const getDateOnly = (date) => {
  const d = new Date(date);

  if (Number.isNaN(d.getTime())) {
    return new Date(NaN);
  }

  return new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate()
  );
};

// ============================================================
// FORMAT DATE
// ============================================================

const formatDate = (date) => {
  const d = new Date(date);

  if (Number.isNaN(d.getTime())) {
    return "Invalid Date";
  }

  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

// ============================================================
// FORMAT LIVE TIME
// ============================================================

const formatTime = (date) => {
  const d = new Date(date);

  if (Number.isNaN(d.getTime())) {
    return "--:--:--";
  }

  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

// ============================================================
// CREATE SCHEDULED DATE + TIME
// ============================================================

const createScheduledDateTime = (
  scheduledDate,
  scheduledTime
) => {
  const date = parseScheduledDate(scheduledDate);

  if (Number.isNaN(date.getTime())) {
    return new Date(NaN);
  }

  const timeParts = String(scheduledTime || "")
    .trim()
    .match(
      /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i
    );

  if (!timeParts) {
    return date;
  }

  let hours = Number(timeParts[1]);
  const minutes = Number(timeParts[2]);
  const period = timeParts[3].toUpperCase();

  if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) {
    return date;
  }

  if (period === "PM" && hours !== 12) {
    hours += 12;
  }

  if (period === "AM" && hours === 12) {
    hours = 0;
  }

  date.setHours(hours, minutes, 0, 0);

  return date;
};

// ============================================================
// CALCULATE TIMING
// ============================================================

const calculateTiming = (
  scheduledDate,
  scheduledTime
) => {
  const now = new Date();

  const scheduled = createScheduledDateTime(
    scheduledDate,
    scheduledTime
  );

  if (Number.isNaN(scheduled.getTime())) {
    return {
      timingStatus: "On Time",
      delayDays: 0,
      currentDate: formatDate(now),
      currentTime: formatTime(now),
    };
  }

  const differenceInMs =
    now.getTime() - scheduled.getTime();

  const isDelayed = differenceInMs > 0;

  /*
   * IMPORTANT:
   * Delay is calculated based on calendar days,
   * not simply 24-hour blocks.
   *
   * Example:
   * Scheduled: August 11, 10:30 AM
   * Current:   August 11, 11:00 AM
   * Result: Delayed, 0 days
   *
   * Current: August 12
   * Result: Delayed, 1 day
   */

  let delayDays = 0;

  if (isDelayed) {
    const scheduledDay = getDateOnly(scheduled);
    const currentDay = getDateOnly(now);

    delayDays = Math.max(
      0,
      Math.floor(
        (currentDay.getTime() -
          scheduledDay.getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );
  }

  return {
    timingStatus: isDelayed
      ? "Delayed"
      : "On Time",

    delayDays,

    currentDate: formatDate(now),

    currentTime: formatTime(now),
  };
};

// ============================================================
// SCHEDULE TIMELINE
// ============================================================

const ScheduleTimeline = ({ candidate }) => {
  const isDelayed =
    candidate.timingStatus === "Delayed";

  return (
    <div
      className={`mt-5 rounded-xl border p-4 ${
        isDelayed
          ? "bg-red-50/50 border-red-100"
          : "bg-green-50/50 border-green-100"
      }`}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Clock
            size={17}
            className={
              isDelayed
                ? "text-red-600"
                : "text-green-600"
            }
          />

          <h4 className="text-sm font-bold text-slate-700">
            Schedule Timeline
          </h4>
        </div>

        <TimingBadge
          timingStatus={
            candidate.timingStatus
          }
          delayDays={candidate.delayDays}
        />
      </div>

      {/* TIMELINE */}
      <div className="relative">
        <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-slate-200" />

        {/* SCHEDULED */}
        <div className="relative flex gap-4 pb-5">
          <div className="relative z-10 w-4 h-4 mt-1 rounded-full bg-indigo-600 ring-4 ring-white shrink-0" />

          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">
              Scheduled
            </p>

            <p className="text-sm font-semibold text-slate-700 mt-1">
              {candidate.scheduledDate}
            </p>

            <p className="text-xs font-semibold text-indigo-600 mt-1">
              Scheduled Time:{" "}
              {candidate.scheduledTime}
            </p>

            <p className="text-xs text-slate-400 mt-1">
              Expected interview date & time
            </p>
          </div>
        </div>

        {/* CURRENT */}
        <div className="relative flex gap-4">
          <div
            className={`relative z-10 w-4 h-4 mt-1 rounded-full ring-4 ring-white shrink-0 ${
              isDelayed
                ? "bg-red-500"
                : "bg-green-500"
            }`}
          />

          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">
              Current Date & Time
            </p>

            <p
              className={`text-sm font-semibold mt-1 ${
                isDelayed
                  ? "text-red-700"
                  : "text-green-700"
              }`}
            >
              {candidate.currentDate}
            </p>

            <p
              className={`text-xs font-semibold mt-1 ${
                isDelayed
                  ? "text-red-600"
                  : "text-green-600"
              }`}
            >
              {candidate.currentTime}
            </p>

            <div className="flex items-center gap-2 mt-2">
              {isDelayed ? (
                <>
                  <AlertCircle
                    size={13}
                    className="text-red-500"
                  />

                  <span className="text-xs font-semibold text-red-600">
                    Delayed
                    {candidate.delayDays > 0
                      ? ` by ${candidate.delayDays} day${
                          candidate.delayDays > 1
                            ? "s"
                            : ""
                        }`
                      : " — scheduled time has passed"}
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2
                    size={13}
                    className="text-green-500"
                  />

                  <span className="text-xs font-semibold text-green-600">
                    Progress is on schedule
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// DEFAULT ROUNDS
// ============================================================

const DEFAULT_ROUNDS = [
  {
    id: 1,
    label: "Written Test",
  },
  {
    id: 2,
    label: "Technical Test",
  },
  {
    id: 3,
    label: "Technical Interview",
  },
  {
    id: 4,
    label: "HR",
  },
  {
    id: 5,
    label: "HR Screening",
  },
  {
    id: 6,
    label: "Hiring Manager Screening",
  },
];

// ============================================================
// INITIAL CANDIDATES
// ============================================================

const INITIAL_CANDIDATES = [
  {
    id: 1,
    name: "John David",
    role: "React Developer",
    gender: "male",
    status: "Technical Test",
    step: 2,
    rounds: DEFAULT_ROUNDS,
    scheduledDate: "August 11, 2026",
    scheduledTime: "10:30 AM",
    currentDate: "",
    currentTime: "",
    timingStatus: "On Time",
    delayDays: 0,
  },

  {
    id: 2,
    name: "Priya Sharma",
    role: "Software Tester",
    gender: "female",
    status: "HR",
    step: 4,
    rounds: DEFAULT_ROUNDS,
    scheduledDate: "August 11, 2026",
    scheduledTime: "10:30 AM",
    currentDate: "",
    currentTime: "",
    timingStatus: "On Time",
    delayDays: 0,
  },

  {
    id: 3,
    name: "Arun Kumar",
    role: "UI/UX Designer",
    gender: "male",
    status: "Written Test",
    step: 1,
    rounds: DEFAULT_ROUNDS,
    scheduledDate: "August 11, 2026",
    scheduledTime: "11:00 AM",
    currentDate: "",
    currentTime: "",
    timingStatus: "On Time",
    delayDays: 0,
  },

  {
    id: 4,
    name: "Vignesh Kumar",
    role: "Java Full Stack Developer",
    gender: "male",
    status: "Hiring Manager Screening",
    step: 6,
    rounds: DEFAULT_ROUNDS,
    scheduledDate: "August 11, 2026",
    scheduledTime: "11:00 AM",
    currentDate: "",
    currentTime: "",
    timingStatus: "On Time",
    delayDays: 0,
  },

  {
    id: 5,
    name: "Karthik Raj",
    role: "Python Developer",
    gender: "male",
    status: "Technical Interview",
    step: 3,
    rounds: DEFAULT_ROUNDS,
    scheduledDate: "August 11, 2026",
    scheduledTime: "11:30 AM",
    currentDate: "",
    currentTime: "",
    timingStatus: "On Time",
    delayDays: 0,
  },
];

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function FilterCandidate() {
  const [search, setSearch] = useState("");
  const [timingFilter, setTimingFilter] =
    useState("All");

  const [candidates, setCandidates] =
    useState(INITIAL_CANDIDATES);

  // ==========================================================
  // LIVE DATE + TIME
  // ==========================================================

  useEffect(() => {
    const updateTimingAutomatically = () => {
      setCandidates(
        (previousCandidates) =>
          previousCandidates.map(
            (candidate) => {
              const timing =
                calculateTiming(
                  candidate.scheduledDate,
                  candidate.scheduledTime
                );

              return {
                ...candidate,

                timingStatus:
                  timing.timingStatus,

                delayDays:
                  timing.delayDays,

                currentDate:
                  timing.currentDate,

                currentTime:
                  timing.currentTime,
              };
            }
          )
      );
    };

    updateTimingAutomatically();

    const interval = setInterval(
      updateTimingAutomatically,
      1000
    );

    return () => {
      clearInterval(interval);
    };
  }, []);

  // ==========================================================
  // PANELS
  // ==========================================================

  const [
    openRoundsCandidateId,
    setOpenRoundsCandidateId,
  ] = useState(null);

  const [
    openScheduleCandidateId,
    setOpenScheduleCandidateId,
  ] = useState(null);

  const toggleSchedulePanel = (
    candidateId
  ) => {
    setOpenScheduleCandidateId(
      (previousId) =>
        previousId === candidateId
          ? null
          : candidateId
    );
  };

  const toggleRoundsPanel = (
    candidateId
  ) => {
    setOpenRoundsCandidateId(
      (previousId) =>
        previousId === candidateId
          ? null
          : candidateId
    );
  };

  // ==========================================================
  // DYNAMIC STAGES
  // ==========================================================

  const buildDynamicStages = (
    candidateRounds
  ) => {
    if (
      !Array.isArray(candidateRounds) ||
      candidateRounds.length === 0
    ) {
      return [];
    }

    return candidateRounds
      .filter(
        (round) =>
          round &&
          typeof round.label ===
            "string" &&
          round.label.trim().length > 0
      )
      .map((round) =>
        round.label.trim()
      );
  };

  // ==========================================================
  // STAGE EDITING
  // ==========================================================

  const [editingStageId, setEditingStageId] =
    useState(null);

  const [draftStep, setDraftStep] =
    useState(1);

  const startEditingStage = (
    candidate
  ) => {
    const stages = buildDynamicStages(
      candidate.rounds
    );

    if (stages.length === 0) {
      return;
    }

    setEditingStageId(candidate.id);

    setDraftStep(
      Math.max(
        1,
        Math.min(
          Number(candidate.step) || 1,
          stages.length
        )
      )
    );
  };

  const cancelEditingStage = () => {
    setEditingStageId(null);
  };

  const handleSaveStage = (
    candidate
  ) => {
    const currentStages =
      buildDynamicStages(
        candidate.rounds
      );

    if (currentStages.length === 0) {
      setEditingStageId(null);
      return;
    }

    const validStep = Math.max(
      1,
      Math.min(
        Number(draftStep) || 1,
        currentStages.length
      )
    );

    const isCompleted =
      validStep >=
      currentStages.length;

    setCandidates(
      (previousCandidates) =>
        previousCandidates.map(
          (currentCandidate) => {
            if (
              currentCandidate.id !==
              candidate.id
            ) {
              return currentCandidate;
            }

            return {
              ...currentCandidate,

              step: validStep,

              status: isCompleted
                ? "Completed"
                : currentStages[
                    validStep - 1
                  ],
            };
          }
        )
    );

    setEditingStageId(null);
  };

  // ==========================================================
  // ROUND EDITING
  // ==========================================================

  const [
    editingRoundsId,
    setEditingRoundsId,
  ] = useState(null);

  const [
    draftRounds,
    setDraftRounds,
  ] = useState([]);

  const startEditingRounds = (
    candidate
  ) => {
    setEditingRoundsId(candidate.id);

    setDraftRounds(
      Array.isArray(candidate.rounds)
        ? candidate.rounds.map(
            (round) => ({
              ...round,
            })
          )
        : []
    );
  };

  const handleAddRound = () => {
    setDraftRounds(
      (previousRounds) => [
        ...previousRounds,
        {
          id:
            Date.now() +
            Math.floor(
              Math.random() * 1000
            ),
          label: "",
        },
      ]
    );
  };

  const handleRoundLabelChange = (
    roundId,
    value
  ) => {
    setDraftRounds(
      (previousRounds) =>
        previousRounds.map(
          (round) =>
            round.id === roundId
              ? {
                  ...round,
                  label: value,
                }
              : round
        )
    );
  };

  const handleDeleteRound = (
    roundId
  ) => {
    setDraftRounds(
      (previousRounds) =>
        previousRounds.filter(
          (round) =>
            round.id !== roundId
        )
    );
  };

  const handleSaveRounds = (
    candidate
  ) => {
    const cleanedRounds =
      draftRounds
        .map((round) => ({
          ...round,
          label:
            typeof round.label ===
            "string"
              ? round.label.trim()
              : "",
        }))
        .filter(
          (round) =>
            round.label.length > 0
        );

    const newStages =
      buildDynamicStages(
        cleanedRounds
      );

    if (newStages.length === 0) {
      setCandidates(
        (previousCandidates) =>
          previousCandidates.map(
            (currentCandidate) =>
              currentCandidate.id ===
              candidate.id
                ? {
                    ...currentCandidate,
                    rounds: [],
                    step: 1,
                    status:
                      "In Progress",
                  }
                : currentCandidate
          )
      );

      setEditingRoundsId(null);
      setDraftRounds([]);

      return;
    }

    const adjustedStep = Math.min(
      Math.max(
        Number(candidate.step) || 1,
        1
      ),
      newStages.length
    );

    const isCompleted =
      adjustedStep >=
      newStages.length;

    setCandidates(
      (previousCandidates) =>
        previousCandidates.map(
          (currentCandidate) =>
            currentCandidate.id ===
            candidate.id
              ? {
                  ...currentCandidate,

                  rounds:
                    cleanedRounds,

                  step: adjustedStep,

                  status: isCompleted
                    ? "Completed"
                    : newStages[
                        adjustedStep - 1
                      ],
                }
              : currentCandidate
        )
    );

    setEditingRoundsId(null);
    setDraftRounds([]);
  };

  // ==========================================================
  // DELETE CANDIDATE
  // ==========================================================

  const handleDeleteCandidate = (
    candidateId
  ) => {
    setCandidates(
      (previousCandidates) =>
        previousCandidates.filter(
          (candidate) =>
            candidate.id !==
            candidateId
        )
    );

    if (
      editingStageId ===
      candidateId
    ) {
      setEditingStageId(null);
    }

    if (
      editingRoundsId ===
      candidateId
    ) {
      setEditingRoundsId(null);
      setDraftRounds([]);
    }

    if (
      openRoundsCandidateId ===
      candidateId
    ) {
      setOpenRoundsCandidateId(
        null
      );
    }

    if (
      openScheduleCandidateId ===
      candidateId
    ) {
      setOpenScheduleCandidateId(
        null
      );
    }
  };

  // ==========================================================
  // FILTER
  // ==========================================================

  const filteredCandidates = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return candidates.filter(
      (candidate) => {
        const candidateName =
          String(
            candidate.name || ""
          ).toLowerCase();

        const candidateRole =
          String(
            candidate.role || ""
          ).toLowerCase();

        const matchesSearch =
          searchValue === "" ||
          candidateName.includes(
            searchValue
          ) ||
          candidateRole.includes(
            searchValue
          );

        const matchesTiming =
          timingFilter === "All" ||
          candidate.timingStatus ===
            timingFilter;

        return (
          matchesSearch &&
          matchesTiming
        );
      }
    );
  }, [
    candidates,
    search,
    timingFilter,
  ]);

  // ==========================================================
  // COUNTS
  // ==========================================================

  const onTimeCount =
    candidates.filter(
      (candidate) =>
        candidate.timingStatus ===
        "On Time"
    ).length;

  const delayedCount =
    candidates.filter(
      (candidate) =>
        candidate.timingStatus ===
        "Delayed"
    ).length;

  // ==========================================================
  // RETURN
  // ==========================================================

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <Sidebar />

      {/* ======================================================
          MAIN AREA
      ====================================================== */}

      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* ====================================================
            NAVBAR
        ==================================================== */}

        <Navbar />

        {/* ====================================================
            PAGE CONTENT
        ==================================================== */}

        <div className="flex-1 overflow-y-auto min-w-0">
          <div className="p-6 w-full flex flex-col gap-6">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="flex items-center gap-4 mb-2 flex-wrap">
              <h1 className="text-4xl font-bold text-gray-900">
                Filter Candidates
              </h1>

              <div className="h-8 border-l-2 border-slate-300 hidden md:block" />

              <span className="text-slate-500 text-sm font-medium bg-slate-200/60 px-3 py-1 rounded-full">
                Smart Candidate Tracking
              </span>
            </div>

            {/* ==================================================
                SEARCH + FILTER
            ================================================== */}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 w-full">
              <div className="flex gap-4 flex-wrap">

                {/* SEARCH */}

                <div className="relative flex-1 min-w-[250px]">
                  <Search
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    placeholder="Search Candidate..."
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value
                      )
                    }
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-base"
                  />
                </div>

                {/* SEARCH BUTTON */}

                <button
                  type="button"
                  onClick={() => {
                    // Search is already live through the input.
                    // This button intentionally remains for UI.
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 rounded-xl font-semibold transition duration-200 shadow-sm"
                >
                  Search
                </button>

                {/* FILTER */}

                <div className="relative">
                  <select
                    value={timingFilter}
                    onChange={(event) =>
                      setTimingFilter(
                        event.target.value
                      )
                    }
                    className="appearance-none h-full min-w-[170px] pl-4 pr-10 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="All">
                      All Candidates
                    </option>

                    <option value="On Time">
                      On Time
                    </option>

                    <option value="Delayed">
                      Delayed
                    </option>
                  </select>

                  <ChevronDown
                    size={17}
                    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
                  />
                </div>
              </div>

              {/* STATUS SUMMARY */}

              <div className="flex gap-3 mt-4 flex-wrap">
                <div className="flex items-center gap-2 bg-green-50 border border-green-100 px-3 py-2 rounded-lg">
                  <Clock
                    size={15}
                    className="text-green-600"
                  />

                  <span className="text-xs font-semibold text-green-700">
                    {onTimeCount} On Time
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
                  <AlertCircle
                    size={15}
                    className="text-red-600"
                  />

                  <span className="text-xs font-semibold text-red-700">
                    {delayedCount} Delayed
                  </span>
                </div>
              </div>
            </div>

            {/* ==================================================
                CANDIDATE COUNT
            ================================================== */}

            <div className="flex items-center justify-between mt-1 mb-2 px-1">
              <h2 className="text-xl font-bold text-slate-800">
                Candidate List
              </h2>

              <span className="text-xs font-semibold bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full">
                {filteredCandidates.length} total
              </span>
            </div>

            {/* ==================================================
                CANDIDATE CARDS
            ================================================== */}

            <div className="space-y-6">
              {filteredCandidates.map(
                (candidate, index) => {
                  const isEditingStage =
                    editingStageId ===
                    candidate.id;

                  const isEditingRounds =
                    editingRoundsId ===
                    candidate.id;

                  const isRoundsOpen =
                    openRoundsCandidateId ===
                    candidate.id;

                  const isScheduleOpen =
                    openScheduleCandidateId ===
                    candidate.id;

                  const roundsForTimeline =
                    isEditingRounds
                      ? draftRounds
                      : Array.isArray(
                          candidate.rounds
                        )
                      ? candidate.rounds
                      : [];

                  const dynamicStages =
                    buildDynamicStages(
                      roundsForTimeline
                    );

                  const safeStageLength =
                    Math.max(
                      dynamicStages.length,
                      1
                    );

                  const rawStep =
                    Number(candidate.step) ||
                    1;

                  const displayStep =
                    isEditingStage
                      ? Math.max(
                          1,
                          Math.min(
                            Number(
                              draftStep
                            ) || 1,
                            safeStageLength
                          )
                        )
                      : Math.max(
                          1,
                          Math.min(
                            rawStep,
                            safeStageLength
                          )
                        );

                  const isCompleted =
                    candidate.status ===
                      "Completed" ||
                    (dynamicStages.length >
                      0 &&
                      displayStep >=
                        dynamicStages.length);

                  const currentStageLabel =
                    isCompleted
                      ? "Completed"
                      : dynamicStages[
                          displayStep - 1
                        ] ||
                        "In Progress";

                  const progressPercentage =
                    dynamicStages.length === 0
                      ? 0
                      : dynamicStages.length === 1
                      ? 100
                      : ((displayStep - 1) /
                          (dynamicStages.length -
                            1)) *
                        100;

                  return (
                    <div
                      key={
                        candidate.id
                      }
                      className={`relative bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-md transition ${
                        candidate.timingStatus ===
                        "Delayed"
                          ? "border-red-200"
                          : "border-slate-200"
                      }`}
                    >
                      {/* LEFT ACCENT */}

                      <div
                        className={`absolute left-0 top-0 h-full w-1.5 ${
                          candidate.timingStatus ===
                          "Delayed"
                            ? "bg-red-500"
                            : "bg-purple-600"
                        }`}
                      />

                      <div className="pl-7 pr-6 py-6">

                        {/* ==================================================
                            TOP ROW
                        ================================================== */}

                        <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
                          <div className="flex flex-wrap gap-2">
                            <Pill color="blue">
                              {candidate.role}
                            </Pill>

                            <Pill color="purple">
                              {
                                currentStageLabel
                              }
                            </Pill>

                            <Pill
                              color={
                                isCompleted
                                  ? "green"
                                  : "amber"
                              }
                            >
                              {isCompleted
                                ? "Completed"
                                : "In Progress"}
                            </Pill>

                            <TimingBadge
                              timingStatus={
                                candidate.timingStatus
                              }
                              delayDays={
                                candidate.delayDays
                              }
                            />
                          </div>

                          {/* ACTIONS */}

                          <div className="flex items-center gap-2 shrink-0">
                            {isEditingStage && (
                              <select
                                value={
                                  displayStep
                                }
                                onChange={(
                                  event
                                ) =>
                                  setDraftStep(
                                    Number(
                                      event
                                        .target
                                        .value
                                    )
                                  )
                                }
                                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none font-medium cursor-pointer max-w-[220px]"
                              >
                                {dynamicStages.map(
                                  (
                                    stage,
                                    stageIndex
                                  ) => (
                                    <option
                                      key={`${candidate.id}-stage-${stageIndex}`}
                                      value={
                                        stageIndex +
                                        1
                                      }
                                    >
                                      Step{" "}
                                      {stageIndex +
                                        1}
                                      :{" "}
                                      {stage}
                                    </option>
                                  )
                                )}
                              </select>
                            )}

                            {isEditingStage ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleSaveStage(
                                      candidate
                                    )
                                  }
                                  className="text-green-600 hover:bg-green-50 p-1.5 rounded-lg transition"
                                  title="Save progress"
                                >
                                  <Check
                                    size={
                                      18
                                    }
                                  />
                                </button>

                                <button
                                  type="button"
                                  onClick={
                                    cancelEditingStage
                                  }
                                  className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-lg transition"
                                  title="Cancel"
                                >
                                  <X
                                    size={
                                      18
                                    }
                                  />
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  startEditingStage(
                                    candidate
                                  )
                                }
                                className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-lg transition"
                                title="Edit progress"
                              >
                                <Edit3
                                  size={
                                    18
                                  }
                                />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteCandidate(
                                  candidate.id
                                )
                              }
                              className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition"
                              title="Delete candidate"
                            >
                              <Trash2
                                size={
                                  18
                                }
                              />
                            </button>
                          </div>
                        </div>

                        {/* ==================================================
                            NAME
                        ================================================== */}

                        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
                          <div className="flex items-center gap-4">
                            <GenderAvatar
                              gender={
                                candidate.gender
                              }
                              completed={
                                isCompleted
                              }
                            />

                            <div>
                              <h3 className="text-xl font-bold text-slate-800">
                                {String(
                                  index + 1
                                ).padStart(
                                  2,
                                  "0"
                                )}
                                .{" "}
                                {
                                  candidate.name
                                }
                              </h3>

                              <p className="text-xs text-slate-400 mt-1">
                                Candidate ID: #
                                {String(
                                  candidate.id
                                ).padStart(
                                  4,
                                  "0"
                                )}
                              </p>
                            </div>
                          </div>

                          {/* BIG STATUS */}

                          <div
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                              candidate.timingStatus ===
                              "Delayed"
                                ? "bg-red-50 border border-red-100"
                                : "bg-green-50 border border-green-100"
                            }`}
                          >
                            {candidate.timingStatus ===
                            "Delayed" ? (
                              <AlertCircle
                                size={
                                  18
                                }
                                className="text-red-600"
                              />
                            ) : (
                              <CheckCircle2
                                size={
                                  18
                                }
                                className="text-green-600"
                              />
                            )}

                            <div>
                              <p
                                className={`text-xs font-bold ${
                                  candidate.timingStatus ===
                                  "Delayed"
                                    ? "text-red-700"
                                    : "text-green-700"
                                }`}
                              >
                                {
                                  candidate.timingStatus
                                }
                              </p>

                              <p className="text-[10px] text-slate-400">
                                Interview Schedule
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* ==================================================
                            SCHEDULE INFO
                        ================================================== */}

                        <div className="mb-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
                            <Clock
                              size={
                                18
                              }
                              className="text-indigo-600 shrink-0"
                            />

                            <div>
                              <p className="text-[10px] uppercase font-bold text-slate-400">
                                Scheduled Date
                              </p>

                              <p className="text-sm font-semibold text-slate-700">
                                {
                                  candidate.scheduledDate
                                }
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 bg-purple-50 border border-purple-100 rounded-xl px-4 py-3">
                            <Clock
                              size={
                                18
                              }
                              className="text-purple-600 shrink-0"
                            />

                            <div>
                              <p className="text-[10px] uppercase font-bold text-slate-400">
                                Scheduled Time
                              </p>

                              <p className="text-sm font-semibold text-purple-700">
                                {
                                  candidate.scheduledTime
                                }
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* ==================================================
                            SCHEDULE BUTTON
                        ================================================== */}

                        <div className="border-t border-slate-100 pt-5 flex justify-center mb-5">
                          <button
                            type="button"
                            onClick={() =>
                              toggleSchedulePanel(
                                candidate.id
                              )
                            }
                            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all shadow-sm ${
                              isScheduleOpen
                                ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                                : "bg-white border-slate-200 text-slate-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700"
                            }`}
                          >
                            <Clock
                              size={
                                16
                              }
                            />

                            <span>
                              Schedule Timing
                            </span>

                            <ChevronDown
                              size={
                                15
                              }
                              className={`transition-transform duration-200 ${
                                isScheduleOpen
                                  ? "rotate-180"
                                  : ""
                              }`}
                            />
                          </button>
                        </div>

                        {/* ==================================================
                            SCHEDULE TIMELINE
                        ================================================== */}

                        {isScheduleOpen && (
                          <ScheduleTimeline
                            candidate={
                              candidate
                            }
                          />
                        )}

                        {/* ==================================================
                            HIRING PROGRESS
                        ================================================== */}

                        <div className="mb-2 mt-5">
                          <h4 className="text-sm font-semibold text-slate-500 mb-4">
                            Hiring Progress Timeline

                            <span className="font-normal text-slate-400 ml-1">
                              (Touch any stage to open Interview Rounds)
                            </span>
                          </h4>

                          <div className="relative pt-4 pb-2">
                            {/* BASE LINE */}

                            {dynamicStages.length >
                              1 && (
                              <div className="absolute top-9 left-0 right-0 h-1.5 bg-slate-200 rounded-full" />
                            )}

                            {/* PROGRESS LINE */}

                            {dynamicStages.length >
                              1 && (
                              <div
                                className="absolute top-9 left-0 h-1.5 bg-green-500 rounded-full transition-all duration-500"
                                style={{
                                  width: `${progressPercentage}%`,
                                }}
                              />
                            )}

                            {/* STAGES */}

                            <div
                              className="grid relative z-10 gap-2"
                              style={{
                                gridTemplateColumns: `repeat(${safeStageLength}, minmax(0, 1fr))`,
                              }}
                            >
                              {dynamicStages.length >
                              0 ? (
                                dynamicStages.map(
                                  (
                                    stage,
                                    stageIndex
                                  ) => {
                                    const completed =
                                      stageIndex +
                                        1 <=
                                      displayStep;

                                    const isCurrent =
                                      stageIndex +
                                        1 ===
                                      displayStep;

                                    return (
                                      <div
                                        key={`${candidate.id}-${stageIndex}`}
                                        className="flex flex-col items-center cursor-pointer group"
                                        onClick={() => {
                                          if (
                                            isEditingStage
                                          ) {
                                            setDraftStep(
                                              stageIndex +
                                                1
                                            );
                                          }

                                          toggleRoundsPanel(
                                            candidate.id
                                          );
                                        }}
                                      >
                                        <div
                                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold border-4 border-white shadow-md transition-all group-hover:scale-105 ${
                                            completed
                                              ? "bg-green-600"
                                              : "bg-gray-300"
                                          } ${
                                            isCurrent
                                              ? "ring-2 ring-offset-2 ring-indigo-400"
                                              : ""
                                          }`}
                                        >
                                          {stageIndex +
                                            1}
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
                                  }
                                )
                              ) : (
                                <div className="col-span-full text-center text-sm text-slate-400 py-4">
                                  No hiring stages available.
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* ==================================================
                            INTERVIEW ROUNDS
                        ================================================== */}

                        {isRoundsOpen && (
                          <div className="mt-6 border-t border-slate-100 pt-5">
                            <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
                              <h4 className="text-sm font-semibold text-slate-500 flex items-center gap-2">
                                <ListChecks
                                  size={
                                    15
                                  }
                                  className="text-purple-600"
                                />

                                Interview Rounds

                                <span className="text-xs font-normal text-slate-400">
                                  (
                                  {
                                    roundsForTimeline.length
                                  }
                                  )
                                </span>
                              </h4>

                              <div className="flex items-center gap-2 flex-wrap">
                                {isEditingRounds && (
                                  <button
                                    type="button"
                                    onClick={
                                      handleAddRound
                                    }
                                    className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white px-2.5 py-1 rounded-lg text-xs font-semibold transition"
                                  >
                                    <Plus
                                      size={
                                        14
                                      }
                                    />
                                    Add Round
                                  </button>
                                )}

                                {isEditingRounds ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleSaveRounds(
                                          candidate
                                        )
                                      }
                                      className="flex items-center gap-1.5 text-green-600 hover:bg-green-50 px-2.5 py-1 rounded-lg text-xs font-semibold transition"
                                    >
                                      <Check
                                        size={
                                          14
                                        }
                                      />
                                      Save
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingRoundsId(
                                          null
                                        );
                                        setDraftRounds(
                                          []
                                        );
                                      }}
                                      className="flex items-center gap-1.5 text-slate-500 hover:bg-slate-100 px-2.5 py-1 rounded-lg text-xs font-semibold transition"
                                    >
                                      <X
                                        size={
                                          14
                                        }
                                      />
                                      Cancel
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      startEditingRounds(
                                        candidate
                                      )
                                    }
                                    className="text-slate-400 hover:text-purple-600 hover:bg-purple-50 p-1.5 rounded-lg transition"
                                    title="Manage rounds"
                                  >
                                    <Settings2
                                      size={
                                        16
                                      }
                                    />
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-3">
                              {roundsForTimeline.map(
                                (
                                  round,
                                  roundIndex
                                ) =>
                                  isEditingRounds ? (
                                    <div
                                      key={
                                        round.id
                                      }
                                      className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5"
                                    >
                                      <span className="text-xs font-bold text-purple-600 shrink-0">
                                        R
                                        {roundIndex +
                                          1}
                                      </span>

                                      <input
                                        type="text"
                                        value={
                                          round.label
                                        }
                                        onChange={(
                                          event
                                        ) =>
                                          handleRoundLabelChange(
                                            round.id,
                                            event
                                              .target
                                              .value
                                          )
                                        }
                                        placeholder="e.g. Technical Round"
                                        className="flex-1 min-w-0 bg-white text-sm font-medium text-slate-700 outline-none border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 rounded-md px-2 py-1 transition"
                                      />

                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleDeleteRound(
                                            round.id
                                          )
                                        }
                                        className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded transition shrink-0"
                                        title="Delete round"
                                      >
                                        <Trash2
                                          size={
                                            14
                                          }
                                        />
                                      </button>
                                    </div>
                                  ) : (
                                    <div
                                      key={
                                        round.id
                                      }
                                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3"
                                    >
                                      <span className="text-xs font-bold text-purple-600">
                                        Round{" "}
                                        {roundIndex +
                                          1}
                                      </span>

                                      <p className="text-sm font-medium text-slate-700 mt-0.5">
                                        {round.label ||
                                          "Interviewer not set"}
                                      </p>
                                    </div>
                                  )
                              )}

                              {roundsForTimeline.length ===
                                0 && (
                                <p className="col-span-2 text-sm text-slate-400 italic">
                                  No interview rounds recorded yet.
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* ==================================================
                            CURRENT STAGE
                        ================================================== */}

                        <div className="mt-6 flex items-center gap-2 rounded-xl px-5 py-3 bg-green-50 border border-green-100">
                          <CheckCircle2
                            size={
                              16
                            }
                            className="text-green-600 shrink-0"
                          />

                          <span className="text-sm font-bold text-green-700">
                            Current Stage:
                          </span>

                          <span className="text-sm text-green-700">
                            {
                              currentStageLabel
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}

              {/* ==================================================
                  EMPTY
              ================================================== */}

              {filteredCandidates.length ===
                0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 py-20 text-center">
                  <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <Users
                      size={
                        24
                      }
                      className="text-slate-400"
                    />
                  </div>

                  <h2 className="text-2xl font-bold text-slate-700">
                    No Candidate Found
                  </h2>

                  <p className="text-slate-500 mt-2">
                    Try changing the
                    search or timing
                    filter.
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