import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../utils/auth.js";
import Sidebar from "../../components/sideBar/sideBar.jsx";

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
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);

  const [testStarted, setTestStarted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [notification, setNotification] = useState("");
  const [warningShown, setWarningShown] = useState(false);

  const [timeLeft, setTimeLeft] = useState(25 * 60);

  useEffect(() => {
    if (!testStarted || isSubmitted) return;

    // Warning at 2 Minutes

    if (timeLeft === 120 && !warningShown) {
      setNotification(
        "⚠️ Warning: Only 2 Minutes Remaining!"
      );

      setWarningShown(true);

      setTimeout(() => {
        setNotification("");
      }, 5000);
    }

    // Auto Submit

    if (timeLeft <= 0) {
      submitTest(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, testStarted, isSubmitted, warningShown]);

  const startTest = () => {
    setTestStarted(true);
  };

  const submitTest = (autoSubmit = false) => {
    if (isSubmitted) return;

    let marks = 0;

    questions.forEach((q) => {
      if (answers[q.id] === q.answer) {
        marks++;
      }
    });

    setScore(marks);
    setIsSubmitted(true);

    if (autoSubmit) {
      setNotification(
        "⏰ Time Up! Test Automatically Submitted."
      );
    } else {
      setNotification(
        "✅ Assessment Submitted Successfully."
      );
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="flex min-h-screen">

        <main className="flex-1 p-8 lg:p-10">
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
            <h1 className="text-4xl font-bold text-purple-700 mb-4">
              Hirotec Assessment Portal
            </h1>

            <p className="text-gray-600">
              Welcome Candidate. Please read all instructions
              carefully before starting the assessment.
            </p>
          </div>

          {/* Notification */}

          {notification && (
            <div className="mb-6 bg-yellow-100 border border-yellow-500 text-yellow-800 px-4 py-3 rounded-lg">
              {notification}
            </div>
          )}

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
              <li>
                Test will automatically submit when time expires
              </li>
            </ul>

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

          {testStarted && !isSubmitted && (
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

              <form className="space-y-6">
                {questions.map((q) => (
                  <fieldset
                    key={q.id}
                    className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6"
                  >
                    <legend className="text-lg font-semibold text-slate-900 mb-4">
                      {q.id}. {q.question}
                    </legend>
                    <p className="text-sm text-slate-500 mb-4">
                      {q.category}
                    </p>

                    <div className="grid gap-3">
                      {q.options.map((option) => (
                        <label
                          key={option}
                          className="flex items-center gap-4 rounded-2xl border border-slate-200 px-4 py-3 cursor-pointer transition hover:border-purple-500"
                        >
                          <input
                            type="radio"
                            name={`question-${q.id}`}
                            value={option}
                            disabled={isSubmitted}
                            checked={answers[q.id] === option}
                            onChange={() =>
                              setAnswers({
                                ...answers,
                                [q.id]: option,
                              })
                            }
                            className="h-4 w-4 text-purple-600"
                          />
                          <span className="text-slate-800">{option}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                ))}
              </form>

              {/* Submit Button */}

              <div className="text-center mt-8">
                <button
                  onClick={() => submitTest(false)}
                  disabled={isSubmitted}
                  className={`px-8 py-3 rounded-lg text-white font-semibold ${
                    isSubmitted
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isSubmitted
                    ? "Assessment Submitted"
                    : "Submit Test"}
                </button>
              </div>

            </div>
          )}

          {/* Result */}

          {score !== null && (
            <div className="bg-green-100 border border-green-500 rounded-xl p-6 mt-10 relative">
              <button
                onClick={() => {
                  logoutUser();
                  navigate("/admin-user");
                }}
                className="absolute top-6 right-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg"
              >
                back to home
              </button>

              <h2 className="text-3xl font-bold text-green-700">
                Assessment Completed
              </h2>

              <p className="mt-4 text-xl font-semibold">
                Score : {score}/{questions.length}
              </p>

              <p className="mt-3 text-gray-700">
                Your responses have been submitted
                successfully. Further modifications are
                not allowed.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default AssessmentTest;