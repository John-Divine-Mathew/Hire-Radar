import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {

  const navigate = useNavigate();

  const [showSupport, setShowSupport] = useState(false);

  return (
    <>
      {/* Navbar */}

      <nav className="sticky top-0 z-50 bg-white shadow-lg border-b">

        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">

          {/* Logo */}

          <div>

            <h1 className="text-3xl font-extrabold text-purple-700 ">
              Hire-Radar
            </h1>

          </div>

          {/* Buttons */}

          <div className="flex items-center gap-4">

            {/* Support */}

            <button
              onClick={() => setShowSupport(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg font-medium transition duration-300 shadow-md"
            >
              Support
            </button>

            {/* HR Login */}

            <button
              onClick={() => navigate("/dashboard")}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-medium transition duration-300 shadow-md"
            >
              HR / Admin Login
            </button>

            {/* User Login */}

            <button
              onClick={() => navigate("/assessment")}
              className="bg-purple-700 hover:bg-purple-800 text-white px-5 py-2 rounded-lg font-medium transition duration-300 shadow-md"
            >
              User Login
            </button>

          </div>

        </div>

      </nav>

      {/* Support Modal */}

      {showSupport && (

        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">

          <div className="bg-white w-[500px] rounded-2xl shadow-2xl p-8">

            <h2 className="text-3xl font-bold text-center text-purple-700 mb-6">
              Developer Support
            </h2>

            <div className="space-y-4 text-gray-700">

              <div>
                <h3 className="font-bold text-lg">
                  Developers
                </h3>

                <ul className="list-disc ml-6 mt-2">
                  <li>John Divine Mathew J</li>
                  <li>Vijayanandha</li>
                  <li>Bharathsnehan</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg">
                  Email
                </h3>

                <p>mathewdivine95@gmail.com</p>
                <p>vijayanandhaj@gmail.com</p>
                <p>bharathsnehan@gmail.com</p>
                <p>
                  <span className="font-bold">
                    Phone & WhatsApp:
                  </span>
                  {" "}
                </p>
                 <p>+91 9626749641,+91 7373774847,+91 7448540072</p>

                <p>
                  <span className="font-bold">
                    Department:
                  </span>
                  {" "}
                  Automation
                </p>

                <p>
                  <span className="font-bold">
                    Working Hours:
                  </span>
                  {" "}
                  9:00 AM - 6:00 PM
                </p>

                <p>
                  <span className="font-bold">
                    Working Days:
                  </span>
                  {" "}
                  Monday to Friday 
                </p>
              </div>

              <div>
                <h3 className="font-bold text-lg">
                  Phone & WhatsApp
                </h3>

                <p>+91 9626749641</p>
                <p>+91 7373774847</p>
                <p>+91 7448540072</p>
              </div>

              <div>
                <h3 className="font-bold text-lg">
                  Department
                </h3>

                <p>Automation</p>
              </div>

              <div>
                <h3 className="font-bold text-lg">
                  Working Hours
                </h3>

                <p>Monday - Friday</p>
                <p>9:00 AM - 6:00 PM</p>
              </div>

            </div>

            <div className="flex justify-center mt-8">

              <button
                onClick={() => setShowSupport(false)}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg"
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </>
  );
};

export default Navbar;