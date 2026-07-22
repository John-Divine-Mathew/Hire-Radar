import React, { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Sidebar from "../components/sideBar/sideBar";
import Navbar from "../components/navBar/navBar.jsx";
import {
  TrendingUp,
  Users,
  Briefcase,
  Clock,
  Download,
  CheckCircle,
} from "lucide-react";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ================= DATA DEFINITIONS =================
const vacancyData = [
  { month: "Jan", open: 12, filled: 8, pending: 4 },
  { month: "Feb", open: 15, filled: 10, pending: 5 },
  { month: "Mar", open: 18, filled: 14, pending: 4 },
  { month: "Apr", open: 20, filled: 16, pending: 4 },
  { month: "May", open: 22, filled: 18, pending: 4 },
  { month: "Jun", open: 25, filled: 21, pending: 4 },
];

const vacancyByDept = [
  { name: "Engineering", value: 12, color: "#7E22CE" },
  { name: "Sales", value: 8, color: "#A855F7" },
  { name: "HR", value: 4, color: "#C084FC" },
  { name: "Operations", value: 3, color: "#E9D5FF" },
];

const recruiterPerformance = [
  { name: "John Smith", candidates: 45, hired: 12, efficiency: 26.7 },
  { name: "Sarah Johnson", candidates: 38, hired: 11, efficiency: 28.9 },
  { name: "Mike Davis", candidates: 42, hired: 10, efficiency: 23.8 },
  { name: "Emma Wilson", candidates: 35, hired: 9, efficiency: 25.7 },
  { name: "Alex Brown", candidates: 40, hired: 8, efficiency: 20 },
];

const recruiterActivityData = [
  { week: "Week 1", calls: 120, emails: 85, meetings: 15 },
  { week: "Week 2", calls: 135, emails: 92, meetings: 18 },
  { week: "Week 3", calls: 128, emails: 88, meetings: 16 },
  { week: "Week 4", calls: 145, emails: 98, meetings: 20 },
];

const interviewData = [
  { month: "Jan", scheduled: 35, completed: 32, passed: 24, failed: 8 },
  { month: "Feb", scheduled: 42, completed: 40, passed: 30, failed: 10 },
  { month: "Mar", scheduled: 38, completed: 38, passed: 28, failed: 10 },
  { month: "Apr", scheduled: 45, completed: 43, passed: 32, failed: 11 },
  { month: "May", scheduled: 48, completed: 46, passed: 35, failed: 11 },
  { month: "Jun", scheduled: 52, completed: 50, passed: 38, failed: 12 },
];

const interviewByRound = [
  { name: "Round 1", value: 180, color: "#7E22CE" },
  { name: "Round 2", value: 120, color: "#A855F7" },
  { name: "Round 3", value: 85, color: "#C084FC" },
  { name: "Final", value: 55, color: "#E9D5FF" },
];

// Totals for Calculations
const totalVacancyDept = vacancyByDept.reduce((acc, curr) => acc + curr.value, 0);
const totalInterviewRound = interviewByRound.reduce((acc, curr) => acc + curr.value, 0);

const renderPercentageLabel = ({ percent }) => `${(percent * 100).toFixed(1)}%`;

// ================= UI SUB-COMPONENTS =================
const StatCard = ({ icon: Icon, label, value, change, color }) => (
  <div
    className="bg-white rounded-xl p-5 shadow-sm border border-t-4"
    style={{ borderTopColor: color }}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[#64748B] font-medium text-sm uppercase tracking-wider">
          {label}
        </p>
        <h2 className="text-4xl font-bold mt-2 text-[#1E293B]">{value}</h2>
        {change && (
          <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
            <TrendingUp size={16} /> {change}
          </p>
        )}
      </div>
      <Icon size={40} className="text-[#7E22CE] opacity-20" />
    </div>
  </div>
);

const ReportSection = ({ title, children, icon: Icon }) => (
  <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
    <div className="bg-gradient-to-r from-purple-50 to-transparent p-5 border-b flex items-center gap-3">
      {Icon && <Icon size={24} className="text-[#7E22CE]" />}
      <h2 className="font-bold text-lg text-[#1E293B]">{title}</h2>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

// ================= DASHBOARD TAB VIEWS =================
const VacancyReportContent = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-4 gap-5">
      <StatCard icon={Briefcase} label="Total Vacancies" value="48" change="+8% this month" color="#7E22CE" />
      <StatCard icon={Users} label="Filled Positions" value="36" change="+6 this month" color="#7E22CE" />
      <StatCard icon={Clock} label="Pending Positions" value="12" change="-2 this month" color="#7E22CE" />
      <StatCard icon={TrendingUp} label="Fill Rate" value="75%" change="+5% this month" color="#7E22CE" />
    </div>

    <ReportSection title="Vacancy Trends - Monthly Overview" icon={TrendingUp}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={vacancyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="open" fill="#7E22CE" name="Open Vacancies" />
          <Bar dataKey="filled" fill="#10B981" name="Filled" />
          <Bar dataKey="pending" fill="#F59E0B" name="Pending" />
        </BarChart>
      </ResponsiveContainer>
    </ReportSection>

    <div className="grid grid-cols-2 gap-5">
      <ReportSection title="Vacancies by Department (%)">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={vacancyByDept}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={90}
              paddingAngle={2}
              labelLine={true}
              label={renderPercentageLabel}
            >
              {vacancyByDept.map((item, index) => (
                <Cell key={index} fill={item.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [
                `${value} (${((value / totalVacancyDept) * 100).toFixed(1)}%)`,
                name,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </ReportSection>

      <ReportSection title="Department Details">
        <div className="space-y-4">
          {vacancyByDept.map((dept) => {
            const percentage = ((dept.value / totalVacancyDept) * 100).toFixed(1);
            return (
              <div key={dept.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: dept.color }} />
                  <span className="font-medium text-[#1E293B]">{dept.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-500">{percentage}%</span>
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold">
                    {dept.value}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </ReportSection>
    </div>
  </div>
);

const RecruiterReportContent = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-4 gap-5">
      <StatCard icon={Users} label="Total Recruiters" value="5" change="All active" color="#7E22CE" />
      <StatCard icon={Users} label="Candidates Sourced" value="200" change="+45 this month" color="#7E22CE" />
      <StatCard icon={TrendingUp} label="Total Hired" value="50" change="+12 this month" color="#7E22CE" />
      <StatCard icon={TrendingUp} label="Avg Efficiency" value="25%" change="+2% this month" color="#7E22CE" />
    </div>

    <ReportSection title="Recruiter Activity - Weekly Metrics" icon={TrendingUp}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={recruiterActivityData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="calls" stroke="#7E22CE" strokeWidth={2} name="Calls" />
          <Line type="monotone" dataKey="emails" stroke="#A855F7" strokeWidth={2} name="Emails" />
          <Line type="monotone" dataKey="meetings" stroke="#10B981" strokeWidth={2} name="Meetings" />
        </LineChart>
      </ResponsiveContainer>
    </ReportSection>

    <ReportSection title="Top Recruiter Performance">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-3 px-4 font-semibold text-[#1E293B]">Recruiter</th>
              <th className="text-right py-3 px-4 font-semibold text-[#1E293B]">Candidates</th>
              <th className="text-right py-3 px-4 font-semibold text-[#1E293B]">Hired</th>
              <th className="text-right py-3 px-4 font-semibold text-[#1E293B]">Efficiency</th>
            </tr>
          </thead>
          <tbody>
            {recruiterPerformance.map((recruiter) => (
              <tr key={recruiter.name} className="border-b border-slate-100 hover:bg-purple-50 transition">
                <td className="py-3 px-4 font-medium text-[#1E293B]">{recruiter.name}</td>
                <td className="text-right py-3 px-4 text-[#64748B]">{recruiter.candidates}</td>
                <td className="text-right py-3 px-4">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                    {recruiter.hired}
                  </span>
                </td>
                <td className="text-right py-3 px-4">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">
                    {recruiter.efficiency.toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ReportSection>
  </div>
);

const InterviewReportContent = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-4 gap-5">
      <StatCard icon={Clock} label="Total Scheduled" value="260" change="+48 this month" color="#7E22CE" />
      <StatCard icon={Users} label="Completed" value="249" change="+46 this month" color="#7E22CE" />
      <StatCard icon={TrendingUp} label="Success Rate" value="78%" change="+2% this month" color="#7E22CE" />
      <StatCard icon={TrendingUp} label="Avg Duration" value="45 min" change="Consistent" color="#7E22CE" />
    </div>

    <ReportSection title="Interview Pipeline - Monthly Overview" icon={TrendingUp}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={interviewData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="scheduled" fill="#7E22CE" name="Scheduled" />
          <Bar dataKey="completed" fill="#A855F7" name="Completed" />
          <Bar dataKey="passed" fill="#10B981" name="Passed" />
          <Bar dataKey="failed" fill="#EF4444" name="Failed" />
        </BarChart>
      </ResponsiveContainer>
    </ReportSection>

    <div className="grid grid-cols-2 gap-5">
      <ReportSection title="Interviews by Round (%)">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={interviewByRound}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={90}
              paddingAngle={2}
              labelLine={true}
              label={renderPercentageLabel}
            >
              {interviewByRound.map((item, index) => (
                <Cell key={index} fill={item.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [
                `${value} (${((value / totalInterviewRound) * 100).toFixed(1)}%)`,
                name,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </ReportSection>

      <ReportSection title="Round Details">
        <div className="space-y-4">
          {interviewByRound.map((round) => {
            const percentage = ((round.value / totalInterviewRound) * 100).toFixed(1);
            return (
              <div key={round.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: round.color }} />
                  <span className="font-medium text-[#1E293B]">{round.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-500">{percentage}%</span>
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold">
                    {round.value}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </ReportSection>
    </div>
  </div>
);

// ================= MAIN COMPONENT =================
export default function Report() {
  const [activeTab, setActiveTab] = useState("vacancy");
  const [showDownloadPopup, setShowDownloadPopup] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Pure Text & Table Native PDF Generator Function
  const handleDownload = () => {
    setIsExporting(true);

    try {
      const doc = new jsPDF("p", "pt", "a4");

      // Main Title
      doc.setFontSize(22);
      doc.setTextColor(126, 34, 206); // Purple #7E22CE
      doc.setFont("helvetica", "bold");
      doc.text("Recruitment Executive Summary Report", 40, 45);

      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated Date: ${new Date().toLocaleDateString()}`, 40, 60);

      // --- SECTION 1: VACANCY REPORT ---
      doc.setFontSize(15);
      doc.setTextColor(30, 41, 59);
      doc.setFont("helvetica", "bold");
      doc.text("1. Vacancy Report", 40, 90);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        "Total Vacancies: 48  |  Filled: 36  |  Pending: 12  |  Fill Rate: 75.0%",
        40,
        105
      );

      // Table 1: Department Share
      autoTable(doc, {
        startY: 115,
        head: [["Department", "Open Vacancies", "Department Share (%)"]],
        body: vacancyByDept.map((dept) => [
          dept.name,
          dept.value,
          `${((dept.value / totalVacancyDept) * 100).toFixed(1)}%`,
        ]),
        headStyles: { fillColor: [126, 34, 206] },
        theme: "striped",
      });

      // Table 2: Monthly Vacancy Overview
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 15,
        head: [["Month", "Open Vacancies", "Filled Positions", "Pending Positions"]],
        body: vacancyData.map((d) => [d.month, d.open, d.filled, d.pending]),
        headStyles: { fillColor: [126, 34, 206] },
        theme: "grid",
      });

      // --- SECTION 2: RECRUITER REPORT ---
      let nextY = doc.lastAutoTable.finalY + 30;

      doc.setFontSize(15);
      doc.setTextColor(30, 41, 59);
      doc.setFont("helvetica", "bold");
      doc.text("2. Recruiter Report", 40, nextY);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        "Active Recruiters: 5  |  Candidates Sourced: 200  |  Total Hired: 50  |  Avg Efficiency: 25.0%",
        40,
        nextY + 15
      );

      // Table 3: Recruiter Performance
      autoTable(doc, {
        startY: nextY + 25,
        head: [["Recruiter Name", "Candidates Sourced", "Hired", "Efficiency (%)"]],
        body: recruiterPerformance.map((r) => [
          r.name,
          r.candidates,
          r.hired,
          `${r.efficiency.toFixed(1)}%`,
        ]),
        headStyles: { fillColor: [126, 34, 206] },
        theme: "striped",
      });

      // Table 4: Weekly Recruiter Activity
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 15,
        head: [["Week", "Calls Made", "Emails Sent", "Meetings Held"]],
        body: recruiterActivityData.map((a) => [a.week, a.calls, a.emails, a.meetings]),
        headStyles: { fillColor: [126, 34, 206] },
        theme: "grid",
      });

      // --- PAGE 2 BREAK ---
      doc.addPage();

      // --- SECTION 3: INTERVIEW REPORT ---
      doc.setFontSize(15);
      doc.setTextColor(30, 41, 59);
      doc.setFont("helvetica", "bold");
      doc.text("3. Interview Report", 40, 45);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        "Total Scheduled: 260  |  Completed: 249  |  Success Rate: 78.0%  |  Avg Duration: 45 min",
        40,
        60
      );

      // Table 5: Interview Rounds Breakdown
      autoTable(doc, {
        startY: 70,
        head: [["Interview Round", "Total Candidates", "Round Share (%)"]],
        body: interviewByRound.map((round) => [
          round.name,
          round.value,
          `${((round.value / totalInterviewRound) * 100).toFixed(1)}%`,
        ]),
        headStyles: { fillColor: [126, 34, 206] },
        theme: "striped",
      });

      // Table 6: Monthly Interview Overview
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 15,
        head: [["Month", "Scheduled", "Completed", "Passed", "Failed"]],
        body: interviewData.map((i) => [
          i.month,
          i.scheduled,
          i.completed,
          i.passed,
          i.failed,
        ]),
        headStyles: { fillColor: [126, 34, 206] },
        theme: "grid",
      });

      // Save PDF file
      doc.save(`Recruitment_Full_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
      setShowDownloadPopup(true);
    } catch (error) {
      console.error("Error generating text PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-[#F8FAFC]">
      <Navbar />

      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col bg-slate-50">
          {/* Header */}
          <div className="shrink-0 flex justify-between items-center border-b border-slate-200 bg-slate-50 p-5">
            <h1 className="text-4xl font-bold text-[#1E293B]">Reports</h1>

            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-5 py-3 rounded-lg font-semibold shadow transition cursor-pointer"
            >
              <Download size={20} />
              {isExporting ? "Generating PDF..." : "Download Full Report"}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {/* Tab Navigation */}
            <div className="flex gap-4 mb-6">
              {["vacancy", "recruiter", "interview"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
                    activeTab === tab
                      ? "bg-purple-600 text-white shadow-md"
                      : "bg-white text-[#1E293B] border border-slate-200 hover:border-purple-600"
                  }`}
                >
                  {tab === "vacancy" && "Vacancy Reports"}
                  {tab === "recruiter" && "Recruiter Reports"}
                  {tab === "interview" && "Interview Reports"}
                </button>
              ))}
            </div>

            {/* Display active tab content */}
            <div className="p-2 bg-slate-50 space-y-6">
              {activeTab === "vacancy" && <VacancyReportContent />}
              {activeTab === "recruiter" && <RecruiterReportContent />}
              {activeTab === "interview" && <InterviewReportContent />}
            </div>
          </div>
        </div>
      </div>

      {/* Success Popup Modal */}
      {showDownloadPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-10 w-[500px] max-w-[90%] text-center">
            <CheckCircle size={90} className="mx-auto text-green-500 mb-6" />

            <h2 className="text-3xl font-bold text-slate-800 mb-3">Download Successful</h2>

            <p className="text-slate-600 text-lg mb-8">
              Your combined text & percentage data PDF report has been generated and saved.
            </p>

            <button
              onClick={() => setShowDownloadPopup(false)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}