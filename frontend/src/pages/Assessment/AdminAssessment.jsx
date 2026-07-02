import React, { useEffect, useState } from "react";
import Sidebar from "../../components/sideBar/sideBar";
import Navbar from "../../components/navBar/navBar.jsx";
import { ChevronDown } from "lucide-react";

function AdminAssessment() {
  const [questions, setQuestions] = useState([]);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("");

  const getQuestions = async () => {
    try {
      const response = await fetch('http://localhost:5000/hireRadar/testquestions');
      const jsonData = await response.json();
      setQuestions(jsonData);
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    getQuestions();
  }, []);

  async function insertQuestions(form) {
    try {
      const body = {
        'dept': form.department,
        'category': form.category,
        'question': form.question,
        'option1': form.option1,
        'option2': form.option2,
        'option3': form.option3,
        'option4': form.option4,
        'answer': form.answer
      };
      await fetch('http://localhost:5000/hireRadar/insertQuestions', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
    } catch (err) {
      console.error(err.message);
    }
  }

  const [form, setForm] = useState({
    department: "",
    category: "",
    question: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    answer: "",
  });

  const departmentsList = [
    "Software Development",
    "Design Engineering",
    "Automation",
    "Quality Assurance",
    "Mechanical",
    "Human Resources",
    "Production"
  ];

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const addQuestion = async () => {
    if (
      !form.department ||
      !form.category ||
      !form.question ||
      !form.option1 ||
      !form.option2 ||
      !form.option3 ||
      !form.option4 ||
      !form.answer
    ) {
      alert("Please fill all fields.");
      return;
    }

    // Await ensures database save operation completes before fetching
    await insertQuestions(form);
    await getQuestions();

    setForm({
      department: "",
      category: "",
      question: "",
      option1: "",
      option2: "",
      option3: "",
      option4: "",
      answer: "",
    });
  };

  const deleteQuestion = async (qno) => {
    try {
      const response = await fetch(`http://localhost:5000/hireRadar/deleteQuestion/${String(qno)}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Delete request failed');
      }

      // Automatically refresh UI state lists following database removal
      await getQuestions();
    } catch (err) {
      console.error(err.message);
    }
  };

  const filteredQuestions = selectedDeptFilter
    ? questions.filter((q) => q.dept.toLowerCase() === selectedDeptFilter.toLowerCase())
    : questions;

  return (
    <div className="flex bg-gray-100 h-screen w-screen flex-col overflow-hidden">
      <Navbar />

      <div className="flex flex-1 min-h-0">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full min-w-0">

        {/* STATIC HEADER AREA */}
        <div className="p-8 pb-4 bg-gray-100 border-b border-gray-200/50 shrink-0">
          <h1 className="text-4xl font-bold text-gray-900">
            Assessment Management
          </h1>
          <p className="mt-2 text-gray-600">
            Create and manage technical assessment questions.
          </p>
        </div>

        {/* SCROLLABLE CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-8 pt-4 custom-scrollbar">
          
          {/* Form Container Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-700 mb-6">
              Add New Question
            </h2> 

            {/* Department & Category Selectors */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Department */}
              <div>
                <label className="font-semibold text-gray-700 text-sm">Department</label>
                <div className="relative mt-2">
                  <select
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    className="w-full appearance-none pl-4 pr-10 py-3 border border-gray-300 rounded-xl bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer transition duration-150"
                  >
                    <option value="" className="text-gray-400 font-normal">Select Department</option>
                    {departmentsList.map((dept) => (
                      <option key={dept} value={dept} className="text-gray-900 font-normal">{dept}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                    <ChevronDown size={18} strokeWidth={2.5} />
                  </div>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="font-semibold text-gray-700 text-sm">Question Category</label>
                <div className="relative mt-2">
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full appearance-none pl-4 pr-10 py-3 border border-gray-300 rounded-xl bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer transition duration-150"
                  >
                    <option value="" className="text-gray-400 font-normal">Select Category</option>
                    <option className="text-gray-900 font-normal">Aptitude</option>
                    <option className="text-gray-900 font-normal">Reasoning</option>
                    <option className="text-gray-900 font-normal">Technical</option>
                    <option className="text-gray-900 font-normal">Verbal Ability</option>
                    <option className="text-gray-900 font-normal">General Knowledge</option>
                    <option className="text-gray-900 font-normal">Coding</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                    <ChevronDown size={18} strokeWidth={2.5} />
                  </div>
                </div>
              </div>
            </div>

            {/* Question Textarea */}
            <div className="mb-6">
              <label className="font-semibold text-gray-700">Question</label>
              <textarea
                rows="4"
                name="question"
                value={form.question}
                onChange={handleChange}
                placeholder="Enter Interview Question"
                className="w-full mt-2 border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            {/* Options Input Grid */}
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="font-semibold text-gray-700">Option A</label>
                <input
                  type="text"
                  name="option1"
                  value={form.option1}
                  onChange={handleChange}
                  className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700">Option B</label>
                <input
                  type="text"
                  name="option2"
                  value={form.option2}
                  onChange={handleChange}
                  className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700">Option C</label>
                <input
                  type="text"
                  name="option3"
                  value={form.option3}
                  onChange={handleChange}
                  className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700">Option D</label>
                <input
                  type="text"
                  name="option4"
                  value={form.option4}
                  onChange={handleChange}
                  className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
            </div>

            {/* Correct Answer Radios */}
            <div className="mt-8">
              <h3 className="font-bold text-lg text-gray-800 mb-4">
                Select Correct Answer
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[form.option1, form.option2, form.option3, form.option4].map(
                  (option, index) => (
                    <label
                      key={index}
                      className="flex items-center gap-3 border border-gray-200 rounded-xl p-4 cursor-pointer hover:bg-purple-50 transition"
                    >
                      <input
                        type="radio"
                        name="answer"
                        value={option}
                        checked={form.answer === option && option !== ""}
                        onChange={handleChange}
                        className="text-purple-600 focus:ring-purple-500 h-4 w-4"
                      />
                      {option || `Option ${String.fromCharCode(65 + index)}`}
                    </label>
                  )
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={addQuestion}
              className="mt-8 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl shadow-lg transition font-semibold"
            >
              + Save Question
            </button>
          </div>

          {/* Saved Question List Area */}
          <div className="mt-10 mb-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-3xl font-bold text-gray-700">
                  Saved Questions
                </h2>
                <div className="border-2 border-purple-600 text-purple-700 px-4 py-1.5 rounded-full font-bold shadow-sm text-sm bg-transparent">
                  {filteredQuestions.length} Questions
                </div>
              </div>

              {/* Enhanced Inline Department Filter Dropdown */}
              <div className="flex items-center gap-3">
                <label htmlFor="deptFilter" className="text-sm font-semibold text-gray-600 whitespace-nowrap">
                  Filter by Department:
                </label>
                <div className="relative min-w-[220px]">
                  <select
                    id="deptFilter"
                    value={selectedDeptFilter}
                    onChange={(e) => setSelectedDeptFilter(e.target.value)}
                    className="w-full appearance-none pl-4 pr-10 py-2.5 border border-gray-300 rounded-xl bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer transition duration-150"
                  >
                    <option value="" className="text-gray-500 font-normal">All Departments</option>
                    {departmentsList.map((dept) => (
                      <option key={dept} value={dept} className="text-gray-900 font-normal">{dept}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                    <ChevronDown size={16} strokeWidth={2.5} />
                  </div>
                </div>
              </div>
            </div>

            {filteredQuestions.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-10 text-center text-gray-500">
                <h3 className="text-2xl font-semibold">No Questions Found</h3>
                <p className="mt-2">
                  {selectedDeptFilter 
                    ? `There are no questions added under the "${selectedDeptFilter}" department yet.`
                    : "Start creating your assessment questions above."}
                </p>
              </div>
            ) : (
              filteredQuestions.map((q, index) => (
                <div
                  key={q.qno}
                  className="bg-white rounded-2xl shadow-lg p-7 mb-6 border-l-8 border-purple-600"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                          Department: {q.dept}
                        </span>
                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">
                          Category: {q.category}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 break-words">
                        Q{index+1}. {q.question}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteQuestion(q.qno)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shrink-0"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3 mt-5">
                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-gray-700">
                      <span className="font-semibold mr-1">A.</span> {q.option1}
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-gray-700">
                      <span className="font-semibold mr-1">B.</span> {q.option2}
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-gray-700">
                      <span className="font-semibold mr-1">C.</span> {q.option3}
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-gray-700">
                      <span className="font-semibold mr-1">D.</span> {q.option4}
                    </div>
                  </div>

                  <div className="mt-4 bg-green-50 border border-green-200 text-green-700 font-semibold rounded-lg p-3 flex items-center gap-1">
                    <span>✔ Correct Answer:</span>
                    <span className="font-normal">{q.answer}</span>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
      </div>
    </div>
  );
}

export default AdminAssessment;
