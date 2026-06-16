
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import Sidebar from "../../components/sideBar/sideBar.jsx";

const chartData = [
  { day: "Mon", value: 320 },
  { day: "Tue", value: 450 },
  { day: "Wed", value: 380 },
  { day: "Thu", value: 520 },
  { day: "Fri", value: 610 },
  { day: "Sat", value: 540 },
  { day: "Sun", value: 690 },
];

const skills = [
  { name: "React", value: 980 },
  { name: "JavaScript", value: 820 },
  { name: "Node.js", value: 650 },
  { name: "Python", value: 540 },
];

const recentSearches = [
  "Frontend Developer",
  "Data Analyst",
  "Product Manager",
  "UI/UX Designer",
];

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-[#F5F6FA]">
      <Sidebar />

      <div className="flex-1 p-5 overflow-y-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold">Dashboard</h1>

          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search anything..."
              className="w-72 h-11 px-4 border rounded-lg outline-none"
            />

            <div className="bg-white rounded-lg border px-4 py-2 flex items-center gap-3">
              <img
                src="C:\Users\ELCOT\OneDrive\Pictures\Screenshots\Screenshot 2026-06-16 123628.png"
                alt=""
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-semibold">HR Admin</p>
                <p className="text-xs text-gray-500">
                  hr@company.com
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Cards */}
        <div className="grid grid-cols-4 gap-5 mb-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border">
            <p className="text-gray-500">Total Searches</p>
            <h2 className="text-4xl font-bold mt-2">1,248</h2>
            <p className="text-green-500 mt-2">+18.5% this month</p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border">
            <p className="text-gray-500">Candidates Found</p>
            <h2 className="text-4xl font-bold mt-2">8,732</h2>
            <p className="text-green-500 mt-2">+23.4% this month</p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border">
            <p className="text-gray-500">Saved Candidates</p>
            <h2 className="text-4xl font-bold mt-2">312</h2>
            <p className="text-green-500 mt-2">+15.3% this month</p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border">
            <p className="text-gray-500">Profile Views</p>
            <h2 className="text-4xl font-bold mt-2">2,152</h2>
            <p className="text-green-500 mt-2">+19.2% this month</p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-12 gap-5">

          {/* Chart */}
          <div className="col-span-5 bg-purple-100 p-5 rounded-xl border">
            <h2 className="font-bold text-lg mb-4">
              Search Overview
            </h2>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#6D4AFF"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Skills */}
          <div className="col-span-4 bg-white p-5 rounded-xl border">
            <h2 className="font-bold text-lg mb-5">
              Top Skills Searched
            </h2>

            {skills.map((skill) => (
              <div key={skill.name} className="mb-5">
                <div className="flex justify-between mb-2">
                  <span>{skill.name}</span>
                  <span>{skill.value}</span>
                </div>

                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 rounded-full bg-violet-600"
                    style={{
                      width: `${(skill.value / 1246) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Recent Searches */}
          <div className="col-span-3 bg-white p-5 rounded-xl border">
            <div className="flex justify-between mb-5">
              <h2 className="font-bold text-lg">
                Recent Searches
              </h2>
              <button className="text-violet-600">
                View All
              </button>
            </div>

            {recentSearches.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 mb-4"
              >
                <img
                  src={`https://i.pravatar.cc/40?img=${i + 1}`}
                  alt=""
                  className="w-10 h-10 rounded-full"
                />

                <div>
                  <p className="font-medium">{item}</p>
                  <p className="text-xs text-gray-500">
                    15 May 2024
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}