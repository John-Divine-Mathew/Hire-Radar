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

const manifest = [
  { label: "Total resumes", value: "1,248" },
  { label: "Parsed", value: "1,201" },
  { label: "Failed", value: "47" },
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
  { label: "PDF", count: 600, pct: 65, color: "#7E22CE" },
  { label: "DOCX", count: 256, pct: 29, color: "#A855F7" },
  { label: "DOC", count: 48, pct: 5, color: "#C084FC" },
  { label: "TXT", count: 30, pct: 1, color: "#6B21A8" },
];

const log = [
  { text: "20 resumes uploaded by Priya", time: "10:42", day: "Today" },
  { text: "15 resumes uploaded by Arun", time: "16:08", day: "Yesterday" },
  { text: "2 resumes failed to parse", time: "16:11", day: "Yesterday" },
  { text: "8 resumes uploaded by Priya", time: "09:20", day: "2 days ago" },
];


export default function DashboardV2() {

return (
<div className="flex h-screen flex-col overflow-hidden bg-gray-100">

<Navbar />

<div className="flex min-h-0 flex-1">

<Sidebar />

<div className="flex min-w-0 flex-1 flex-col bg-slate-50">


{/* Header */}

<div className="shrink-0 border-b border-slate-200 bg-slate-50 p-3 sm:p-5">

<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1E293B]">
Dashboard
</h1>

<p className="text-sm text-gray-500 mt-1">
Resumes received via Import Drive
</p>

</div>


<div className="flex-1 overflow-y-auto p-3 sm:p-5">


{/* Cards */}

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6">

{manifest.map((m)=>(

<div
key={m.label}
className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border-l-4 border-purple-600 hover:shadow-xl duration-300"
>

<p className="text-gray-500 text-xs sm:text-sm">
{m.label}
</p>


<h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-2 text-purple-700">
{m.value}
</h2>


<p className="text-green-600 mt-2 text-xs sm:text-sm">
+14% This Week
</p>


</div>

))}

</div>



{/* Bottom */}

<div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5">



{/* Chart */}

<div className="lg:col-span-8 bg-white p-4 sm:p-5 rounded-xl border">


<h2 className="font-bold text-base sm:text-lg mb-4 text-[#1E293B]">
Resume Upload Trend
</h2>


<ResponsiveContainer width="100%" height={250}>

<AreaChart data={trend}>


<defs>

<linearGradient id="purpleShade" x1="0" y1="0" x2="0" y2="1">

<stop
offset="5%"
stopColor="#7E22CE"
stopOpacity={0.4}
/>

<stop
offset="95%"
stopColor="#7E22CE"
stopOpacity={0}
/>

</linearGradient>

</defs>


<XAxis
dataKey="month"
stroke="#64748B"
/>


<YAxis
stroke="#64748B"
/>


<Tooltip />


<Area

type="monotone"

dataKey="value"

stroke="#7E22CE"

strokeWidth={3}

fill="url(#purpleShade)"

dot={{
fill:"#d316f9",
strokeWidth:2
}}

/>

</AreaChart>

</ResponsiveContainer>


{/* File Types */}

<div className="mt-6">

<h2 className="font-bold text-base sm:text-lg mb-4 text-[#1E293B]">
File Types
</h2>


<div className="flex h-3 rounded-full overflow-hidden bg-gray-200">

{fileTypes.map((f)=>(

<div
key={f.label}
style={{
width:`${f.pct}%`,
background:f.color
}}
/>

))}

</div>



<div className="flex flex-wrap gap-5 mt-4">


{fileTypes.map((f)=>(

<div
key={f.label}
className="flex items-center gap-2"
>

<span
className="h-2 w-2 rounded-full"
style={{
background:f.color
}}
/>


<span className="text-sm text-[#1E293B]">
{f.label}
</span>


<span className="text-sm font-medium text-gray-500">
{f.count}
</span>


</div>

))}


</div>

</div>


</div>





{/* Log */}

<div className="lg:col-span-4 bg-white p-4 sm:p-5 rounded-xl border">


<h2 className="font-bold text-base sm:text-lg mb-5 text-[#1E293B]">
Recent Activities
</h2>



{log.map((item,i)=>(


<div
key={i}
className="flex items-start gap-3 mb-5"
>


<div className="h-2 w-2 mt-2 rounded-full bg-purple-600"/>


<div>

<p className="text-xs sm:text-sm font-medium text-[#1E293B]">
{item.text}
</p>


<p className="text-xs text-gray-500 mt-1">
{item.day} • {item.time}
</p>


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
 