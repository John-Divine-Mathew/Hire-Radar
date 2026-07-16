import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
 
import Sidebar from "../components/sideBar/sideBar.jsx";
import Navbar from "../components/navBar/navBar.jsx";
 

const manifest = [
  { label: "Total Resumes", value: "1,248" },
  { label: "Parsed", value: "1,201" },
  { label: "Failed", value: "47", danger: true },
  { label: "Today", value: "20" },
];
 
const trend = [
  { month: "Jan", value: 150 },
  { month: "Feb", value: 240 },
  { month: "Mar", value: 320 },
  { month: "Apr", value: 610 },
  { month: "May", value: 690 },
  { month: "Jun", value: 950 },
  { month: "Jul", value: 1248 },
];
 
const fileTypes = [
  { label: "PDF", count: 600, pct: 65, color: "#E8A33D" },
  { label: "DOCX", count: 256, pct: 29, color: "#7FA98C" },
  { label: "DOC", count: 48, pct: 5, color: "#687285" },
  { label: "TXT", count: 30, pct: 1, color: "#422373" },
];
 
const log = [
  { text: "20 resumes uploaded by Priya", time: "10:42", day: "Today" },
  { text: "15 resumes uploaded by Arun", time: "16:08", day: "Yesterday" },
  { text: "2 resumes failed to parse", time: "16:11", day: "Yesterday", danger: true },
  { text: "8 resumes uploaded by Priya", time: "09:20", day: "2 days ago" },
];
 
function Stamp({ children }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7A8482] mb-4">
      {children}
    </p>
  );
}
 
export default function DashboardV2() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray">
      <Navbar />
 
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col bg-gray">
 
          {/* Header */}
          <div className="shrink-0 flex items-center justify-between border-b border-white/5 px-4 sm:px-6 py-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-black">Dashboard</h1>
              <p className="text-xs text-gray mt-1">Resumes received via Import Drive</p>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-[#7A8482]">
          
            </div>
          </div>
 
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">
            
 
            {/* Manifest strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6">
              {manifest.map((m, i) => (
                <div
                  key={m.label}
                  className={`flex-1 min-w-[140px] px-5 py-4 ${i !== manifest.length - 1 ? "sm:border-r border-white/5" : ""}`}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7A8482]">
                    {m.label}
                  </p>
                  <p className={`font-mono text-2xl sm:text-3xl mt-1 ${m.danger ? "text-[#E2725B]" : "text-[#F3F1EA]"}`}>
                    {m.value}
                  </p>
                </div>
              ))}
            </div>
 
            {/* Bottom section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
 
              {/* Trend + file types */}
              <div className="lg:col-span-8 border-t-2 border-[#E8A33D] bg-gray rounded-b-xl p-5">
                <Stamp>Trend</Stamp>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={trend}>
                    <defs>
                      <linearGradient id="amberFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#E8A33D" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#E8A33D" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#1E2523" vertical={false} />
                    <XAxis dataKey="month" stroke="#7A8482" tick={{ fill: "#7A8482", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#7A8482" tick={{ fill: "#7A8482", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "#1A211F", border: "1px solid #2A322F", borderRadius: 6, color: "#F3F1EA" }} />
                    <Area type="monotone" dataKey="value" stroke="#E8A33D" strokeWidth={2} fill="url(#amberFill)" dot={{ fill: "#E8A33D", r: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
 
                <div className="mt-6 pt-5 border-t border-white/5">
                  <Stamp>File types</Stamp>
                  <div className="flex h-3 w-full rounded-full overflow-hidden bg-[#1E2523]">
                    {fileTypes.map((f) => (
                      <div key={f.label} style={{ width: `${f.pct}%`, background: f.color }} />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3">
                    {fileTypes.map((f) => (
                      <div key={f.label} className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ background: f.color }} />
                        <span className="text-xs text-[#B7BDBB]">{f.label}</span>
                        <span className="text-xs font-mono text-[#7A8482]">{f.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
 
              {/* Log */}
              <div className="lg:col-span-4 border-t-2 border-[#E8A33D] bg-[#131917] rounded-b-xl p-5">
                <Stamp>Log</Stamp>
                <div className="flex flex-col gap-4">
                  {log.map((entry, i) => (
                    <div
                      key={i}
                      className={`pl-3 border-l-2 ${entry.danger ? "border-[#E2725B]" : "border-[#E8A33D]"}`}
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <p className={`text-sm ${entry.danger ? "text-[#E2725B]" : "text-[#F3F1EA]"}`}>
                          {entry.text}
                        </p>
                        <span className="font-mono text-[10px] text-[#7A8482] shrink-0">{entry.time}</span>
                      </div>
                      <p className="text-[11px] text-[#7A8482] mt-0.5">{entry.day}</p>
                    </div>
                  ))}
                </div>
              </div>
 
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
 