
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Sidebar from "../components/sideBar/sideBar.jsx";

const trendData = [
  { day: "May 10", value: 400 },
  { day: "May 11", value: 900 },
  { day: "May 12", value: 1400 },
  { day: "May 13", value: 560 },
  { day: "May 14", value: 1400 },
  { day: "May 15", value: 1250 },
  { day: "May 16", value: 1600 },
];

const locationData = [
  { name: "Bangalore", value: 38 },
  { name: "Chennai", value: 22 },
  { name: "Pune", value: 18 },
  { name: "Hyderabad", value: 12 },
  { name: "Others", value: 10 },
];

// Reconstructed color palette using the brand colors from Screenshot 2026-06-29 093736.jpg
const COLORS = ["#7E22CE", "#0cbedd", "#1045b9", "#A855F7", "#64748B"];

const stats = [
  { label: "Total Searches", value: "1,248" },
  { label: "Candidates Viewed", value: "5,742" },
  { label: "Saved Candidates", value: "312" },
  { label: "Avg Match Score", value: "78%" },
];

export default function Analytics() {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-[#1E293B]">Analytics</h1>
              <p className="text-sm text-gray-500 mt-1">
                Overview of recent activity and top locations
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-white border rounded-md text-sm text-[#7E22CE] shadow-sm hover:bg-gray-50 transition-colors">
                Export
              </button>
              <button className="px-4 py-2 bg-[#7E22CE] text-white rounded-md text-sm font-semibold shadow hover:bg-[#6b21a8] transition-colors">
                New Report
              </button>
            </div>
          </div>

          {/* Top Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((s, idx) => (
              <div 
                key={s.label} 
                className={`bg-white p-5 rounded-lg shadow-sm border border-t-4 ${
                  idx === 1 || idx === 2 ? "border-t-[#7E22CE]" : "border-t-[#7E22CE]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-500">{s.label}</h3>
                  <span className="text-xs text-gray-400">Updated</span>
                </div>
                <p className="mt-3 text-2xl font-bold text-[#1E293B]">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <section className="lg:col-span-8 bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#1E293B]">Search Trends</h2>
                <p className="text-sm text-gray-500">Last 7 days</p>
              </div>

              <div style={{ height: 210 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#7E22CE" 
                      strokeWidth={3} 
                      dot={{ r: 3, fill: '#b916f9', strokeWidth: 0 }} 
                      activeDot={{ r: 6, fill: '#000000' }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>

            <aside className="lg:col-span-4 bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#1E293B]">Top Locations</h2>
                <p className="text-sm text-gray-500">Distribution</p>
              </div>

              <div className="flex flex-col lg:flex-row items-center gap-6">
                <div className="w-full lg:w-1/2">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={locationData} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={4}>
                        {locationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="w-full lg:w-1/6">
                  <ul className="space-y-3">
                    {locationData.map((item, index) => (
                      <li key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="text-sm text-gray-700">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium text-[#1E293B]">{item.value}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}