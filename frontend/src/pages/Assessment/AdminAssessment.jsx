import React, { useEffect, useState } from "react"; 
import Sidebar from "../../components/sideBar/sideBar";
import Navbar from "../../components/navBar/navBar.jsx";
import { ChevronDown, FileSpreadsheet, Trash2, Pencil, Search, X, Check } from "lucide-react";
import * as XLSX from "xlsx";

function AdminAssessment() {
  const [questions, setQuestions] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Inline editing state fields
  const [editingQno, setEditingQno] = useState(null);
  const [editForm, setEditForm] = useState({
    dept: "",
    category: "",
    questiontype: "",
    question: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    answer: ""
  });

  // State for active filter selection parameters
  const [filterValues, setFilterValues] = useState({
    department: "",
    category: "",
    type: ""
  });

  // State to manage form expand/collapse toggle
  const [isFormOpen, setIsFormOpen] = useState(false);

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
        dept: String(form.department || form.dept || form.Department || "").trim(),
        category: String(form.category || form.Category || "").trim(),
        questiontype: String(form.questiontype || form.type || form.Type || form.questionType || "").trim(),
        question: String(form.question || form.Question || form["Question "] || "").trim(),
        option1: String(form.option1 || form.OptionA || "").trim(),
        option2: String(form.option2 || form.OptionB || "").trim(),
        option3: String(form.option3 || form.OptionC || form["OptionC "] || "").trim(),
        option4: String(form.option4 || form.OptionD || form["OptionD "] || "").trim(),
        answer: String(form.answer || form.Answer || "").trim()
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
    type: "",
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

  const categoriesList = [
    "Aptitude",
    "Reasoning",
    "Technical",
    "Verbal Ability",
    "General Knowledge",
    "Coding"
  ];

  const questionTypesList = [
    "beginner",
    "intermediate",
    "advanced"
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
      !form.type ||
      !form.question ||
      !form.option1 ||
      !form.option2 ||
      !form.option3 ||
      !form.option4 ||
      !form.answer
    ) {
      alert("Please fill all fields. Department and Question Type are mandatory.");
      return;
    }

    await insertQuestions(form);
    await getQuestions();
    setForm({
      department: "",
      category: "",
      type: "",
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

  const handleEditClick = (q) => {
    setEditingQno(q.qno);
    setEditForm({
      dept: q.dept || "",
      category: q.category || "",
      questiontype: q.questiontype || q.type || "",
      question: q.question || "",
      option1: q.option1 || "",
      option2: q.option2 || "",
      option3: q.option3 || "",
      option4: q.option4 || "",
      answer: q.answer || ""
    });
  };

  const handleEditFormChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const saveEditedQuestion = async (qno) => {
    try {
      const updatedPayload = {
        qno: qno,
        dept: editForm.dept.trim(),
        category: editForm.category.trim(),
        questiontype: editForm.questiontype.trim(),
        question: editForm.question.trim(),
        option1: editForm.option1.trim(),
        option2: editForm.option2.trim(),
        option3: editForm.option3.trim(),
        option4: editForm.option4.trim(),
        answer: editForm.answer.trim()
      };


      const response = await fetch(`http://localhost:5000/hireRadar/updateQuestion/${qno}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPayload)
      });
      const jsonData = await response.json();

      console.log("Saving all newly updated question values inside object payload:", jsonData);

      setEditingQno(null);
      await getQuestions();
    } catch (err) {
      console.error("Error occurred while saving question rows:", err.message);
    }
  };

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
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          alert("The uploaded excel sheet is empty!");
          setUploading(false);
          return;
        }

        for (const row of data) {
          await insertQuestions(row);
        }

        alert("All questions uploaded successfully!");
        await getQuestions();
      } catch (error) {
        console.error("Error reading or processing excel template: ", error);
        alert("Failed to process file. Make sure columns match data attributes perfectly.");
      } finally {
        setUploading(false);
        e.target.value = "";
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleClearAllFilters = () => {
    setFilterValues({
      department: "",
      category: "",
      type: ""
    });
    setSearchQuery("");
  };

  // Determine if any filters are active
  const isAnyFilterActive = 
    searchQuery.trim() !== "" || 
    filterValues.department !== "" || 
    filterValues.category !== "" || 
    filterValues.type !== "";

  const filteredQuestions = questions.filter((q) => {
    // Check text search matching
    const matchesSearch = searchQuery.trim() 
      ? q.question?.toLowerCase().includes(searchQuery.toLowerCase().trim()) 
      : true;

    if (!matchesSearch) return false;

    // Check Department constraint if set
    if (filterValues.department) {
      if (q.dept?.toLowerCase() !== filterValues.department.toLowerCase()) return false;
    }

    // Check Category constraint if set
    if (filterValues.category) {
      if (q.category?.toLowerCase() !== filterValues.category.toLowerCase()) return false;
    }

    // Check Question Type constraint if set
    if (filterValues.type) {
      const checkType = q.questiontype || q.type || "";
      if (checkType.toLowerCase() !== filterValues.type.toLowerCase()) return false;
    }

    return true;
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
                <h1 className="text-4xl font-bold text-gray-900">Assessment Management</h1>
                <p className="mt-2 text-gray-600">Create and manage technical assessment questions.</p>
              </div>
              <div className="flex gap-4">
                <label className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 transition">
                  <FileSpreadsheet size={20}/>
                  {uploading ? "Uploading..." : "Import Excel"}
                  <input type="file" accept=".xlsx,.xls" hidden onChange={handleExcelUpload} />
                </label>
              </div>
            </div>
          </div>

          {/* SCROLLABLE CONTENT AREA */}
          <div className="flex-1 overflow-y-auto p-8 pt-4 custom-scrollbar">
            
            {/* Form Container Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300">
              
              {/* Entire Clickable Top Part */}
              <button
                type="button"
                onClick={() => setIsFormOpen(!isFormOpen)}
                className="flex items-center justify-between w-full text-left p-8 group outline-none hover:bg-slate-50/50 transition duration-150"
              >
                <h2 className="text-2xl font-bold text-gray-700 group-hover:text-purple-700 transition duration-150">
                  Add New Question
                </h2>
                <div className={`text-gray-400 group-hover:text-purple-600 transition-transform duration-300 transform ${isFormOpen ? "rotate-180" : "rotate-0"}`}>
                  <ChevronDown size={28} strokeWidth={2.5} />
                </div>
              </button>
              
              {/* Conditional Expandable Content Box */}
              {isFormOpen && (
                <div className="p-8 pt-0 border-t border-gray-100 transition-all duration-300">
                  <div className="mt-6">
                    {/* Department, Category & Type Dropdowns */}
                    <div className="grid md:grid-cols-3 gap-6 mb-6">
                      {/* Department */}
                      <div>
                        <label className="font-semibold text-gray-700 text-sm">Department *</label>
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
                            {categoriesList.map((cat) => (
                              <option key={cat} value={cat} className="text-gray-900 font-normal">{cat}</option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                            <ChevronDown size={18} strokeWidth={2.5} />
                          </div>
                        </div>
                      </div>

                      {/* Question Type */}
                      <div>
                        <label className="font-semibold text-gray-700 text-sm">Question Type *</label>
                        <div className="relative mt-2">
                          <select
                            name="type"
                            value={form.type}
                            onChange={handleChange}
                            className="w-full appearance-none pl-4 pr-10 py-3 border border-gray-300 rounded-2xl bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer transition duration-150"
                          >
                            <option value="" className="text-gray-400 font-normal">Select Question Type</option>
                            {questionTypesList.map((t) => (
                              <option key={t} value={t} className="text-gray-900 font-normal capitalize">{t}</option>
                            ))}
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
                      className="mt-8 bg-green-600 hover:scale-105 transition-all text-white px-8 py-3 rounded-xl shadow-lg font-semibold"
                    >
                      + Save Question
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Saved Question List Area */}
            <div className="mt-10 mb-6">
              <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-4 mb-6">
                <div className="flex items-center gap-4 shrink-0">
                  <h2 className="text-3xl font-bold text-gray-700">Saved Questions</h2>
                  <div className="border-2 border-purple-600 text-purple-700 px-4 py-1.5 rounded-full font-bold shadow-sm text-sm bg-transparent">
                    {filteredQuestions.length} Questions
                  </div>

                  {/* Expanding Text Search Input bar */}
                  <div className="flex group relative h-10 w-10 overflow-hidden rounded-lg border border-transparent bg-gray-100 hover:bg-white focus-within:bg-white transition-colors duration-150 hover:w-48 md:hover:w-64 hover:border-gray-200 focus-within:w-48 md:focus-within:w-64 focus-within:border-gray-200 focus-within:hover:border-gray-200">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black pointer-events-none">
                      <Search className="h-5 w-5 text-current" />
                    </span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search Question..."
                      className="h-full w-full rounded-lg bg-transparent pl-10 pr-4 text-sm opacity-0 outline-none transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 text-black placeholder-black/50 font-medium"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 flex-1 justify-end">
                  {/* Filter Row Workspace */}
                  <div className="flex items-center gap-3 flex-wrap w-full xl:w-auto">
                    <label className="text-sm font-semibold text-gray-600 whitespace-nowrap">
                      Filters:
                    </label>
                    
                    {/* Department Dropdown */}
                    <div className="relative min-w-[160px]">
                      <select
                        value={filterValues.department}
                        onChange={(e) => setFilterValues({ ...filterValues, department: e.target.value })}
                        className="w-full appearance-none pl-4 pr-10 py-2.5 border border-gray-300 rounded-xl bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer transition duration-150 shadow-sm"
                      >
                        <option value="">All Departments</option>
                        {departmentsList.map((dept) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                        <ChevronDown size={16} strokeWidth={2.5} />
                      </div>
                    </div>

                    {/* Category Dropdown */}
                    <div className="relative min-w-[160px]">
                      <select
                        value={filterValues.category}
                        onChange={(e) => setFilterValues({ ...filterValues, category: e.target.value })}
                        className="w-full appearance-none pl-4 pr-10 py-2.5 border border-gray-300 rounded-xl bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer transition duration-150 shadow-sm"
                      >
                        <option value="">All Categories</option>
                        {categoriesList.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                        <ChevronDown size={16} strokeWidth={2.5} />
                      </div>
                    </div>

                    {/* Type Dropdown */}
                    <div className="relative min-w-[160px]">
                      <select
                        value={filterValues.type}
                        onChange={(e) => setFilterValues({ ...filterValues, type: e.target.value })}
                        className="w-full appearance-none pl-4 pr-10 py-2.5 border border-gray-300 rounded-xl bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer transition duration-150 shadow-sm"
                      >
                        <option value="">All Types</option>
                        {questionTypesList.map((t) => (
                          <option key={t} value={t} className="capitalize">{t}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                        <ChevronDown size={16} strokeWidth={2.5} />
                      </div>
                    </div>

                    {/* Rightmost Conditional Clear Filters Button */}
                    {isAnyFilterActive && (
                      <button
                        type="button"
                        onClick={handleClearAllFilters}
                        className="flex items-center gap-1.5 pl-4 pr-4 py-2.5 border border-red-200 rounded-xl bg-red-50 hover:bg-red-100 text-sm font-medium text-red-600 cursor-pointer transition duration-150 shadow-sm ml-auto"
                      >
                        <X size={16} strokeWidth={2.5} />
                        Clear Filters
                      </button>
                    )}

                  </div>
                </div>
              </div>

              {filteredQuestions.length === 0 ? (
                <div className="bg-white rounded-xl shadow p-10 text-center text-gray-500">
                  <h3 className="text-2xl font-semibold">No Questions Found</h3>
                  <p className="mt-2">
                    {searchQuery || filterValues.department || filterValues.category || filterValues.type
                      ? "Try adjusting your filters or type a different query keyword string."
                      : "Start creating your assessment questions above."}
                  </p>
                </div>
              ) : (
                filteredQuestions.map((q, index) => {
                  const isCurrentlyEditing = editingQno === q.qno;

                  return (
                    <div
                      key={q.qno}
                      className={`bg-white rounded-2xl shadow-lg p-7 mb-6 border-l-8 transition-colors duration-200 ${
                        isCurrentlyEditing ? "border-gray-300" : "border-purple-600"
                      } animate-[fadeIn_0.2s_ease-out]`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          {isCurrentlyEditing ? (
                            /* EDIT MODE DROPDOWNS ROW */
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              {/* Dept Selector */}
                              <div className="relative">
                                <select
                                  name="dept"
                                  value={editForm.dept}
                                  onChange={handleEditFormChange}
                                  className="w-full appearance-none pl-3 pr-8 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 bg-white focus:outline-none"
                                >
                                  <option value="">Select Department</option>
                                  {departmentsList.map((dept) => (
                                    <option key={dept} value={dept}>{dept}</option>
                                  ))}
                                </select>
                                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                              </div>

                              {/* Category Selector */}
                              <div className="relative">
                                <select
                                  name="category"
                                  value={editForm.category}
                                  onChange={handleEditFormChange}
                                  className="w-full appearance-none pl-3 pr-8 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 bg-white focus:outline-none"
                                >
                                  <option value="">Select Category</option>
                                  {categoriesList.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                  ))}
                                </select>
                                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                              </div>

                              {/* Type Selector */}
                              <div className="relative">
                                <select
                                  name="questiontype"
                                  value={editForm.questiontype}
                                  onChange={handleEditFormChange}
                                  className="w-full appearance-none pl-3 pr-8 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 bg-white focus:outline-none capitalize"
                                >
                                  <option value="">Select Type</option>
                                  {questionTypesList.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                  ))}
                                </select>
                                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                              </div>
                            </div>
                          ) : (
                            /* READ MODE CHIPS LAYOUT */
                            <div className="flex flex-wrap gap-2 mb-3">
                              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                                Department: {q.dept}
                              </span>
                              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">
                                Category: {q.category}
                              </span>
                              {(q.questiontype || q.type) && (
                                <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-semibold capitalize">
                                  Type: {q.questiontype || q.type}
                                </span>
                              )}
                            </div>
                          )}

                          {/* QUESTION AREA */}
                          {isCurrentlyEditing ? (
                            <div className="flex gap-2 items-start mt-2">
                              <span className="text-xl font-bold text-gray-800 pt-1">Q{index + 1}.</span>
                              <textarea
                                name="question"
                                rows="2"
                                value={editForm.question}
                                onChange={handleEditFormChange}
                                className="w-full border border-gray-300 rounded-xl p-2 font-medium text-gray-800 outline-none focus:ring-2 focus:ring-purple-500"
                              />
                            </div>
                          ) : (
                            <h3 className="text-xl font-bold text-gray-800 break-words">
                              Q{index + 1}. {q.question}
                            </h3>
                          )}
                        </div>

                        {/* ROW ACTIONS COLUMN */}
                        <div className="flex items-center gap-1 shrink-0">
                          {isCurrentlyEditing ? (
                            <>
                              {/* SAVE BUTTON */}
                              <button
                                type="button"
                                onClick={() => saveEditedQuestion(q.qno)}
                                className="text-white bg-green-600 hover:bg-green-700 transition duration-150 p-2 rounded-lg"
                                title="Save Changes"
                              >
                                <Check size={18} />
                              </button>
                              {/* CANCEL EDIT BUTTON */}
                              <button
                                type="button"
                                onClick={() => setEditingQno(null)}
                                className="text-gray-400 hover:text-gray-600 transition duration-150 p-2 rounded-lg hover:bg-gray-100"
                                title="Cancel Edit"
                              >
                                <X size={18} />
                              </button>
                            </>
                          ) : (
                            <>
                              {/* EDIT PENCIL BUTTON */}
                              <button
                                type="button"
                                onClick={() => handleEditClick(q)}
                                className="text-gray-400 hover:text-purple-600 transition duration-150 p-2 rounded-lg hover:bg-gray-100"
                                title="Edit Question"
                              >
                                <Pencil size={18} />
                              </button>
                              {/* DELETE TRASH BUTTON */}
                              <button
                                type="button"
                                onClick={() => deleteQuestion(q.qno)}
                                className="text-gray-400 hover:text-red-600 transition duration-150 p-2 rounded-lg hover:bg-gray-100"
                                title="Delete Question"
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* OPTIONS ROW GRID */}
                      <div className="grid md:grid-cols-2 gap-3 mt-5">
                        {/* OPTION A */}
                        <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-gray-700 text-sm flex items-center gap-2">
                          <span className="font-semibold text-gray-800">A.</span>
                          {isCurrentlyEditing ? (
                            <input
                              type="text"
                              name="option1"
                              value={editForm.option1}
                              onChange={handleEditFormChange}
                              className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm outline-none"
                            />
                          ) : (
                            <span>{q.option1}</span>
                          )}
                        </div>

                        {/* OPTION B */}
                        <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-gray-700 text-sm flex items-center gap-2">
                          <span className="font-semibold text-gray-800">B.</span>
                          {isCurrentlyEditing ? (
                            <input
                              type="text"
                              name="option2"
                              value={editForm.option2}
                              onChange={handleEditFormChange}
                              className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm outline-none"
                            />
                          ) : (
                            <span>{q.option2}</span>
                          )}
                        </div>

                        {/* OPTION C */}
                        <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-gray-700 text-sm flex items-center gap-2">
                          <span className="font-semibold text-gray-800">C.</span>
                          {isCurrentlyEditing ? (
                            <input
                              type="text"
                              name="option3"
                              value={editForm.option3}
                              onChange={handleEditFormChange}
                              className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm outline-none"
                            />
                          ) : (
                            <span>{q.option3}</span>
                          )}
                        </div>

                        {/* OPTION D */}
                        <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-gray-700 text-sm flex items-center gap-2">
                          <span className="font-semibold text-gray-800">D.</span>
                          {isCurrentlyEditing ? (
                            <input
                              type="text"
                              name="option4"
                              value={editForm.option4}
                              onChange={handleEditFormChange}
                              className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm outline-none"
                            />
                          ) : (
                            <span>{q.option4}</span>
                          )}
                        </div>
                      </div>

                      {/* CORRECT ANSWER SECTION */}
                      <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-700 font-semibold rounded-lg p-3 flex items-center gap-2 text-sm">
                        <span>✔ Correct Answer:</span>
                        {isCurrentlyEditing ? (
                          <div className="relative min-w-[200px]">
                            <select
                              name="answer"
                              value={editForm.answer}
                              onChange={handleEditFormChange}
                              className="w-full appearance-none pl-3 pr-8 py-1 border border-green-300 rounded bg-white text-sm font-medium text-gray-700 focus:outline-none"
                            >
                              <option value="">Select Correct Option Value</option>
                              {editForm.option1 && <option value={editForm.option1}>{editForm.option1} (A)</option>}
                              {editForm.option2 && <option value={editForm.option2}>{editForm.option2} (B)</option>}
                              {editForm.option3 && <option value={editForm.option3}>{editForm.option3} (C)</option>}
                              {editForm.option4 && <option value={editForm.option4}>{editForm.option4} (D)</option>}
                            </select>
                            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                          </div>
                        ) : (
                          <span className="font-normal">{q.answer}</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminAssessment;