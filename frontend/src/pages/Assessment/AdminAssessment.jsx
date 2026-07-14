import React, { useEffect, useState } from "react"; 
import Sidebar from "../../components/sideBar/sideBar";
import Navbar from "../../components/navBar/navBar.jsx";
import {ChevronDown,Upload,FileSpreadsheet} from "lucide-react";
import * as XLSX from "xlsx";
function AdminAssessment() {

  const [questions, setQuestions] = useState([]);

  const [selectedDeptFilter, setSelectedDeptFilter] = useState("");

  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

    dept: String(
        form.department ||
        form.dept ||
        form.Department ||
        ""
    ).trim(),

    category: String(
        form.category ||
        form.Category ||
        ""
    ).trim(),

    question: String(
        form.question ||
        form.Question ||
        form["Question "] ||
        ""
    ).trim(),

    option1: String(
        form.option1 ||
        form.OptionA ||
        ""
    ).trim(),

    option2: String(
        form.option2 ||
        form.OptionB ||
        ""
    ).trim(),

    option3: String(
        form.option3 ||
        form.OptionC ||
        form["OptionC "] ||
        ""
    ).trim(),

    option4: String(
        form.option4 ||
        form.OptionD ||
        form["OptionD "] ||
        ""
    ).trim(),

    answer: String(
        form.answer ||
        form.Answer ||
        ""
    ).trim()

};

      await fetch("http://localhost:5000/hireRadar/insertQuestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
    } catch (err) {
      console.log(err.message);
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

      await getQuestions();
    } catch (err) {
      console.error(err.message);
    }
  };

  // Excel Upload Handler Function
  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        // Parse rows as JSON matching DB column names
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          alert("The uploaded excel sheet is empty!");
          setUploading(false);
          return;
        }

        // Loop and upload each row asynchronously
        for (const row of data) {
          await insertQuestions(row);
        }

        alert("All questions uploaded successfully!");
        await getQuestions(); // Refresh live view
      } catch (error) {
        console.error("Error reading or processing excel template: ", error);
        alert("Failed to process file. Make sure columns match data attributes perfectly.");
      } finally {
        setUploading(false);
        e.target.value = ""; // Clear file selector target memory
      }
    };

    reader.readAsBinaryString(file);
  };

  // Combined real-time filter logic for both Department Dropdown and Text Search input
  const filteredQuestions = questions.filter((q) => {
    const matchesDept = selectedDeptFilter 
      ? q.dept.toLowerCase() === selectedDeptFilter.toLowerCase() 
      : true;
      
    const matchesSearch = searchQuery.trim() 
      ? q.question.toLowerCase().includes(searchQuery.toLowerCase().trim()) 
      : true;

    return matchesDept && matchesSearch;
  });

  return (
    <div className="flex bg-gray-100 h-screen w-screen flex-col overflow-hidden">
      <Navbar />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <div className="flex-1 flex flex-col h-full min-w-0">

          {/* STATIC HEADER AREA */}
         <div className="p-8 pb-4 bg-gray-100 border-b border-gray-200/50 shrink-0">

<div className="flex justify-between items-center">

<div>


<h1 className="text-4xl font-bold text-gray-900">

Assessment Management

</h1>

<p className="mt-2 text-gray-600">

Create and manage technical assessment questions.

</p>

</div>

<div className="flex gap-4">

<button

className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 transition"

>

+

Add Question

</button>

<label

className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 transition"

>

<FileSpreadsheet size={20}/>

{

uploading

?

"Uploading..."

:

"Import Excel"

}

<input

type="file"

accept=".xlsx,.xls"

hidden

onChange={handleExcelUpload}

/>

</label>

</div>

</div>

</div>

          {/* SCROLLABLE CONTENT AREA */}
          <div className="flex-1 overflow-y-auto p-8 pt-4 custom-scrollbar">
            
            {/* Form Container Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-700 mb-6">Add New Question</h2>
              
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
                      className="w-full appearance-none pl-4 pr-10 py-3 border border-gray-200 rounded-xl bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer transition duration-150"
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
                      className="w-full appearance-none pl-4 pr-10 py-3 border border-gray-300 rounded-2xl bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer transition duration-150"
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
                <h3 className="font-bold text-lg text-gray-800 mb-4">Select Correct Answer</h3>
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
                className="mt-8 bg-green-600 hover:scale-105 transition-all text-white px-8 py-3 rounded-xl shadow-lg transition font-semibold"
              >
                + Save Question
              </button>
            </div>

            {/* Saved Question List Area */}
            <div className="mt-10 mb-6">
              <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-4 mb-6">
                <div className="flex items-center gap-4 shrink-0">
                  <h2 className="text-3xl font-bold text-gray-700">Saved Questions</h2>
                  <div className="border-2 border-purple-600 text-purple-700 px-4 py-1.5 rounded-full font-bold shadow-sm text-sm bg-transparent">
                    {filteredQuestions.length} Questions
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 flex-1 justify-end">
                  {/* Controlled Text Search Input box */}
                  <div className="relative w-full max-w-sm">
                    <input
                      type="text"
                      placeholder="Search Question..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full border border-gray-200 rounded-2xl px-5 py-2.5 outline-none focus:ring-2 focus:ring-purple-600 text-sm"
                    />
                  </div>

                  {/* Inline Department Filter Dropdown */}
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
              </div>

              {filteredQuestions.length === 0 ? (
                <div className="bg-white rounded-xl shadow p-10 text-center text-gray-500">
                  <h3 className="text-2xl font-semibold">No Questions Found</h3>
                  <p className="mt-2">
                    {selectedDeptFilter || searchQuery 
                      ? "Try adjusting your department filters or type a different query keyword string."
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
                          Q{index + 1}. {q.question}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteQuestion(q.qno)}
                        className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl shadow-lg shrink-0 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3 mt-5">
                      <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-gray-700 text-sm">
                        <span className="font-semibold mr-1">A.</span> {q.option1}
                      </div>
                      <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-gray-700 text-sm">
                        <span className="font-semibold mr-1">B.</span> {q.option2}
                      </div>
                      <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-gray-700 text-sm">
                        <span className="font-semibold mr-1">C.</span> {q.option3}
                      </div>
                      <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-gray-700 text-sm">
                        <span className="font-semibold mr-1">D.</span> {q.option4}
                      </div>
                    </div>

                    <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-700 font-semibold rounded-lg p-3 flex items-center gap-1 text-sm">
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