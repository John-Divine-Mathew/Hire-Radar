import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function AssessmentForm() {

  const navigate = useNavigate();

  const [candidate, setCandidate] = useState({
    name: "",
    email: "",
    phone: "",
    department: ""
  });

  const [message, setMessage] = useState("");

  // Submit Details

  const handleSubmit = (e) => {
    console.log('Submit');
    e.preventDefault();

    localStorage.setItem(
      "candidate",
      JSON.stringify(candidate)
    );

    setMessage(" Candidate Details Submitted Successfully!");

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  // Start Assessment

  const startAssessment = () => {

    if (
      !candidate.name ||
      !candidate.email ||
      !candidate.phone ||
      !candidate.department
    ) {
      alert("Please fill all fields first");
      return;
    }

    navigate("/assessment-test");
  };

  // Reset Form

  const handleReset = () => {

    setCandidate({
      name: "",
      email: "",
      phone: "",
      department: ""
    });

    setMessage(" Form Reset Successfully");

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  return (

    <div className="min-h-screen bg-gray-100 flex justify-center items-center">

      <div className="bg-white shadow-xl rounded-xl p-10 w-[700px]">

        <h1 className="text-4xl font-bold text-purple-700 mb-8 text-center">
          Candidate Details
        </h1>

        {/* Notification */}

        {message && (

          <div className="mb-5 bg-green-100 border border-green-500 text-green-700 px-4 py-3 rounded">
            {message}
          </div>

        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <input
            type="text"
            placeholder="Full Name"
            className="border p-3 w-full rounded"
            value={candidate.name}
            onChange={(e) =>
              setCandidate({
                ...candidate,
                name: e.target.value
              })
            }
          />

          <input
            type="email"
            placeholder="Email"
            className="border p-3 w-full rounded"
            value={candidate.email}
            onChange={(e) =>
              setCandidate({
                ...candidate,
                email: e.target.value
              })
            }
          />

          <input
            type="text"
            placeholder="Phone Number"
            className="border p-3 w-full rounded"
            value={candidate.phone}
            onChange={(e) =>
              setCandidate({
                ...candidate,
                phone: e.target.value
              })
            }
          />

          <input
            type="text"
            placeholder="Department"
            className="border p-3 w-full rounded"
            value={candidate.department}
            onChange={(e) =>
              setCandidate({
                ...candidate,
                department: e.target.value
              })
            }
          />

          {/* Buttons */}

          <div className="flex gap-4 justify-center mt-6">

            {/* Submit */}

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
            >
              Submit
            </button>

            {/* Start Assessment */}

            <button
              type="button"
              onClick={startAssessment}
              type="submit"
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

    </div>
  );
}

export default AssessmentForm;