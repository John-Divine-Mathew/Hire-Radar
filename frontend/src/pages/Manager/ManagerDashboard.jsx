import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  Clock3,
  CheckCircle2,
  Users,
  FilePlus2,
  LogOut,
  ArrowRight,
} from "lucide-react";

const cards = [
  {
    title: "Open Requests",
    value: 12,
    color: "bg-blue-500",
    icon: Briefcase,
  },
  {
    title: "Approved",
    value: 8,
    color: "bg-green-500",
    icon: CheckCircle2,
  },
  {
    title: "Candidates Assigned",
    value: 26,
    color: "bg-purple-500",
    icon: Users,
  },
  {
    title: "Pending",
    value: 4,
    color: "bg-orange-500",
    icon: Clock3,
  },
];

export default function ManagerDashboard() {
  const navigate = useNavigate();

  const manager =
    JSON.parse(localStorage.getItem("manager")) || {};

  return (
    <div className="min-h-screen bg-slate-100">

      {/* Header */}

      <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-violet-700 text-white shadow-lg">

        <div className="max-w-7xl mx-auto px-8 py-8 flex justify-between items-center">

          <div>

            <h1 className="text-4xl font-bold">
              Manager Dashboard
            </h1>

            <p className="text-indigo-100 mt-2">
              Welcome {manager.fullname}
            </p>

          </div>

          <button
            onClick={() => {
              localStorage.removeItem("manager");
              navigate("/manager-login");
            }}
            className="flex items-center gap-2 bg-white text-indigo-700 px-6 py-3 rounded-xl font-semibold hover:shadow-xl"
          >
            <LogOut size={20} />
            Logout
          </button>

        </div>

      </div>

      {/* Cards */}

      <div className="max-w-7xl mx-auto px-8 mt-10">

        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">

          {cards.map((item, index) => {

            const Icon = item.icon;

            return (

              <div
                key={index}
                className="bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 p-8"
              >

                <div
                  className={`${item.color} w-16 h-16 rounded-2xl flex items-center justify-center text-white`}
                >
                  <Icon size={32} />
                </div>

                <h2 className="mt-6 text-gray-500 font-medium">

                  {item.title}

                </h2>

                <h1 className="text-5xl font-bold mt-3">

                  {item.value}

                </h1>

              </div>

            );
          })}

        </div>

      </div>

      {/* Actions */}

      <div className="max-w-7xl mx-auto px-8 mt-12">

        <div className="grid lg:grid-cols-2 gap-8">

          {/* Create */}

          <div className="bg-white rounded-3xl p-10 shadow-md">

            <div className="flex items-center gap-4">

              <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white">

                <FilePlus2 size={30} />

              </div>

              <div>

                <h2 className="text-2xl font-bold">

                  Create Hiring Request

                </h2>

                <p className="text-gray-500 mt-2">

                  Create a new manpower request for HR.

                </p>

              </div>

            </div>

            <button
              onClick={() =>
                navigate("/manager/create-request")
              }
              className="mt-10 bg-indigo-700 hover:bg-indigo-800 text-white px-8 py-4 rounded-xl flex items-center gap-3"
            >
              Create Request

              <ArrowRight size={20} />

            </button>

          </div>

          {/* Requests */}

          <div className="bg-white rounded-3xl p-10 shadow-md">

            <div className="flex items-center gap-4">

              <div className="bg-green-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white">

                <Briefcase size={30} />

              </div>

              <div>

                <h2 className="text-2xl font-bold">

                  My Requests

                </h2>

                <p className="text-gray-500 mt-2">

                  View request history and recruitment status.

                </p>

              </div>

            </div>

            <button
              onClick={() =>
                navigate("/manager/my-requests")
              }
              className="mt-10 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl flex items-center gap-3"
            >
              View Requests

              <ArrowRight size={20} />

            </button>

          </div>

        </div>

      </div>

      {/* Information */}

      <div className="max-w-7xl mx-auto px-8 mt-10 mb-10">

        <div className="bg-white rounded-3xl shadow-md p-8">

          <h2 className="text-2xl font-bold text-gray-800">

            Recruitment Workflow

          </h2>

          <div className="grid lg:grid-cols-5 gap-6 mt-8">

            {[
              "Create Request",
              "HR Review",
              "Candidate Search",
              "Interview",
              "Hiring",
            ].map((step, index) => (

              <div
                key={index}
                className="border rounded-2xl p-6 text-center hover:bg-indigo-50 transition"
              >

                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center mx-auto font-bold">

                  {index + 1}

                </div>

                <p className="mt-5 font-semibold">

                  {step}

                </p>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>
  );
}