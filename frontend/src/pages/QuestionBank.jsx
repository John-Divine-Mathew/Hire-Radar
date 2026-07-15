import React, { useEffect, useMemo, useState } from "react";

const departments = [
  "Software Development",
  "HR",
  "Marketing",
  "Finance",
  "Testing",
  "UI UX",
  "Sales",
  "Networking",
];

const difficulties = ["Beginner", "Intermediate", "Advanced"];

const sampleQuestions = [
  {
    id: 1,
    department: "Software Development",
    difficulty: "Beginner",
    question: "What is React?",
    options: [
      "JavaScript Library",
      "Database",
      "Programming Language",
      "Operating System",
    ],
    answer: "JavaScript Library",
  },
  {
    id: 2,
    department: "Software Development",
    difficulty: "Intermediate",
    question: "Which hook is used for state management?",
    options: ["useState", "useFetch", "useApi", "useRoute"],
    answer: "useState",
  },
  {
    id: 3,
    department: "HR",
    difficulty: "Beginner",
    question: "What does HR stand for?",
    options: [
      "Human Resource",
      "High Recruitment",
      "Hiring Room",
      "Human Report",
    ],
    answer: "Human Resource",
  },
  {
    id: 4,
    department: "Finance",
    difficulty: "Advanced",
    question: "Which statement shows company profit?",
    options: [
      "Income Statement",
      "Balance Sheet",
      "Cash Flow",
      "Ledger",
    ],
    answer: "Income Statement",
  },
];

export default function QuestionBank() {
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("Newest");

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    setTimeout(() => {
      setQuestions(sampleQuestions);
      setLoading(false);
    }, 1200);
  }, []);

  const openDepartment = (department) => {
    setSelectedDepartment(department);
    setShowModal(true);
  };

  const chooseDifficulty = (difficulty) => {
    setSelectedDifficulty(difficulty);
    setShowModal(false);
  };

  const filteredQuestions = useMemo(() => {
    let data = [...questions];

    if (selectedDepartment) {
      data = data.filter(
        (q) => q.department === selectedDepartment
      );
    }

    if (selectedDifficulty) {
      data = data.filter(
        (q) => q.difficulty === selectedDifficulty
      );
    }

    if (search.trim()) {
      data = data.filter((q) =>
        q.question.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (sortBy === "Alphabetical") {
      data.sort((a, b) =>
        a.question.localeCompare(b.question)
      );
    }

    if (sortBy === "Newest") {
      data.sort((a, b) => b.id - a.id);
    }

    if (sortBy === "Oldest") {
      data.sort((a, b) => a.id - b.id);
    }

    return data;
  }, [
    questions,
    selectedDepartment,
    selectedDifficulty,
    search,
    sortBy,
  ]);

  const deleteQuestion = (id) => {
    setQuestions((prev) =>
      prev.filter((q) => q.id !== id)
    );
  };

  const startEdit = (question) => {
    setEditingId(question.id);
    setEditData(question);
  };

  const saveQuestion = () => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === editingId ? editData : q
      )
    );

    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      {/* Header */}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col lg:flex-row justify-between gap-6 items-start lg:items-center">

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Question Bank
          </h1>

          <p className="text-gray-500 mt-2">
            Manage, organize and update assessment
            questions for every department.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">

          <button className="px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition">
            Add Question
          </button>

          <button className="px-6 py-3 rounded-xl border hover:bg-gray-50 transition">
            Import Excel
          </button>

          <button className="px-6 py-3 rounded-xl border hover:bg-gray-50 transition">
            Export Excel
          </button>

        </div>

      </div>

      {/* Department Cards */}

      <div className="grid xl:grid-cols-4 md:grid-cols-2 gap-6 mt-8">

        {departments.map((department) => (

          <div
            key={department}
            onClick={() => openDepartment(department)}
            className="bg-white rounded-2xl border border-gray-200 p-6 cursor-pointer hover:border-blue-500 hover:-translate-y-1 hover:shadow-lg transition duration-300"
          >

            <h2 className="font-semibold text-lg">
              {department}
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              Click to manage questions
            </p>

          </div>

        ))}

      </div>

      {/* Difficulty Modal */}

      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">

          <div className="bg-white rounded-2xl p-8 w-[420px] animate-fade">

            <h2 className="text-2xl font-bold">
              Select Difficulty Level
            </h2>

            <p className="text-gray-500 mt-2 mb-6">
              Choose which level of questions you want
              to manage.
            </p>

            <div className="space-y-3">

              {difficulties.map((level) => (

                <button
                  key={level}
                  onClick={() => chooseDifficulty(level)}
                  className="w-full py-4 rounded-xl border hover:bg-blue-600 hover:text-white transition"
                >
                  {level}
                </button>

              ))}

            </div>

          </div>

        </div>
      )}

      {/* Search */}

      <div className="bg-white mt-8 rounded-2xl border border-gray-200 p-6 flex flex-col md:flex-row gap-4 justify-between">

        <input
          placeholder="Search questions..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="border rounded-xl px-4 py-3 flex-1 outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value)
          }
          className="border rounded-xl px-4 py-3"
        >
          <option>Newest</option>
          <option>Oldest</option>
          <option>Alphabetical</option>
        </select>

      </div>    
            {/* Question List */}

      <div className="mt-8">

        {loading ? (

          <div className="grid gap-6">

            {[1, 2, 3, 4].map((item) => (

              <div
                key={item}
                className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse"
              >

                <div className="h-5 w-40 bg-gray-200 rounded mb-4"></div>

                <div className="h-4 w-64 bg-gray-200 rounded mb-2"></div>

                <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>

                <div className="h-4 w-5/6 bg-gray-200 rounded mb-6"></div>

                <div className="space-y-3">

                  {[1, 2, 3, 4].map((option) => (

                    <div
                      key={option}
                      className="h-12 rounded-xl bg-gray-200"
                    ></div>

                  ))}

                </div>

              </div>

            ))}

          </div>

        ) : filteredQuestions.length === 0 ? (

          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">

            <h2 className="text-2xl font-semibold text-gray-700">
              No Questions Found
            </h2>

            <p className="text-gray-500 mt-3">
              Select another department or import questions.
            </p>

          </div>

        ) : (

          <div className="grid gap-6">

            {filteredQuestions.map((question, index) => (

              <div
                key={question.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 p-6"
              >

                {editingId === question.id ? (

                  <div className="space-y-5">

                    <input
                      value={editData.question}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          question: e.target.value,
                        })
                      }
                      className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {editData.options.map((option, i) => (

                      <input
                        key={i}
                        value={option}
                        onChange={(e) => {
                          const updated = [...editData.options];
                          updated[i] = e.target.value;

                          setEditData({
                            ...editData,
                            options: updated,
                          });
                        }}
                        className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                      />

                    ))}

                    <select
                      value={editData.answer}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          answer: e.target.value,
                        })
                      }
                      className="w-full border rounded-xl px-4 py-3"
                    >

                      {editData.options.map((option, i) => (

                        <option key={i}>
                          {option}
                        </option>

                      ))}

                    </select>

                    <div className="flex gap-3 pt-2">

                      <button
                        onClick={saveQuestion}
                        className="px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
                      >
                        Save
                      </button>

                      <button
                        onClick={() => setEditingId(null)}
                        className="px-6 py-3 rounded-xl border hover:bg-gray-100 transition"
                      >
                        Cancel
                      </button>

                    </div>

                  </div>

                ) : (

                  <>

                    <div className="flex flex-col lg:flex-row justify-between gap-5">

                      <div>

                        <div className="flex flex-wrap gap-3 mb-4">

                          <span className="px-4 py-1 rounded-full bg-gray-100 text-sm font-medium">
                            Question {index + 1}
                          </span>

                          <span className="px-4 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                            {question.department}
                          </span>

                          <span className="px-4 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-medium">
                            {question.difficulty}
                          </span>

                        </div>

                        <h2 className="text-lg font-semibold text-gray-800 mb-6">
                          {question.question}
                        </h2>

                      </div>

                      <div className="flex gap-3">

                        <button
                          onClick={() => startEdit(question)}
                          className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            deleteQuestion(question.id)
                          }
                          className="px-5 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition"
                        >
                          Delete
                        </button>

                      </div>

                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mt-4">

                      {question.options.map((option, optionIndex) => (

                        <div
                          key={optionIndex}
                          className={`rounded-xl border p-4 transition ${
                            option === question.answer
                              ? "bg-green-100 border-green-500 font-semibold text-green-700"
                              : "border-gray-200 bg-gray-50"
                          }`}
                        >

                          <div className="flex gap-3">

                            <span className="font-bold">
                              {String.fromCharCode(
                                65 + optionIndex
                              )}
                            </span>

                            <span>{option}</span>

                          </div>

                        </div>

                      ))}

                    </div>

                  </>

                )}

              </div>

            ))}

          </div>

        )}

      </div>

    </div>

  );

}