import React, { useState } from "react";
import Sidebar from "../../components/sideBar/sideBar.jsx";

function AdminAssessment() {

  const [questions,setQuestions] =
  useState([]);

  const [question,setQuestion] =
  useState("");

  const addQuestion = ()=>{

    const newQuestion = {

      id:Date.now(),
      question

    };

    setQuestions([
      ...questions,
      newQuestion
    ]);

    setQuestion("");
  };

  const deleteQuestion = (id)=>{

    setQuestions(
      questions.filter(
        (q)=>q.id !== id
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8 lg:p-12">
          <div className="mx-auto w-full max-w-4xl bg-white shadow-xl rounded-3xl p-10">

      <h1 className="text-4xl font-bold mb-6">
        Assessment Management
      </h1>

      <input
        type="text"
        placeholder="Enter Question"
        className="border p-3 w-full"
        value={question}
        onChange={(e)=>
          setQuestion(e.target.value)
        }
      />

      <button
        onClick={addQuestion}
        className="bg-green-600 text-white px-5 py-2 mt-4"
      >
        Add Question
      </button>

      <div className="mt-8">

        {

          questions.map((q)=>(

            <div
              key={q.id}
              className="border p-4 mb-4 rounded"
            >

              <p>{q.question}</p>

              <button
                onClick={()=>
                  deleteQuestion(q.id)
                }
                className="bg-red-500 text-white px-4 py-1 mt-2"
              >
                Delete
              </button>

            </div>

          ))

        }

      </div>

          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminAssessment;