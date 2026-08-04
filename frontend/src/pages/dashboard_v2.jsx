import React, { useEffect, useState } from "react";
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

// Define a color palette for dynamic file types
const FILE_TYPE_COLORS = ["#7E22CE", "#A855F7", "#C084FC", "#6B21A8", "#d8b4fe"];

export default function DashboardV2() {
  const [data, setData] = useState({
    manifest: [],
    trend: [],
    fileTypes: [],
    log: [],
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/dashboard-stats`);
        if (!response.ok) throw new Error("Failed to fetch dashboard stats");
        const resData = await response.json();

        // 1. Process Manifest
        const m = resData.manifest || {};
        const total = parseInt(m.total || 0);
        const processedManifest = [
          { label: "Total resumes", value: total.toLocaleString() },
          { label: "Parsed", value: parseInt(m.parsed || 0).toLocaleString() },
          { label: "Failed", value: parseInt(m.failed || 0).toLocaleString() },
          { label: "Today", value: parseInt(m.today || 0).toLocaleString() },
        ];

        // 2. Process Trend
        const processedTrend = (resData.trend || []).map((t) => ({
          month: t.month,
          value: parseInt(t.value),
        }));

        // 3. Process File Types
        const processedFileTypes = (resData.fileTypes || []).map((f, i) => ({
          label: f.label || "UNKNOWN",
          count: parseInt(f.count),
          pct: total > 0 ? Math.round((parseInt(f.count) / total) * 100) : 0,
          color: FILE_TYPE_COLORS[i % FILE_TYPE_COLORS.length],
        }));

        // 4. Process Logs
        const processedLogs = (resData.logs || []).map((l) => {
          const date = new Date(l.uploaded_at);
          const today = new Date();
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);

          let dayStr = date.toLocaleDateString();
          if (date.toDateString() === today.toDateString()) {
            dayStr = "Today";
          } else if (date.toDateString() === yesterday.toDateString()) {
            dayStr = "Yesterday";
          }

          const action = l.document_status === 'Failed' ? 'failed to parse' : 'uploaded';
          const name = l.username || "HR Admin";

          return {
            text: `Document "${l.file_name}" ${action} by ${name}`,
            time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            day: dayStr,
          };
        });

        setData({
          manifest: processedManifest,
          trend: processedTrend,
          fileTypes: processedFileTypes,
          log: processedLogs,
        });
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-purple-600 font-semibold">
                Loading Database Metrics...
              </div>
            ) : (
              <>
                {/* Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6">
                  {data.manifest.map((m) => (
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
                      <AreaChart data={data.trend}>
                        <defs>
                          <linearGradient
                            id="purpleShade"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
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
                        <XAxis dataKey="month" stroke="#64748B" />
                        <YAxis stroke="#64748B" />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#7E22CE"
                          strokeWidth={3}
                          fill="url(#purpleShade)"
                          dot={{
                            fill: "#d316f9",
                            strokeWidth: 2,
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
                        {data.fileTypes.map((f) => (
                          <div
                            key={f.label}
                            style={{
                              width: `${f.pct}%`,
                              background: f.color,
                            }}
                          />
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-5 mt-4">
                        {data.fileTypes.map((f) => (
                          <div
                            key={f.label}
                            className="flex items-center gap-2"
                          >
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ background: f.color }}
                            />
                            <span className="text-sm text-[#1E293B]">
                              {f.label}
                            </span>
                            <span className="text-sm font-medium text-gray-500">
                              {f.count} ({f.pct}%)
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

                    {data.log.length === 0 && (
                      <p className="text-sm text-gray-400 italic">No recent activity.</p>
                    )}

                    {data.log.map((item, i) => (
                      <div key={i} className="flex items-start gap-3 mb-5">
                        <div className="h-2 w-2 mt-2 rounded-full shrink-0 bg-purple-600" />
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-[#1E293B] line-clamp-2">
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}