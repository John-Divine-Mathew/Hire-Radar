import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [showSupport, setShowSupport] = useState(false);
  return (
    <div className="bg-slate-50 min-h-screen">

      {/* Navbar removed from landing page (shown on admin dashboard only) */}

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white py-20">

        <div className="max-w-7xl mx-auto px-10">

          <div className="text-center">
             
            <h1 className="text-6xl font-bold mb-6">
              Welcome to Hire-Radar
            </h1>

            <h2 className="text-3xl font-semibold mb-6">
              Find the Right Talent Faster
            </h2>

            <p className="text-xl max-w-3xl mx-auto text-gray-200">
              AI-powered recruitment platform that helps HR teams discover,
              evaluate, and hire top talent from LinkedIn and Naukri
              through intelligent candidate matching and analytics.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4">
              <div className="flex justify-center gap-5">
                <HeroButtons />
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* About Section */}

      <section className="max-w-7xl mx-auto px-10 py-12">

        <h2 className="text-4xl font-bold text-purple-700 mb-6">
          About Hire-Radar
        </h2>

        <div className="bg-white rounded-xl shadow-lg p-8">

          <p className="text-gray-700 leading-8 text-lg">

            Hire-Radar is an intelligent recruitment platform developed
            for modern HR teams. The platform integrates with LinkedIn
            and Naukri to collect candidate profiles into a unified
            dashboard.

            Recruiters can search candidates by skills, experience,
            location, and availability while receiving automated
            percentage-based Match Scores to identify top talent quickly.

            The system centralizes hiring workflows including candidate
            tracking, profile management, assessments, analytics,
            communication, and recruitment insights.

          </p>

        </div>

      </section>

      {/* Key Features */}

      <section className="bg-white py-16">

        <div className="max-w-7xl mx-auto px-10">

          <h2 className="text-4xl font-bold text-center text-purple-700 mb-12">
            Key Features
          </h2>

          <div className="grid md:grid-cols-3 gap-8">

            <div className="bg-gray-50 p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-bold text-purple-700 mb-3">
                Multi-Platform Sourcing
              </h3>

              <p className="text-gray-600">
                Search and collect candidate profiles directly from
                LinkedIn and Naukri into a centralized system.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-bold text-purple-700 mb-3">
                Match Score Analysis
              </h3>

              <p className="text-gray-600">
                AI-driven scoring helps recruiters identify the most
                suitable candidates based on job requirements.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-bold text-purple-700 mb-3">
                Candidate Pipeline
              </h3>

              <p className="text-gray-600">
                Save, shortlist, and manage candidates throughout
                the recruitment lifecycle.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-bold text-purple-700 mb-3">
                Assessment Management
              </h3>

              <p className="text-gray-600">
                HR teams can create assessments and evaluate
                candidates through online tests.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-bold text-purple-700 mb-3">
                Analytics Dashboard
              </h3>

              <p className="text-gray-600">
                View hiring trends, search statistics, candidate
                metrics, and recruiter insights.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-bold text-purple-700 mb-3">
                Interview Scheduling
              </h3>

              <p className="text-gray-600">
                Schedule assessments and interviews with built-in
                workflow management tools.
              </p>
            </div>

          </div>

        </div>

      </section>

      {/* Recruitment Process */}

      <section className="max-w-7xl mx-auto px-10 py-16">

        <h2 className="text-4xl font-bold text-center text-purple-700 mb-12">
          Recruitment Workflow
        </h2>

        <div className="grid md:grid-cols-5 gap-4 text-center">

          <div className="bg-purple-100 p-5 rounded-lg">
            Search Candidates
          </div>

          <div className="bg-purple-100 p-5 rounded-lg">
            Analyze Profiles
          </div>

          <div className="bg-purple-100 p-5 rounded-lg">
            Conduct Assessment
          </div>

          <div className="bg-purple-100 p-5 rounded-lg">
            Schedule Interview
          </div>

          <div className="bg-purple-100 p-5 rounded-lg">
            Hire Talent
          </div>

        </div>

      </section>

      {/* Footer */}

      <footer className="bg-gray-900 text-white py-8 mt-10">

        <div className="text-center">

          <h3 className="text-2xl font-bold mb-3">
            Hire-Radar
          </h3>

          <p className="text-gray-400">
            Smart Recruitment • Better Hiring • Faster Results
          </p>

          <p className="mt-4 text-sm text-gray-500">
            © 2026 Hire-Radar. All Rights Reserved.
          </p>

        </div>

      </footer>

      {/* Support Modal */}
      {showSupport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white w-[500px] rounded-2xl shadow-2xl p-8">
            <h2 className="text-3xl font-bold text-center text-purple-700 mb-6">Developer Support</h2>

            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-bold text-lg">Developers</h3>
                <ul className="list-disc ml-6 mt-2">
                  <li>John Divine Mathew J</li>
                  <li>Vijayanandha J</li>
                  <li>Bharathsnehan</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg">Email</h3>
                <p>mathewdivine95@gmail.com</p>
                <p>vijayanandhaj@gmail.com</p>
                <p>bharathjeeva549@gmail.com</p>
              </div>

              <div>
                <h3 className="font-bold text-lg">Phone & WhatsApp</h3>
                <p>+91 9626749641</p>
                <p>+91 7373774847</p>
                <p>+91 7448540072</p>
              </div>

              <div>
                <h3 className="font-bold text-lg">Department</h3>
                <p>Automation</p>
              </div>

              <div>
                <h3 className="font-bold text-lg">Working Hours</h3>
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

    </div>
  );
};

export default Home;

function HeroButtons() {
  const navigate = useNavigate();

  return (
    <>
      <button
        onClick={() => navigate("/admin-login")}
        className="mt-2 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition">
        HR / Admin Login
      </button>

      <button
        onClick={() => navigate("/admin-user")}
         className="mt-2 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition"
      >
        User Login
      </button>

      <button
                  onClick={() => setShowSupport(true)}
                  className="mt-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition"
                >
                  Support
                </button>
    </>
  );
}