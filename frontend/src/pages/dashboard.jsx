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

{month:"Jan",value:220},

{month:"Feb",value:310},

{month:"Mar",value:420},

{month:"Apr",value:610},

{month:"May",value:720},

{month:"Jun",value:950},

{month:"Jul",value:1100},

];
const skills=[

{name:"React Developer",value:98},

{name:"Java Full Stack",value:92},

{name:"Automation Testing",value:89},

{name:"Python Developer",value:84},

{name:"Mechanical Design",value:76},

{name:"Quality Assurance",value:70},

];

const recentSearches=[

"Software Engineer shortlisted",

"Interview scheduled for QA Engineer",

"AI sourced 124 candidates",

"Mechanical Designer hired",

"Python Developer assessment completed",

"Production Engineer added",

];

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const userName = user?.name || "HR Admin";
  const userEmail = user?.email || "hr@company.com";

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#F8FAFC]">
      <Navbar />

      <div className="flex min-h-0 flex-1">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col bg-slate-50">

        {/* Header */}
        <div className="shrink-0 flex justify-between items-center border-b border-slate-200 bg-slate-50 p-5">
          <h1 className="text-4xl font-bold text-[#1E293B]">Dashboard</h1>

          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search anything..."
              className="w-72 h-11 px-4 border rounded-lg outline-none focus:border-[#7E22CE]"
            />

            <div className="bg-white rounded-lg border px-4 py-2 flex items-center gap-3">
              <div>
                <p className="font-semibold text-[#1E293B]">{userName}</p>
                <p className="text-xs text-gray-500">{userEmail}</p>
              </div>  
            </div>
          </div>
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

    <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-purple-600 hover:shadow-xl duration-300">

        <p className="text-gray-500 text-sm">
            Active Vacancies
        </p>

        <h2 className="text-4xl font-bold mt-2 text-purple-700">
            48
        </h2>

        <p className="text-green-600 mt-2">
            12 New Openings
        </p>

    </div>

    <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-purple-600 hover:shadow-xl duration-300">

        <p className="text-gray-500 text-sm">
            Interviews Scheduled
        </p>

        <h2 className="text-4xl font-bold mt-2 text-purple-700">
            126
        </h2>

        <p className="text-green-600 mt-2">
            Today : 18
        </p>

    </div>

    <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-purple-600 hover:shadow-xl duration-300">

        <p className="text-gray-500 text-sm">
            AI Match Success
        </p>

        <h2 className="text-4xl font-bold mt-2 text-purple-600">
            91%
        </h2>

        <p className="text-green-600 mt-2">
            Excellent Matching
        </p>

    </div>

</div>
        {/* Bottom Section */}
        <div className="grid grid-cols-12 gap-5">

          {/* Chart Section */}
          <div className="col-span-5 bg-white p-5 rounded-xl border">
            <h2 className="font-bold text-lg mb-4 text-[#1E293B]">Candidate Hiring Trend...</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                {/* Defining the purple gradient shade */}
                <defs>
                  <linearGradient id="purpleShade" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7E22CE" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#7E22CE" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                
                <XAxis dataKey="month" stroke="#64748B" />
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
            <h2 className="font-bold text-lg mb-5 text-[#1E293B]">Top Hiring Skills</h2>

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
                   width:`${skill.value}%`
                    }}
                  />  
                </div>
              </div>
            ))}
          </div>

          {/* Recent Searches */}
          <div className="col-span-3 bg-white p-5 rounded-xl border">
            <div className="flex justify-between mb-5">
              <h2 className="font-bold text-lg text-[#1E293B]">Recent Recruitment Activities</h2>
              <button className="text-[#7E22CE] font-semibold text-sm hover:underline">
                View All
              </button>
            </div>

            {recentSearches.map((item, i) => (
              <div key={i} className="flex items-center gap-3 mb-4">
                <div>
                  <p className="font-medium text-[#1E293B]">{item}</p>
                  <p className="text-xs text-gray-500">Today  2026</p>
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
