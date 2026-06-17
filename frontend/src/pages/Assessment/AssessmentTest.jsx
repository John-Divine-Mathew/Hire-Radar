import React, { useState } from "react";

const questions = [

  {
    id:1,
    category:"Reasoning",
    question:"Find the next number: 2,4,6,8 ?",
    options:["10","11","12","15"],
    answer:"10"
  },

  {
    id:2,
    category:"Aptitude",
    question:"10 + 20 = ?",
    options:["25","30","35","40"],
    answer:"30"
  },

  {
    id:3,
    category:"Technical",
    question:"React is?",
    options:[
      "Database",
      "Frontend Library",
      "OS",
      "Browser"
    ],
    answer:"Frontend Library"
  },

 {
    id:4,
    category:"Technical",
    question:"What is the main purpose of Software Testing?",
    options:[
      "To write code",
      "To find Defects in the application",
      "To Design UI",
      "To Create Databases"
    ],
    answer:"To find Defects in the application"
  },

  {
    id:5,
    category:"Technical",
    question:"Which Testing is Performed by the End User?",
    options:[
      "Unit Testing",
      "Integration Testing",
      "User Acceptance Testing",
      "Regression Testing"
    ],
    answer:"User Acceptance Testing"
  },

  {
    id:6,
    category:"Technical",
    question:"What Should happen when a user enters valid login crendentials?",
    options:[
      "Error Message Displayed",
      "Applicaiton Crashes",
      "User is logged in Successfully",
      "Page Refreshes Continuously"
    ],
    answer:"User is logged in Successfully"
  },

  {
    id:7,
    category:"Reasoning",
    question:"Find the odd one out: Apple, Banana, Carrot, Mango",
    options:["Apple","Banana","Carrot","Mango"],
    answer:"Carrot"
  },

  {
    id:8,
    category:"Aptitude",
    question:"If the cost of 5 pens is 10 Rs, what is the cost of 8 pens?",
    options:["12 Rs","15 Rs","16 Rs","20 Rs"],
    answer:"16 Rs"
  },

  {
    id:9,
    category:"Reasoning",
    question:"If all Bloops are Razzies and all Razzies are Lazzies, then all Bloops are definitely Lazzies?",
    options:["True","False"],
    answer:"True"
  },

  {
    id:10,
    category:"Aptitude",
    question:"What is the square root of 144?",
    options:["10","11","12","13"],
    answer:"12"
  }

];

function AssessmentTest() {

  const [answers,setAnswers] = useState({});

  const [score,setScore] = useState(null);

  const submitTest = ()=>{

    let marks = 0;

    questions.forEach((q)=>{

      if(
        answers[q.id] === q.answer
      ){
        marks++;
      }

    });

    setScore(marks);
  };

  return (

    <div className="p-10">

      <h1 className="text-4xl font-bold mb-8">
        Assessment Test
      </h1>

      {

        questions.map((q)=>(

          <div
            key={q.id}
            className="border p-5 mb-5 rounded"
          >

            <h2>
              {q.category}
            </h2>

            <h3 className="font-bold">
              {q.question}
            </h3>

            {

              q.options.map((option)=>(

                <div key={option}>

                  <input
                    type="radio"
                    name={q.id}
                    value={option}
                    onChange={()=>
                      setAnswers({
                        ...answers,
                        [q.id]:option
                      })
                    }
                  />

                  <span className="ml-2">
                    {option}
                  </span>

                </div>

              ))

            }

          </div>

        ))

      }

      <button
        onClick={submitTest}
        className="bg-blue-600 text-white px-6 py-3 rounded"
      >
        Submit Test
      </button>

      {
        score !== null &&

        <h2 className="mt-5 text-3xl">
          Score : {score}/{questions.length}
        </h2>
      }

    </div>
  );
}

export default AssessmentTest;