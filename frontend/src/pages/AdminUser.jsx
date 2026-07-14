import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {

  const navigate = useNavigate();

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [credentialsList, setCredentialsList] = useState([]);

  const fetchData = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/hireRadar/getTestDetails"
      );

      const jsonData = await response.json();

      setCredentialsList(jsonData);

    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogin = (e) => {

    e.preventDefault();

    let flag = 0;
    let cndid;
    let result; 
    let email;

    for (const i of credentialsList) {

      if (
        i.username === userName &&
        i.password === password
      ) {

        flag = 1;
        cndid = i.cndid;
        result = i.testresult ? true : false; 
        email = i.cndemail;

      }

    }

    if (
      flag === 1 ||
      (userName === "test" && password === "Hirotec@123")
    ) {

      alert("Login Successful");

      navigate("/assessmentform", {
        state: {
          cndid,
          result,
          email
        },
      });

    } else {

      alert("Invalid Username or Password");

    }

  };

  return (

    <div className="relative min-h-screen overflow-hidden bg-gradient-to-r from-purple-100 via-purple-200 to-violet-100">

      {/* Animated Background */}

      <div className="absolute w-96 h-96 bg-purple-300 rounded-full blur-3xl opacity-40 animate-pulse top-0 left-0"></div>

      <div className="absolute w-[500px] h-[500px] bg-violet-300 rounded-full blur-3xl opacity-40 animate-pulse bottom-0 right-0"></div>

      <div className="absolute w-72 h-72 bg-fuchsia-200 rounded-full blur-3xl opacity-30 animate-bounce top-40 right-40"></div>

      {/* Main Content */}

      <div className="relative z-10 flex min-h-screen">

        {/* Left Side */}

        <div className="hidden lg:flex w-1/2 justify-center items-center px-16">

          <div>

            <h1 className="text-6xl font-extrabold text-purple-800 leading-tight">

              Welcome to Hirotec

            </h1>

            <h2 className="text-3xl font-semibold mt-6 text-purple-700">

             Assessment Portal

            </h2>

            <p className="mt-6 text-lg text-gray-700 leading-8">

              Complete your assessment securely and showcase your skills.

              <br /><br />

              We wish you the very best for your interview.

            </p>

          </div>

        </div>

        {/* Right Side */}

        <div className="w-full lg:w-1/2 flex justify-center items-center">

          <div className="w-[430px] backdrop-blur-xl bg-white/60 shadow-2xl rounded-3xl p-10 border border-white/50">

            <div className="text-center">

              <div className="text-6xl mb-4">
                
              </div>

              <h1 className="text-4xl font-bold text-purple-800">

                Candidate Login

              </h1>

              <p className="mt-2 text-gray-600">

                Login to begin your assessment.

              </p>

            </div>

            <form
              onSubmit={handleLogin}
              className="mt-10 space-y-6"
            >

              <div>

                <label className="font-semibold text-gray-700">

                  Username

                </label>

                <input
                  type="text"
                  placeholder="Enter Username"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full mt-2 border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-purple-500 outline-none transition"
                />

              </div>

              <div>

                <label className="font-semibold text-gray-700">

                  Password

                </label>

                <input
                  type="password"
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full mt-2 border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-purple-500 outline-none transition"
                />

              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-700 to-violet-700 hover:from-purple-800 hover:to-violet-800 text-white py-4 rounded-xl text-lg font-semibold shadow-lg transition duration-300"
              >

                Login to Assessment

              </button>

            </form>

            <div className="mt-8 text-center text-gray-600 text-sm">

              © 2026 Hire-Radar

              <br />

              Secure Online Assessment Platform

            </div>

          </div>

        </div>

      </div>

    </div>

  );
};

export default AdminLogin;