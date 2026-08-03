import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { logoutUser } from "../../utils/auth.js";
 
function AssessmentTest() {
 const navigate = useNavigate();
 const location = useLocation();
 const { cndid, role } = location.state;
 const [timeLeft, setTimeLeft] = useState(0);
 
 const [questions, setQuestions] = useState([]);
 const [answers, setAnswers] = useState({});
 const [score, setScore] = useState(null);
 
 const [testStarted, setTestStarted] = useState(false);
 const [isSubmitted, setIsSubmitted] = useState(false);
 
 const [notification, setNotification] = useState("");
 const [warningShown, setWarningShown] = useState(false);
 
// Detect tab switching / page leave
const [tabSwitchDetected, setTabSwitchDetected] = useState(false);
 
 const getListData = async()=>{
   try {
     const response = await fetch(`http://localhost:5000/hireRadar/testquestions/${role}`);
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
       body: JSON.stringify({result:percentage, cndid:cndid, teststatus: percentage>=50.00?'Pass':'Fail'})
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
 
 // ===============================
// Detect Browser Tab Change
// ===============================
 
useEffect(() => {
 if (!testStarted || isSubmitted) return;
 
 const handleVisibilityChange = () => {
   if (document.hidden) {
     setTabSwitchDetected(true);
 
     submitTest(true);
 
     setNotification(
       "⚠ Test submitted because you switched to another tab or application."
     );
   }
 };
 
 document.addEventListener(
   "visibilitychange",
   handleVisibilityChange
 );
 
 return () => {
   document.removeEventListener(
     "visibilitychange",
     handleVisibilityChange
   );
 };
}, [testStarted, isSubmitted]);
 
// ===============================
// Detect Refresh / Close
// ===============================
 
useEffect(() => {
 if (!testStarted || isSubmitted) return;
 
 const handleBeforeUnload = (event) => {
 
   submitTest(true);
 
   event.preventDefault();
 
   event.returnValue = "";
 };
 
 window.addEventListener(
   "beforeunload",
   handleBeforeUnload
 );
 
 return () => {
   window.removeEventListener(
     "beforeunload",
     handleBeforeUnload
   );
 };
 
}, [testStarted, isSubmitted]);
 
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
 
 setFinalResult((marks / questions.length) * 100);
 
 if (autoSubmit) {
 
   setNotification(
     "⚠ Assessment was automatically submitted."
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
 
         <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8 mb-8">
 
           <h2 className="text-2xl font-bold text-green-700 mb-5">
             Assessment Details
           </h2>
 
           <div className="grid gap-3 md:grid-cols-2 text-gray-700">
             <ul className="space-y-3 list-disc ml-6">
               <li>Total Questions : {questions.length}</li>
               <li>Total Marks : {questions.length}</li>
               <li>Duration : {questions.length} Minutes</li>
               <li>Each Question Carries 1 Mark</li>
               <li>No Negative Marks</li>
               <li>Answer all questions before submitting</li>
               <li>Test will automatically submit when time expires</li>
              
             </ul>
           </div>
 
          {/*Professional Warning Banner*/ }
 
       <div className="bg-red-50 border border-red-300 rounded-xl p-5 mt-6">
 
<h3 className="font-bold text-red-700">
Important Assessment Rules
</h3>
 
<ul className="list-disc ml-6 mt-3 text-red-700 space-y-2">
 
<li>Refreshing the page is prohibited.</li>
 
<li>Switching browser tabs is prohibited.</li>
 
<li>Opening another application will automatically submit the assessment.</li>
 
<li>Do not minimize the browser.</li>
 
<li>Use only one browser window.</li>

 <li>
                 Do not switch browser tabs or applications. The assessment will be submitted automatically.
               </li>
 
</ul>
 
</div>  
 
           {!testStarted && (
             <div className="mt-8">
               <button
                 onClick={startTest}
                 className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg text-lg font-semibold shadow-sm transition"
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
             <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
               <div>
                 <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                   Assessment Questions
                 </h1>
                 <p className="text-sm text-slate-600 mt-1">
                   Select one answer for each question before submitting your test.
                 </p>
               </div>
               <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
                 {questions.length} Questions
               </div>
             </div>
 
             <form className="space-y-5">
               {questions.map((q, index) => (
                 <fieldset
                   key={q.qno}
                   className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6"
                 >
                   <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                     <div className="space-y-2">
                       <span className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1 text-sm font-medium text-purple-700">
                         {index + 1}.
                       </span>
                       <h3 className="text-lg font-semibold text-slate-900 leading-7">
                         {q.question}
                       </h3>
                     </div>
                     {q.category && (
                       <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-600 self-start">
                         {q.category}
                       </span>
                     )}
                   </div>
 
                   <div className="mt-5 grid gap-3 md:grid-cols-2">
                     {[q.option1,q.option2,q.option3,q.option4].map((option) => (
                       <label
                         key={option}
                         className="flex items-start gap-3 rounded-xl border border-slate-200 px-4 py-3 cursor-pointer transition hover:border-purple-500 hover:bg-purple-50/70"
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
                           className="mt-1 h-4 w-4 text-purple-600"
                         />
                         <span className="text-slate-800 leading-6">{option}</span>
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
                 className={`px-8 py-3 rounded-lg text-white font-semibold shadow-sm transition ${
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
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
              <div className="relative w-full max-w-lg rounded-2xl border border-green-200 bg-white px-8 pb-24 pt-8 text-center shadow-2xl">
               <h2 className="text-3xl font-bold text-green-700">
                 Assessment Completed
               </h2>

               <div className="mt-3 rounded-xl bg-green-50 p-6">
                 <p className="text-xl font-semibold text-slate-800">
                   Score : {score}/{questions.length}
                 </p>
                 <p className="mt-3 text-gray-700">
                   Your responses have been submitted successfully. Further modifications are not allowed.
                 </p>
               </div>

               <button
                 onClick={() => {
                   logoutUser();
                   navigate("/home");
                 }}
                 className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-lg bg-purple-600 px-4 py-2 font-semibold text-white transition hover:bg-purple-700"
               >
                 Back to Home
               </button>
             </div>
           </div>
         )}
       </main>
     </div>
   </div>
 );
}
 
export default AssessmentTest;