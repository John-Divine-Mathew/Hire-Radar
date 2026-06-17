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

  const handleSubmit = (e) => {

    e.preventDefault();

    localStorage.setItem(
      "candidate",
      JSON.stringify(candidate)
    );

    navigate("/assessment-test");
  };

  return (
    <div className="p-10">

      <h1 className="text-4xl font-bold mb-8 text-purple-700">
        Candidate Details
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >

        <input
          type="text"
          placeholder="Full Name"
          className="border p-3 w-full text-gray-700"
          onChange={(e)=>
            setCandidate({
              ...candidate,
              name:e.target.value
            })
          }
        />

        <input
          type="email"
          placeholder="Email"
          className="border p-3 w-full text-gray-700"
          onChange={(e)=>
            setCandidate({
              ...candidate,
              email:e.target.value
            })
          }
        />

        <input
          type="text"
          placeholder="Phone"
          className="border p-3 w-full text-gray-700"
          onChange={(e)=>
            setCandidate({
              ...candidate,
              phone:e.target.value
            })
          }
        />

        <input
          type="text"
          placeholder="Department"
          className="border p-3 w-full text-gray-700"
          onChange={(e)=>
            setCandidate({
              ...candidate,
              department:e.target.value
            })
          }
        />

        <button
          className="bg-green-600 text-white px-6 py-3 rounded"
        >
          Start Assessment
        </button>

        <h1 className="text-3xl font-bold text-purple-700 ">
              Best of Luck for your Assessment
            </h1>

      </form>

    </div>
  );
}

export default AssessmentForm;