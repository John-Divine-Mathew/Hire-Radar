import React, { useState, useEffect } from "react";

const questions = [
  {
    id: 1,
    category: "Reasoning",
    question: "Find the next number: 2,4,6,8 ?",
    options: ["10", "11", "12", "15"],
    answer: "10",
  },
  {
    id: 2,
    category: "Aptitude",
    question: "10 + 20 = ?",
    options: ["25", "30", "35", "40"],
    answer: "30",
  },
  {
    id: 3,
    category: "Technical",
    question: "React is?",
    options: ["Database", "Frontend Library", "OS", "Browser"],
    answer: "Frontend Library",
  },
  {
    id: 4,
    category: "Technical",
    question: "What is the main purpose of Software Testing?",
    options: [
      "To write code",
      "To find Defects in the application",
      "To Design UI",
      "To Create Databases",
    ],
    answer: "To find Defects in the application",
  },
  {
    id: 5,
    category: "Technical",
    question: "Which Testing is Performed by the End User?",
    options: [
      "Unit Testing",
      "Integration Testing",
      "User Acceptance Testing",
      "Regression Testing",
    ],
    answer: "User Acceptance Testing",
  },
];

function AssessmentTest() {
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);

  const [testStarted, setTestStarted] = useState(false);

  const [timeLeft, setTimeLeft] = useState(25 * 60);

  useEffect(() => {
    if (!testStarted) return;

    if (timeLeft <= 0) {
      submitTest();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, testStarted]);

  const startTest = () => {
    setTestStarted(true);
  };

  const submitTest = () => {
    let marks = 0;

    questions.forEach((q) => {
      if (answers[q.id] === q.answer) {
        marks++;
      }
    });

    setScore(marks);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="bg-gray-100 min-h-screen p-10">

      {/* Page Header */}

      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">

        <h1 className="text-4xl font-bold text-purple-700 mb-4">
          Hire-Radar Assessment Portal
        </h1>

        <p className="text-gray-600">
          Welcome Candidate. Please read the instructions carefully before
          starting the assessment.
        </p>

      </div>

      {/* Assessment Details */}

      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">

        <h2 className="text-2xl font-bold text-green-700 mb-5">
          Assessment Details
        </h2>

        <ul className="list-disc ml-6 space-y-3 text-gray-700">

          <li>Total Questions : {questions.length}</li>
          <li>Total Marks : {questions.length}</li>
          <li>Duration : 25 Minutes</li>
          <li>Each Question Carries 1 Mark</li>
          <li>No Negative Marks</li>
          <li>Do not refresh the page during the test</li>
          <li>Answer all questions before submitting</li>

        </ul>

        {/* Start Test Button */}

        {!testStarted && (

          <div className="mt-8">

            <button
              onClick={startTest}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg text-lg font-semibold"
            >
              Start Test
            </button>

          </div>

        )}

      </div>

      {/* Fixed Timer */}

      {testStarted && (

        <div className="fixed top-5 right-5 bg-red-600 text-white px-6 py-4 rounded-xl shadow-xl z-50">

          <h2 className="text-xl font-bold">
            ⏳ {formatTime(timeLeft)}
          </h2>

        </div>

      )}

      {/* Questions */}

      {testStarted && (

        <div>

          <h1 className="text-3xl font-bold mb-8">
            Assessment Questions
          </h1>

          {questions.map((q) => (

            <div
              key={q.id}
              className="bg-white border rounded-xl shadow p-6 mb-6"
            >

              <h2 className="text-purple-700 font-semibold">
                {q.category}
              </h2>

              <h3 className="font-bold text-lg mt-3 mb-4">
                {q.question}
              </h3>

              {q.options.map((option) => (

                <div key={option} className="mb-3">

                  <input
                    type="radio"
                    name={q.id}
                    value={option}
                    onChange={() =>
                      setAnswers({
                        ...answers,
                        [q.id]: option,
                      })
                    }
                  />

                  <span className="ml-3">{option}</span>

                </div>

              ))}

            </div>

          ))}

          {/* Submit Button */}

          <div className="text-center mt-8">

            <button
              onClick={submitTest}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg"
            >
              Submit Test
            </button>

          </div>

        </div>

      )}

      {/* Result */}

      {score !== null && (

        <div className="bg-green-100 border border-green-500 rounded-xl p-6 mt-10">

          <h2 className="text-3xl font-bold text-green-700">
            Score : {score}/{questions.length}
          </h2>

          <p className="mt-2 text-gray-700">
            Assessment Completed Successfully.
          </p>

        </div>

      )}

    </div>
  );
}

export default AssessmentTest;