import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import Sidebar from "../components/sideBar/sideBar";
import Navbar from "../components/navBar/navBar.jsx";

const searchData = [
  { day: "May 10", value: 350 },
  { day: "May 11", value: 760 },
  { day: "May 12", value: 1150 },
  { day: "May 13", value: 780 },
  { day: "May 14", value: 1230 },
  { day: "May 15", value: 890 },
  { day: "May 16", value: 1180 },
];

const locationData = [
  { name: "Bangalore", value: 38, color: "#7E22CE" }, // Synced accents to your main purple theme
  { name: "Gujarat", value: 25, color: "#A855F7" },
  { name: "Madhya Pradesh", value: 20, color: "#C084FC" },
  { name: "Delhi", value: 17, color: "#E9D5FF" },
];

export default function Analytics() {
  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      <Sidebar />

      <div className="flex-1 p-5 overflow-y-auto">
        <Navbar />

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-[#1E293B]">Analytics</h1>
        </div>

        {/* Top Cards */}
        <div className="grid grid-cols-4 gap-5 mb-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-t-4 border-t-[#7E22CE]">
            <p className="text-[#64748B] font-medium text-sm uppercase tracking-wider">Total Searches</p>
            <h2 className="text-4xl font-bold mt-2 text-[#1E293B]">1,240</h2>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-t-4 border-t-[#7E22CE]">
            <p className="text-[#64748B] font-medium text-sm uppercase tracking-wider">Candidates Viewed</p>
            <h2 className="text-4xl font-bold mt-2 text-[#1E293B]">986</h2>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-t-4 border-t-[#7E22CE]">
            <p className="text-[#64748B] font-medium text-sm uppercase tracking-wider">Saved Candidates</p>
            <h2 className="text-4xl font-bold mt-2 text-[#1E293B]">356</h2>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-t-4 border-t-[#7E22CE]">
            <p className="text-[#64748B] font-medium text-sm uppercase tracking-wider">Avg Match Score</p>
            <h2 className="text-4xl font-bold mt-2 text-[#1E293B]">82%</h2>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-12 gap-5">
          
          {/* Search Trends with Premium Purple Gradient Shading */}
          <div className="col-span-8 min-w-0 bg-white p-5 rounded-xl border">
            <h2 className="font-bold text-lg mb-4 text-[#1E293B]">Search Trends</h2>

            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={searchData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                {/* Defining the purple gradient shade exactly like your dashboard */}
                <defs>
                  <linearGradient id="purpleShade" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7E22CE" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#7E22CE" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                
                <XAxis 
                  dataKey="day" 
                  stroke="#64748B"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#64748B"
                  domain={[0, 1400]}
                  ticks={[0, 350, 700, 1050, 1400]}
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip />
                
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#7E22CE"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#purpleShade)"
                  // Styled line dots to match your dashboard design
                  dot={{ fill: '#ffffff', stroke: '#7E22CE', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#7E22CE' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Top Locations Card */}
          <div className="col-span-4 bg-white p-5 rounded-xl border">
            <h2 className="font-bold text-lg mb-4 text-[#1E293B]">Top Locations</h2>

            <div className="flex justify-center items-center">
              <PieChart width={200} height={200}>
                <Pie
                  data={locationData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={2}
                >
                  {locationData.map((item, index) => (
                    <Cell key={index} fill={item.color} />
                  ))}
                </Pie>
              </PieChart>
            </div>

            <div className="mt-4 space-y-3">
              {locationData.map((item) => (
                <div key={item.name} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-[#64748B] font-medium">{item.name}</span>
                  </div>
                  <span className="font-semibold text-[#1E293B]">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}