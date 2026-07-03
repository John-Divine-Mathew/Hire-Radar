import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function AssessmentForm() {
  const navigate = useNavigate();
  const location = useLocation();
  // Using optional chaining syntax to avoid crashing if state is null
  const { cndid, result } = location.state || {};

  const [candidate, setCandidate] = useState({
    name: "",
    email: "",
    phone: "",
    department: ""
  });

  const [message, setMessage] = useState("");

  // Submit Details (Made safely callable without an event object)
  const handleSubmit = async (e) => {
    if (e) e.preventDefault(); // Only call preventDefault if the event exists

    try {
      const body = {
        'cndid': cndid,
        'name': candidate.name,
        'email': candidate.email,
        'department': candidate.department,
        'phone': candidate.phone
      };
      
      const response = await fetch("http://localhost:5000/hireRadar/updateTestDetails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      console.log(response);
      
      setMessage("Candidate Details Submitted Successfully!");
      setTimeout(() => {
        setMessage("");
      }, 3000);

    } catch (err) {
      console.log(err.message);
      setMessage("An error occurred during submission.");
    }
  };

  // Start Assessment
  const startAssessment = async (e) => {
    e.preventDefault(); // Prevent standard form submissions if clicked

    if (
      !candidate.name ||
      !candidate.email ||
      !candidate.phone ||
      !candidate.department
    ) {
      alert("Please fill all fields first");
      return;
    }

    if (result) {
      alert("Already taken the test !");
      return;
    }

    // Await or let the submission trigger cleanly
    await handleSubmit(); 
    
    navigate("/assessment-test", {
      state: { 
        'cndid': cndid, 
        'department': candidate.department
      }
    });
  };

  // Reset Form
  const handleReset = () => {
    setCandidate({
      name: "",
      email: "",
      phone: "",
      department: ""
    });

    setMessage("Form Reset Successfully");

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex min-h-screen">
        <main className="flex-1 p-8 lg:p-12">
          <div className="mx-auto w-full max-w-4xl bg-white shadow-xl rounded-3xl p-10">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-purple-700 mb-2">
                Candidate Assessment Details
              </h1>
              <p className="text-slate-600">
                Enter candidate information and proceed to the assessment in a clean, structured form.
              </p>
            </div>

            {/* Notification */}
            {message && (
              <div className="mb-5 bg-green-100 border border-green-500 text-green-700 px-4 py-3 rounded">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                type="text"
                placeholder="Full Name"
                className="border p-3 w-full rounded"
                value={candidate.name}
                onChange={(e) => setCandidate({ ...candidate, name: e.target.value })}
              />

              <input
                type="email"
                placeholder="Email"
                className="border p-3 w-full rounded"
                value={candidate.email}
                onChange={(e) => setCandidate({ ...candidate, email: e.target.value })}
              />

              <input
                type="text"
                placeholder="Phone Number"
                className="border p-3 w-full rounded"
                value={candidate.phone}
                onChange={(e) => setCandidate({ ...candidate, phone: e.target.value })}
              />

              <div>
                <label className="block text-sm font-medium text-purple-700 mb-3">
                  Department
                </label>

                <select
                  className="border p-3 w-full rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-sm"
                  value={candidate.department}
                  onChange={(e) => setCandidate({ ...candidate, department: e.target.value })}
                >
                  <option value="">--- Choose Department ---</option>
                  <option value="Automation">Automation</option>
                  <option value="Design Engineering">Design Engineering</option>
                  <option value="Software Development">Software Development</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Production">Production</option>
                  <option value="Quality Assurance">Quality Assurance</option>
                </select>
              </div>

              <div className="grid gap-4 md:grid-cols-3 justify-center mt-8">
                {/* Submit */}
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                >
                  Submit
                </button>

                {/* Start Assessment (Changed type to button to prevent double submit triggers) */}
                <button
                  type="button" 
                  onClick={startAssessment}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
                >
                  Start Assessment
                </button>

                {/* Reset */}
                <button
                  type="button"
                  onClick={handleReset}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg"
                >
                  Reset
                </button>
              </div>
            </form>

            <h2 className="text-center text-2xl font-bold text-purple-700 mt-8">
              Best of Luck for Your Assessment
            </h2>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AssessmentForm;