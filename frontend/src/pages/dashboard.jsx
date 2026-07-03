import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import Sidebar from "../components/sideBar/sideBar.jsx";
import Navbar from "../components/navBar/navBar.jsx";

const chartData = [
  { day: "Mon", value: 320 },
  { day: "Tue", value: 450 },
  { day: "Wed", value: 380 },
  { day: "Thu", value: 520 },
  { day: "Fri", value: 610 },
  { day: "Sat", value: 540 },
  { day: "Sun", value: 690 },
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
    <div className="flex h-screen flex-col overflow-hidden bg-[#F8FAFC]">
      <Navbar />

      <div className="flex min-h-0 flex-1">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col bg-slate-50">

        {/* Header */}
        <div className="shrink-0 flex justify-between items-center border-b border-slate-200 bg-slate-50 p-5">
          <h1 className="text-4xl font-bold text-[#1E293B]">Dashboard</h1>

          <div className="flex items-center gap-4" />
        </div>

        <div className="flex-1 overflow-y-auto p-5">
        {/* Top Cards */}
        <div className="grid grid-cols-4 gap-5 mb-6">

          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-purple-600 hover:shadow-xl duration-300">
             <p className="text-gray-500 text-sm">Total Candidates</p>
            <h2  className="text-4xl font-bold mt-2 text-purple-700">1,248</h2>
           <p className="text-green-600 mt-2">
            +14% This Week
        </p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-t-4 border-t-[#7E22CE]">
            <p className="text-[#64748B] font-medium text-sm uppercase tracking-wider">Candidates Found</p>
            <h2 className="text-4xl font-bold mt-2 text-[#1E293B]">8,732</h2>
            <p className="text-[#10B981] text-sm mt-2 font-semibold">+23.4% this month</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-t-4 border-t-[#7E22CE]">
            <p className="text-[#64748B] font-medium text-sm uppercase tracking-wider">Candidates Found</p>
            <h2 className="text-4xl font-bold mt-2 text-[#1E293B]">8,732</h2>
            <p className="text-[#10B981] text-sm mt-2 font-semibold">+23.4% this month</p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-t-4 border-t-[#7E22CE]">
            <p className="text-[#64748B] font-medium text-sm uppercase tracking-wider">Saved Candidates</p>
            <h2 className="text-4xl font-bold mt-2 text-[#1E293B]">312</h2>
            <p className="text-[#10B981] text-sm mt-2 font-semibold">+15.3% this month</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-t-4 border-t-[#7E22CE]">
            <p className="text-[#64748B] font-medium text-sm uppercase tracking-wider">Saved Candidates</p>
            <h2 className="text-4xl font-bold mt-2 text-[#1E293B]">312</h2>
            <p className="text-[#10B981] text-sm mt-2 font-semibold">+15.3% this month</p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-t-4 border-t-[#7E22CE]">
            <p className="text-[#64748B] font-medium text-sm uppercase tracking-wider">Profile Views</p>
            <h2 className="text-4xl font-bold mt-2 text-[#1E293B]">2,152</h2>
            <p className="text-[#10B981] text-sm mt-2 font-semibold">+19.2% this month</p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-12 gap-5">

          {/* Chart Section */}
          <div className="col-span-5 bg-white p-5 rounded-xl border">
            <h2 className="font-bold text-lg mb-4 text-[#1E293B]">Search Overview...</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                {/* Defining the purple gradient shade */}
                <defs>
                  <linearGradient id="purpleShade" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7E22CE" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#7E22CE" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                
                <XAxis dataKey="day" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip />
                
                {/* Changed from Line to Area */}
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#7E22CE"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#purpleShade)"
                  dot={{ fill: '#d316f9', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Skills */}
          <div className="col-span-4 bg-white p-5 rounded-xl border">
            <h2 className="font-bold text-lg mb-5 text-[#1E293B]">Top Skills Searched</h2>
            {skills.map((skill) => (
              <div key={skill.name} className="mb-5">
                <div className="flex justify-between mb-2 text-sm font-medium">
                  <span className="text-[#1E293B]">{skill.name}</span>
                  <span className="text-[#64748B]">{skill.value}</span>
                </div>

                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 rounded-full bg-[#7E22CE]"
                    style={{
                      width: `${(skill.value / 1246) * 80}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Recent Searches */}
          <div className="col-span-3 bg-white p-5 rounded-xl border">
            <div className="flex justify-between mb-5">
              <h2 className="font-bold text-lg text-[#1E293B]">Recent Searches</h2>
              <button className="text-[#7E22CE] font-semibold text-sm hover:underline">
                View All
              </button>
            </div>

            {recentSearches.map((item, i) => (
              <div key={i} className="flex items-center gap-3 mb-4">
                <div>
                  <p className="font-medium text-[#1E293B]">{item}</p>
                  <p className="text-xs text-gray-500">15 June 2026</p>
                </div>
              </div>
            ))}
          </div>

        </div>
        </div>
      </div>
      </div>
    </div>
  );
}
