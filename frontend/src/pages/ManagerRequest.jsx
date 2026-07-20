import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from '../components/sideBar/sideBar.jsx';
import Navbar from "../components/navBar/navBar.jsx";

export default function ManagerRequest() {
    const [requests, setRequests] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("All");

    const loadRequests = async () => {
        try {
            const res = await axios.get(
                "http://localhost:5000/hireRadar/managerrequest"
            );
            setRequests(res.data);
        } catch (err) {
            console.error("Error fetching requests:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const filtered = requests.filter((item) => {
        // Handle both camelCase, snake_case, or database lowercased field names safely
        const jobTitle = item.job_title || item.jobtitle || "";
        const department = item.department || "";
        const managerName = item.manager_name || item.managername || "";
        const searchLower = search.toLowerCase().trim();

        const searchMatch =
            jobTitle.toLowerCase().includes(searchLower) ||
            department.toLowerCase().includes(searchLower) ||
            managerName.toLowerCase().includes(searchLower);

        const statusMatch =
            statusFilter === "All"
                ? true
                : item.status === statusFilter;

        return searchMatch && statusMatch;
    });

    return (
        <div className="flex h-screen flex-col overflow-hidden bg-[#F5F7FA]">
            {/* Top Navigation Bar */}
            <Navbar />

            {/* Main Layout Workspace */}
            <div className="flex flex-1 min-h-0">
                {/* Left Sidebar */}
                <Sidebar />

                {/* Right Scrollable Content Area */}
                <div className="flex min-w-0 flex-1 flex-col overflow-y-auto p-8">
                    <div className="bg-white rounded-3xl shadow-lg p-8">
                        
                        {/* Header Area */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Manager Recruitment Requests
                                </h1>
                                <p className="text-gray-500 mt-2">
                                    Requests received from Managers
                                </p>
                            </div>
                            <div>
                                <span className="inline-block bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-semibold">
                                    {filtered.length} Requests
                                </span>
                            </div>
                        </div>

                        {/* Search & Filtering Area */}
                        <div className="flex flex-wrap gap-5 mt-8">
                            <input
                                type="text"
                                placeholder="Search by job title, department, or manager..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="border border-slate-200 rounded-xl p-3 w-full md:w-96 outline-none focus:ring-2 focus:ring-blue-500 transition"
                            />

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="border border-slate-200 rounded-xl p-3 bg-white outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
                            >
                                <option>All</option>
                                <option>Pending</option>
                                <option>Approved</option>
                                <option>Rejected</option>
                            </select>
                        </div>

                        {/* Table Area Container */}
                        <div className="overflow-x-auto mt-8 border border-slate-100 rounded-2xl">
                            <table className="w-full min-w-[800px] border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/50">
                                        <th className="py-4 px-6 text-sm font-semibold text-gray-600">
                                            Manager
                                        </th>
                                        <th className="py-4 px-6 text-sm font-semibold text-gray-600">
                                            Department
                                        </th>
                                        <th className="py-4 px-6 text-sm font-semibold text-gray-600">
                                            Job Title
                                        </th>
                                        <th className="py-4 px-6 text-sm font-semibold text-gray-600">
                                            Experience
                                        </th>
                                        <th className="py-4 px-6 text-sm font-semibold text-gray-600">
                                            Openings
                                        </th>
                                        <th className="py-4 px-6 text-sm font-semibold text-gray-600">
                                            Status
                                        </th>
                                        <th className="py-4 px-6 text-sm font-semibold text-gray-600">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={7} className="text-center py-10 text-gray-500 font-medium">
                                                Loading requests...
                                            </td>
                                        </tr>
                                    ) : filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center py-10 text-gray-500">
                                                No recruitment requests found.
                                            </td>
                                        </tr>
                                    ) : (
                                        filtered.map((item) => (
                                            <tr key={item.requestid || item.request_id} className="hover:bg-slate-50/80 transition duration-150">
                                                <td className="py-5 px-6">
                                                    <div className="font-semibold text-gray-900">
                                                        {item.managername || item.manager_name || "N/A"}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {item.email || item.manager_email || "N/A"}
                                                    </div>
                                                </td>
                                                <td className="py-5 px-6 text-gray-700">
                                                    {item.department || "N/A"}
                                                </td>
                                                <td className="py-5 px-6 text-gray-700 font-medium">
                                                    {item.job_title || item.jobtitle || "N/A"}
                                                </td>
                                                <td className="py-5 px-6 text-gray-700">
                                                    {item.experience || "N/A"}
                                                </td>
                                                <td className="py-5 px-6 text-gray-700">
                                                    {item.openings ?? item.vacancies ?? 0}
                                                </td>
                                                <td className="py-5 px-6">
                                                    <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-semibold ${
                                                        item.status === "Approved"
                                                            ? "bg-green-100 text-green-700"
                                                            : item.status === "Rejected"
                                                            ? "bg-red-100 text-red-700"
                                                            : "bg-yellow-100 text-yellow-700"
                                                    }`}>
                                                        {item.status || "Pending"}
                                                    </span>
                                                </td>
                                                <td className="py-5 px-6">
                                                    <button className="bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-blue-800 shadow-md shadow-blue-700/10 hover:shadow-lg transition">
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}