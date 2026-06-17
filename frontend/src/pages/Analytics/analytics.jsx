
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
import Sidebar from "../../components/sideBar/sideBar.jsx";

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

const COLORS = [
  "#5B3DF5",
  "#7C5CFF",
  "#F4C542",
  "#33b67b",
  "#8B8B8B",
];

export default function Analytics() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <div className="flex-1 min-h-screen bg-gray-100 p-6 overflow-x-hidden">
        <h1 className="text-4xl font-bold text-black-900 mb-6">
          Analytics
        </h1>

        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            ["Total Searches", "1,248"],
            ["Candidates Viewed", "5,742"],
            ["Saved Candidates", "312"],
            ["Avg Match Score", "78%"],
          ].map(([title, value]) => (
            <div
              key={title}
              className="bg-white p-5 rounded-lg border border-purple-200 shadow-sm"
            >
              <h2 className="text-sm text-purple-500">{title}</h2>

              <p className="text-3xl font-bold text-gray-900 mt-2">
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Search Trends */}
          <div className="lg:col-span-8 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="font-semibold text-gray-800 mb-4">
              Search Trends
            </h2>

            <ResponsiveContainer width="100%" height={350}>
              <LineChart
                data={trendData}
                margin={{
                  top: 20,
                  right: 20,
                  left: 10,
                  bottom: 10,
                }}
              >
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11 }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11 }}
                />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#5B3DF5"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#5B3DF5" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top Locations */}
          <div className="lg:col-span-4 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="font-semibold text-gray-800 mb-4">
              Top Locations
            </h2>

            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={locationData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                  >
                    {locationData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={COLORS[index]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="w-full space-y-3 mt-4">
                {locationData.map((item, index) => (
                  <div
                    key={item.name}
                    className="flex justify-between items-center text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: COLORS[index],
                        }}
                      />

                      <span className="text-gray-700">
                        {item.name}
                      </span>
                    </div>

                    <span className="font-medium text-gray-700">
                      {item.value}%
                    </span>
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