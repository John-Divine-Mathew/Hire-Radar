import React, { useState } from "react";
import Sidebar from "../../components/sideBar/sideBar";

function AdminAssessment() {
  const [questions, setQuestions] = useState([]);

 const [form, setForm] = useState({
  assessmentTitle: "",
  department: "",
  category: "",
  difficulty: "",
  marks: "1",
  question: "",
  option1: "",
  option2: "",
  option3: "",
  option4: "",
  answer: "",
});

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const addQuestion = () => {
  if (
  !form.assessmentTitle ||
  !form.department ||
  !form.category ||
  !form.difficulty ||
  !form.marks ||
  !form.question ||
  !form.option1 ||
  !form.option2 ||
  !form.option3 ||
  !form.option4 ||
  !form.answer
){
      alert("Please fill all fields.");
      return;
    }

    setQuestions([
      ...questions,
      {
        id: Date.now(),
        ...form,
      },
    ]);

 setForm({
  assessmentTitle: "",
  department: "",
  category: "",
  difficulty: "",
  marks: "1",
  question: "",
  option1: "",
  option2: "",
  option3: "",
  option4: "",
  answer: "",
});
  };

  const deleteQuestion = (id) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">

      <Sidebar />

      <div className="flex-1 p-8">

<div className="grid md:grid-cols-2 gap-6 mb-6">

  {/* Department */}

  <div>

    <label className="font-semibold text-gray-700">
      Department
    </label>

    <select
      name="department"
      value={form.department}
      onChange={handleChange}
      className="w-full mt-2 border rounded-xl p-3"
    >

      <option value="">Select Department</option>

      <option>Software Development</option>

      <option>Design Engineering</option>

      <option>Automation</option>

      <option>Quality Assurance</option>

      <option>Mechanical</option>

      <option>Electrical</option>

      <option>HR</option>

      <option>Production</option>

    </select>

  </div>

  {/* Category */}

  <div>

    <label className="font-semibold text-gray-700">
      Question Category
    </label>

    <select
      name="category"
      value={form.category}
      onChange={handleChange}
      className="w-full mt-2 border rounded-xl p-3"
    >

      <option value="">Select Category</option>

      <option>Aptitude</option>

      <option>Reasoning</option>

      <option>Technical</option>

      <option>Verbal Ability</option>

      <option>General Knowledge</option>

      <option>Coding</option>

    </select>

  </div>

</div>
        {/* Header */}

        <div >

          <h1 className="text-4xl font-bold">
            Assessment Management
          </h1>

          <p className="mt-2 text-purple-100">
            Create and manage technical assessment questions.
          </p>

        </div>

        {/* Form */}

        <div className="bg-white rounded-2xl shadow-lg p-8">

          <h2 className="text-2xl font-bold text-gray-700 mb-6">
            Add New Question
          </h2>

          {/* Question */}

          <label className="font-semibold text-gray-700">
            Question
          </label>

          <textarea
            rows="4"
            name="question"
            value={form.question}
            onChange={handleChange}
            placeholder="Enter Interview Question"
            className="w-full mt-2 border rounded-xl p-4 focus:ring-2 focus:ring-purple-500 outline-none"
          />

          {/* Options */}

          <div className="grid md:grid-cols-2 gap-5 mt-6">

            <div>
              <label className="font-semibold">
                Option A
              </label>

              <input
                type="text"
                name="option1"
                value={form.option1}
                onChange={handleChange}
                className="w-full mt-2 border rounded-xl p-3"
              />
            </div>

            <div>
              <label className="font-semibold">
                Option B
              </label>

              <input
                type="text"
                name="option2"
                value={form.option2}
                onChange={handleChange}
                className="w-full mt-2 border rounded-xl p-3"
              />
            </div>

            <div>
              <label className="font-semibold">
                Option C
              </label>

              <input
                type="text"
                name="option3"
                value={form.option3}
                onChange={handleChange}
                className="w-full mt-2 border rounded-xl p-3"
              />
            </div>

            <div>
              <label className="font-semibold">
                Option D
              </label>

              <input
                type="text"
                name="option4"
                value={form.option4}
                onChange={handleChange}
                className="w-full mt-2 border rounded-xl p-3"
              />
            </div>

          </div>

          {/* Correct Answer */}

          <div className="mt-8">

            <h3 className="font-bold text-lg mb-4">
              Select Correct Answer
            </h3>

            <div className="grid md:grid-cols-2 gap-4">

              {[form.option1, form.option2, form.option3, form.option4].map(
                (option, index) => (
                  <label
                    key={index}
                    className="flex items-center gap-3 border rounded-xl p-4 cursor-pointer hover:bg-purple-50"
                  >
                    <input
                      type="radio"
                      name="answer"
                      value={option}
                      checked={form.answer === option}
                      onChange={handleChange}
                    />

                    {option || `Option ${String.fromCharCode(65 + index)}`}
                  </label>
                )
              )}

            </div>

          </div>

          <button
            onClick={addQuestion}
            className="mt-8 bg-green-600 hover:bg-green-800 text-white px-8 py-3 rounded-xl shadow-lg transition"
          >
            + Save Question
          </button>

        </div>

        {/* Question List */}

        <div className="mt-10">

          <div className="flex justify-between items-center mb-6">

            <h2 className="text-3xl font-bold text-gray-700">
              Saved Questions
            </h2>

            <div className="bg-purple-700 text-white px-5 py-2 rounded-full font-semibold">
              {questions.length} Questions
            </div>

          </div>

          {questions.length === 0 ? (

            <div className="bg-white rounded-xl shadow p-10 text-center text-gray-500">

              <h3 className="text-2xl font-semibold">
                No Questions Added
              </h3>

              <p className="mt-2">
                Start creating your assessment questions.
              </p>

            </div>

          ) : (

            questions.map((q, index) => (

              <div
                key={q.id}
                className="bg-white rounded-2xl shadow-lg p-7 mb-6 border-l-8 border-purple-600"
              >

                <div className="flex justify-between items-center">
                  <div className="flex gap-3 mb-4">

  <span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-sm font-semibold">

    Department :
    {q.department}

  </span>

  <span className="bg-purple-100 text-purple-700 px-4 py-1 rounded-full text-sm font-semibold">

    Category :
    {q.category}

  </span>

</div>

                  <h3 className="text-xl font-bold text-gray-800">
                    Q{index + 1}. {q.question}
                  </h3>

                  <button
                    onClick={() => deleteQuestion(q.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg"
                  >
                    Delete
                  </button>

                </div>

                <div className="grid md:grid-cols-2 gap-3 mt-5">

                  <div className="bg-gray-100 rounded-lg p-3">
                    A. {q.option1}
                  </div>

                  <div className="bg-gray-100 rounded-lg p-3">
                    B. {q.option2}
                  </div>

                  <div className="bg-gray-100 rounded-lg p-3">
                    C. {q.option3}
                  </div>

                  <div className="bg-gray-100 rounded-lg p-3">
                    D. {q.option4}
                  </div>

                </div>

                <div className="mt-6 bg-green-100 text-green-700 font-semibold rounded-lg p-3">
                  ✔ Correct Answer : {q.answer}
                </div>

              </div>

            ))

          )}

        </div>

      </div>

    </div>
  );
}

export default AdminAssessment;