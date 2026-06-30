import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { logoutUser } from "../../utils/auth.js";

function AssessmentTest() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cndid, department } = location.state;
  const [timeLeft, setTimeLeft] = useState(0);

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);

  const [testStarted, setTestStarted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [notification, setNotification] = useState("");
  const [warningShown, setWarningShown] = useState(false);

  const getListData = async()=>{
    try {
      const response = await fetch(`http://localhost:5000/hireRadar/testquestions/${department}`);
      const jsonData = await response.json();
      setQuestions(jsonData);
      setTimeLeft(jsonData.length * 60);
    } catch (err) {
      console.error(err.message);
    }
  }
  useEffect(() => {
    getListData();
  },[]);
  
  async function setFinalResult(percentage){
    try {
      const response1 = await fetch("http://localhost:5000/hireRadar/setTestResult",{
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({'result':percentage, 'cndid':cndid})
      });
      const jsonData1 = await response1.json();
    } catch (err) {
      console.log(err.message);
    }
  }


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
      if (answers[q.qno] === q.answer) {
        marks++;
      }
    });
    setScore(marks);
    setIsSubmitted(true);
    setFinalResult((marks/questions.length)*100);

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
              <li>Duration : {questions.length} Minutes</li>
              <li>Each Question Carries 1 Mark</li>
              <li>No Negative Marks</li>
              <li>Do not refresh the page during the test</li>
              <li>Answer all questions before submitting</li>
              <li>
                Test will automatically submit when time expires
              </li>
            </ul>

            <div className="bg-red-50 border border-red-300 rounded-xl p-5 mb-6">

<h3 className="font-bold text-red-700">
Important Assessment Rules
</h3>

<ul className="list-disc ml-6 mt-3 text-red-700 space-y-2">

<li>Refreshing the page is prohibited.</li>

<li>Switching browser tabs is prohibited.</li>

<li>Opening another application will automatically submit the assessment.</li>

<li>Do not minimize the browser.</li>

<li>Use only one browser window.</li>

</ul>

</div>

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
                    key={q.qno}
                    className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6"
                  >
                    <legend className="text-lg font-semibold text-slate-900 mb-4">
                      {q.qno}. {q.question}
                    </legend>
                    <p className="text-sm text-slate-500 mb-4">
                      {q.category}
                    </p>

                    <div className="grid gap-3">
                      {[q.option1,q.option2,q.option3,q.option4].map((option) => (
                        <label
                          key={option}
                          className="flex items-center gap-4 rounded-2xl border border-slate-200 px-4 py-3 cursor-pointer transition hover:border-purple-500"
                        >
                          <input
                            type="radio"
                            name={`question-${q.qno}`}
                            value={option}
                            disabled={isSubmitted}
                            checked={answers[q.qno] === option}
                            onChange={() =>
                              setAnswers({
                                ...answers,
                                [q.qno]: option,
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

          {isSubmitted && score !== null && (
            <div className="bg-green-100 border border-green-500 rounded-xl p-6 mt-10 relative">
              <button
                onClick={() => {
                  logoutUser();
                  navigate("/home");
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