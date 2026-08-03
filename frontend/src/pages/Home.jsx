import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";

const Home = () => {
  const [showSupport, setShowSupport] = useState(false);
  return (
    <div className="bg-slate-50 min-h-screen">

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#4F46E5] via-[#6D28D9] to-[#9333EA] text-white py-20">

        <div className="max-w-7xl mx-auto px-10">

          <div className="text-center">

            {/* Project Logo - centered, professionally framed */}
            <div className="flex justify-center items-center mb-7">
              <div className="p-3 bg-white/10 border border-white/20 rounded-2xl backdrop-blur shadow-xl">
                <img
                  src="/Hire-Radar.png"
                  alt="Hire-Radar Logo"
                  className="w-24 h-auto object-contain drop-shadow-2xl"
                />
              </div>
            </div>

            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm font-medium text-purple-100 mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered Recruitment Intelligence
            </span>

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
                <HeroButtons setShowSupport={setShowSupport} />
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

        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">

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

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-gray-100">
              <h3 className="text-xl font-bold text-purple-700 mb-3">
                Multi-Platform Sourcing
              </h3>
              <p className="text-gray-600">
                Search and collect candidate profiles directly from
                LinkedIn and Naukri into a centralized system.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100">
              <h3 className="text-xl font-bold text-purple-700 mb-3">
                Match Score Analysis
              </h3>
              <p className="text-gray-600">
                AI-driven scoring helps recruiters identify the most
                suitable candidates based on job requirements.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100">
              <h3 className="text-xl font-bold text-purple-700 mb-3">
                Candidate Pipeline
              </h3>
              <p className="text-gray-600">
                Save, shortlist, and manage candidates throughout
                the recruitment lifecycle.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100">
              <h3 className="text-xl font-bold text-purple-700 mb-3">
                Assessment Management
              </h3>
              <p className="text-gray-600">
                HR teams can create assessments and evaluate
                candidates through online tests.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100">
              <h3 className="text-xl font-bold text-purple-700 mb-3">
                Analytics Dashboard
              </h3>
              <p className="text-gray-600">
                View hiring trends, search statistics, candidate
                metrics, and recruiter insights.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100">
              <h3 className="text-xl font-bold text-purple-700 mb-3">
                Interview Scheduling
              </h3>
              <p className="text-gray-600">
                Schedule assessments and interviews with built-in
                workflow management tools.
              </p>
            </div>

            {/* NEW: AI Job Description Generator */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100">
              <h3 className="text-xl font-bold text-purple-700 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                AI Job Description Generator
              </h3>
              <p className="text-gray-600">
                Type in a job title and instantly get a professional
                job description with responsibilities and the exact
                technical skills to screen for.
              </p>
            </div>

            {/* NEW: Recruiter Collaboration */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100">
              <h3 className="text-xl font-bold text-purple-700 mb-3">
                Recruiter Collaboration
              </h3>
              <p className="text-gray-600">
                Share shortlists, leave candidate notes, and keep
                hiring managers aligned in one shared workspace.
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

          <div className="bg-white rounded-xl shadow-lg p-6 hover:scale-105 transition-all border border-gray-100">
            Search Candidates
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:scale-105 transition-all border border-gray-100">
            Analyze Profiles
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:scale-105 transition-all border border-gray-100">
            Conduct Assessment
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:scale-105 transition-all border border-gray-100">
            Schedule Interview
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:scale-105 transition-all border border-gray-100">
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

          <div className="mt-6">

  <button
    onClick={() => setShowSupport(true)}
    className="text-sm text-gray-300 hover:text-white underline underline-offset-4 transition"
  >
    Developer Support
  </button>

</div>

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
                <p>bharathsnehan011@gmail.com</p>
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

function HeroButtons({ setShowSupport }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-wrap justify-center gap-5">

      {/* HR */}

      <button
        onClick={() => navigate("/admin-login")}
        className="px-8 py-4 rounded-xl bg-green-500 hover:bg-green-600 font-semibold shadow-xl transition-all duration-300 hover:scale-105"
      >
        HR / Admin Login
      </button>

       {/* Manager Login */}

      <button
        onClick={() => navigate("/manager-login")}
        className="px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-semibold shadow-xl transition-all duration-300 hover:scale-105"
      >
        Manager Login
      </button>


      {/* Candidate */}

      <button
        onClick={() => navigate("/admin-user")}
        className="px-8 py-4 rounded-xl bg-red-500 hover:bg-red-600 font-semibold shadow-xl transition-all duration-300 hover:scale-105"
      >
        Candidate Login
      </button>

    </div>
  );
}