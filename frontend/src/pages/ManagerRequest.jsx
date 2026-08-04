import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from '../components/sideBar/sideBar.jsx';
import Navbar from "../components/navBar/navBar.jsx";

export default function ManagerRequest() {
    const [requests, setRequests] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("All");

    // State for AI JD Modal
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [aiJdData, setAiJdData] = useState(null);
    const [generatingJd, setGeneratingJd] = useState(false);

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

    // Handler to open modal and generate AI JD for the selected request
    const handleViewClick = async (item) => {
        setSelectedRequest(item);
        setAiJdData(null);
        setGeneratingJd(true);

        try {
            const response = await axios.post("http://localhost:5000/hireRadar/generate-jd", {
                jobTitle: item.job_title || item.jobtitle,
                department: item.target_department || item.department,
                experience: item.experience,
                keySkills: item.designation || item.job_title
            });
            setAiJdData(response.data);
        } catch (err) {
            console.error("Error generating AI JD:", err);
        } finally {
            setGeneratingJd(false);
        }
    };

    // Handler to delete a request
    const handleDeleteClick = async (id) => {
        if (!window.confirm("Are you sure you want to delete this recruitment request?")) return;

        try {
            await axios.delete(`http://localhost:5000/hireRadar/managerrequest/${id}`);
            // Instantly remove the deleted item from the frontend state
            setRequests((prev) => prev.filter((item) => (item.request_id || item.requestid) !== id));
        } catch (err) {
            console.error("Error deleting request:", err);
            alert("Failed to delete the request. Please try again.");
        }
    };

    const filtered = requests.filter((item) => {
        const jobTitle = item.job_title || item.jobtitle || "";
        const department = item.department || "";
        const targetDepartment = item.target_department || "";
        const managerName = item.manager_name || item.managername || "";
        const designation = item.designation || "";
        const searchLower = search.toLowerCase().trim();

        const searchMatch =
            jobTitle.toLowerCase().includes(searchLower) ||
            department.toLowerCase().includes(searchLower) ||
            targetDepartment.toLowerCase().includes(searchLower) ||
            designation.toLowerCase().includes(searchLower) ||
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
                                placeholder="Search by title, department, manager, or designation..."
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
                            <table className="w-full min-w-[1000px] border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/50">
                                        <th className="py-4 px-6 text-sm font-semibold text-gray-600">Manager</th>
                                        <th className="py-4 px-6 text-sm font-semibold text-gray-600">Designation</th>
                                        <th className="py-4 px-6 text-sm font-semibold text-gray-600">Manager Dept</th>
                                        <th className="py-4 px-6 text-sm font-semibold text-gray-600">Target Dept</th>
                                        <th className="py-4 px-6 text-sm font-semibold text-gray-600">Job Title</th>
                                        <th className="py-4 px-6 text-sm font-semibold text-gray-600">Experience</th>
                                        <th className="py-4 px-6 text-sm font-semibold text-gray-600">Openings</th>
                                        <th className="py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                                        <th className="py-4 px-6 text-sm font-semibold text-gray-600">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={10} className="text-center py-10 text-gray-500 font-medium">
                                                Loading requests...
                                            </td>
                                        </tr>
                                    ) : filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={10} className="text-center py-10 text-gray-500">
                                                No recruitment requests found.
                                            </td>
                                        </tr>
                                    ) : (
                                        filtered.map((item) => (
                                            <tr key={item.request_id || item.requestid} className="hover:bg-slate-50/80 transition duration-150">
                                                <td className="py-5 px-6">
                                                    <div className="font-semibold text-gray-900">
                                                        {item.manager_name || item.managername || "N/A"}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {item.manager_email || item.email || "N/A"}
                                                    </div>
                                                </td>
                                                <td className="py-5 px-6 text-gray-700 font-medium">
                                                    {item.designation || "N/A"}
                                                </td>
                                                <td className="py-5 px-6 text-gray-700">
                                                    {item.department || "N/A"}
                                                </td>
                                                <td className="py-5 px-6 text-gray-700">
                                                    {item.target_department || "N/A"}
                                                </td>
                                                <td className="py-5 px-6 text-gray-700 font-medium">
                                                    {item.job_title || "N/A"}
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
                                                    <div className="flex items-center gap-2">
                                                        <button 
                                                            onClick={() => handleViewClick(item)}
                                                            className="bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-blue-800 shadow-md shadow-blue-700/10 hover:shadow-lg transition flex items-center gap-1"
                                                        >
                                                            View
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteClick(item.request_id || item.requestid)}
                                                            className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-100 hover:text-red-700 border border-red-100 transition flex items-center gap-1"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
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

            {/* AI Generated Job Description Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                            <div>
                                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">AI Generated Job Description</span>
                                <h2 className="text-xl font-bold text-gray-900">{selectedRequest.job_title || selectedRequest.jobtitle}</h2>
                            </div>
                            <button 
                                onClick={() => setSelectedRequest(null)}
                                className="text-gray-400 hover:text-gray-600 text-lg font-bold p-2"
                            >
                                ✕
                            </button>
                        </div>

                        {generatingJd ? (
                            <div className="py-12 text-center text-gray-500 space-y-3">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 mx-auto"></div>
                                <p className="text-sm font-medium">Generating AI Job Description & Key Responsibilities...</p>
                            </div>
                        ) : aiJdData ? (
                            <div className="mt-4 space-y-5 text-sm text-gray-700">
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-1">Role Summary</h4>
                                    <p className="bg-slate-50 p-3 rounded-xl border border-slate-100">{aiJdData.roleSummary}</p>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-1">Key Responsibilities</h4>
                                    <ul className="list-disc pl-5 space-y-1">
                                        {aiJdData.keyResponsibilities?.map((resp, idx) => (
                                            <li key={idx}>{resp}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-1">Required Skills</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {aiJdData.requiredSkills?.map((skill, idx) => (
                                            <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-medium border border-blue-100">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                                    <div>
                                        <span className="text-xs text-gray-400">Experience Required</span>
                                        <p className="font-semibold">{aiJdData.experience}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-400">Suggested Benchmark Salary</span>
                                        <p className="font-semibold text-emerald-600">{aiJdData.suggestedSalaryRange}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="py-6 text-center text-red-500 text-sm">Failed to generate AI data. Please try again.</p>
                        )}

                        <div className="mt-6 pt-4 border-t flex justify-end">
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="bg-gray-100 text-gray-700 px-5 py-2 rounded-xl text-sm font-semibold hover:bg-gray-200 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}