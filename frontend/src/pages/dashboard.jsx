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
  
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-100">
      <Navbar />

      <div className="flex min-h-0 flex-1">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col bg-slate-50">

        {/* Header */}
        <div className="shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 bg-slate-50 p-3 sm:p-5 gap-3">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1E293B]">Dashboard</h1>

          <div className="flex items-center gap-4" />
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-5">
        {/* Top Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6">

          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border-l-4 border-purple-600 hover:shadow-xl duration-300">
             <p className="text-gray-500 text-xs sm:text-sm">Total Candidates</p>
            <h2  className="text-2xl sm:text-3xl md:text-4xl font-bold mt-2 text-purple-700">1,248</h2>
           <p className="text-green-600 mt-2 text-xs sm:text-sm">
            +14% This Week
        </p>
          </div>

         <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border-l-4 border-purple-600 hover:shadow-xl duration-300">
           <p className="text-gray-500 text-xs sm:text-sm">Active Vacancies</p>
             <h2  className="text-2xl sm:text-3xl md:text-4xl font-bold mt-2 text-purple-700">1,248</h2>
            <p className="text-green-600 mt-2 text-xs sm:text-sm">
            +23.4% this month</p>
          </div>
       <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border-l-4 border-purple-600 hover:shadow-xl duration-300">
            <p className="text-gray-500 text-xs sm:text-sm">Interviews Scheduled</p>
             <h2  className="text-2xl sm:text-3xl md:text-4xl font-bold mt-2 text-purple-700">1,248</h2>
            <p className="text-green-600 mt-2 text-xs sm:text-sm">
            +23.4% this month</p>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border-l-4 border-purple-600 hover:shadow-xl duration-300">
            <p className="text-gray-500 text-xs sm:text-sm">AI Match Success</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-2 text-purple-700">312</h2>
            <p className="text-green-600 text-xs sm:text-sm mt-2 font-semibold">+15.3% this month</p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5">

          {/* Chart Section */}
         <div className="lg:col-span-6 bg-white p-4 sm:p-5 rounded-xl border">
            <h2 className="font-bold text-base sm:text-lg mb-4 text-[#1E293B]">Candidate Hiring Trend...</h2>
            <ResponsiveContainer width="100%" height={250}>
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
           <div className="lg:col-span-3 bg-white p-4 sm:p-5 rounded-xl border">
            <h2 className="font-bold text-base sm:text-lg mb-5 text-[#1E293B]">Top Hiring Skills</h2>
 
            {skills.map((skill) => (
              <div key={skill.name} className="mb-5">
                <div className="flex justify-between mb-2 text-xs sm:text-sm font-medium">
                  <span className="text-[#1E293B] truncate">{skill.name}</span>
                  <span className="text-[#64748B] ml-2 flex-shrink-0">{skill.value}</span>
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
          <div className="lg:col-span-3 bg-white p-4 sm:p-5 rounded-xl border">
            <div className="flex justify-between mb-5 items-start">
              <h2 className="font-bold text-base sm:text-lg text-[#1E293B]">Recent Recruitment Activities</h2>
              <button className="text-[#7E22CE] font-semibold text-xs sm:text-sm hover:underline whitespace-nowrap ml-2">
                View All
              </button>
            </div>
 
            {recentSearches.map((item, i) => (
              <div key={i} className="flex items-center gap-3 mb-4">
                <div>
                  <p className="font-medium text-xs sm:text-sm text-[#1E293B] line-clamp-2">{item}</p>
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
 
