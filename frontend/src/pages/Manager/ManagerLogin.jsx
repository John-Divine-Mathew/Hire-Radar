import { useState } from "react";
import axios from "axios";
import { Briefcase, Building2, Users, MapPin, Calendar, IndianRupee } from "lucide-react";

// Helper function to get today's date in YYYY-MM-DD format
const getTodayDate = () => new Date().toISOString().split("T")[0];

export default function ManagerLogin() {
    const [form, setForm] = useState({
        managerid: "", 
        managerName: "",
        managerEmail: "",
        department: "",             // Manager's Department
        jobTitle: "",
        targetDepartment: "",       // Department for the hiring requirement
        experience: "",
        employmentType: "Full Time",
        openings: 1,
        location: "",
        salarymin: "", 
        salarymax: "", 
        joiningDate: getTodayDate(), // Pre-filled with today's date by default
        jobPriority: "Medium",
        skills: "",
        responsibilities: "", 
        education: "",
        minimumpercentage: "",
        interviewprocess: "",
        remarks: ""
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const submitRequest = async () => {
        // Fallback: If joiningDate was cleared by the user, default to today's date
        const payload = {
            ...form,
            joiningDate: form.joiningDate || getTodayDate()
        };

        try {
            const response = await fetch("http://localhost:5000/hireRadar/managerrequest", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error("Failed to submit request");
            }

            alert("Request Submitted Successfully");
            
            // Reset form
            setForm({
                managerid: "",
                managerName: "",
                managerEmail: "",
                department: "",
                jobTitle: "",
                targetDepartment: "",
                experience: "",
                employmentType: "Full Time",
                openings: 1,
                location: "",
                salarymin: "",
                salarymax: "",
                joiningDate: getTodayDate(),
                jobPriority: "Medium",
                skills: "",
                responsibilities: "",
                education: "",
                minimumpercentage: "",
                interviewprocess: "",
                remarks: ""
            });
        } catch (err) {
            console.error(err);
            alert("Submission Failed");
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F7FB]">
            <div className="max-w-7xl mx-auto py-10">
                <div className="bg-gradient-to-r from-[#0F172A] to-[#1E3A8A] rounded-3xl p-10 text-white shadow-xl">
                    <h1 className="text-4xl font-bold">
                        Manager Recruitment Request
                    </h1>
                    <p className="mt-3 text-gray-300">
                        Submit a hiring request to HR for new employee recruitment.
                    </p>
                </div>

                <div className="bg-white rounded-3xl mt-8 shadow-lg border border-gray-200 p-10">
                    {/* Manager Information Section */}
                    <h2 className="text-2xl font-semibold mb-8">
                        Manager Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="font-medium">Manager Name</label>
                            <input
                                type="text"
                                name="managerName"
                                value={form.managerName}
                                onChange={handleChange}
                                className="w-full border rounded-xl p-3 mt-2"
                                placeholder="e.g. Mathew"
                            />
                        </div>
                        <div>
                            <label className="font-medium">Email</label>
                            <input
                                type="email"
                                name="managerEmail"
                                value={form.managerEmail}
                                onChange={handleChange}
                                className="w-full border rounded-xl p-3 mt-2"
                                placeholder="mathew@hirotecindia.com"
                            />
                        </div>
                        <div>
                            <label className="font-medium">Manager Department</label>
                            <input
                                name="department"
                                value={form.department}
                                onChange={handleChange}
                                className="w-full border rounded-xl p-3 mt-2"
                                placeholder="e.g. Automation"
                            />
                        </div>
                    </div>

                    {/* Job Requirement Section */}
                    <h2 className="text-2xl font-semibold mt-10 mb-8">
                        Job Requirement
                    </h2>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="font-medium">Job Title</label>
                            <input
                                name="jobTitle"
                                value={form.jobTitle}
                                onChange={handleChange}
                                className="w-full border rounded-xl p-3 mt-2"
                                placeholder="e.g. Design Engineer"
                            />
                        </div>
                        <div>
                            <label className="font-medium">Hiring Department</label>
                            <input
                                name="targetDepartment"
                                value={form.targetDepartment}
                                onChange={handleChange}
                                className="w-full border rounded-xl p-3 mt-2"
                                placeholder="e.g. Engineering, HR"
                            />
                        </div>
                        <div>
                            <label>Experience</label>
                            <input
                                name="experience"
                                value={form.experience}
                                onChange={handleChange}
                                className="w-full border rounded-xl p-3 mt-2"
                                placeholder="3-4 years"
                            />
                        </div>
                        <div>
                            <label>Employment Type</label>
                            <select
                                name="employmentType"
                                value={form.employmentType}
                                onChange={handleChange}
                                className="w-full border rounded-xl p-3 mt-2"
                            >
                                <option>Full Time</option>
                                <option>Part Time</option>
                                <option>Intern</option>
                                <option>Contract</option>
                            </select>
                        </div>
                        <div>
                            <label>Number of Openings / Vacancies</label>
                            <input
                                type="number"
                                name="openings"
                                value={form.openings}
                                onChange={handleChange}
                                className="w-full border rounded-xl p-3 mt-2"
                            />
                        </div>
                        <div>
                            <label>Minimum Salary (Numeric)</label>
                            <input
                                type="number"
                                name="salarymin"
                                value={form.salarymin}
                                onChange={handleChange}
                                className="w-full border rounded-xl p-3 mt-2"
                                placeholder="e.g. 50000"
                            />
                        </div>
                        <div>
                            <label>Maximum Salary (Numeric)</label>
                            <input
                                type="number"
                                name="salarymax"
                                value={form.salarymax}
                                onChange={handleChange}
                                className="w-full border rounded-xl p-3 mt-2"
                                placeholder="e.g. 90000"
                            />
                        </div>
                        <div>
                            <label>Location</label>
                            <input
                                name="location"
                                value={form.location}
                                onChange={handleChange}
                                className="w-full border rounded-xl p-3 mt-2"
                                placeholder="e.g. Chennai "
                            />
                        </div>
                        <div>
                            <label>Joining Date</label>
                            <input
                                type="date"
                                name="joiningDate"
                                value={form.joiningDate}
                                onChange={handleChange}
                                className="w-full border rounded-xl p-3 mt-2"
                            />
                        </div>
                        <div>
                            <label>Priority</label>
                            <select
                                name="jobPriority"
                                value={form.jobPriority}
                                onChange={handleChange}
                                className="w-full border rounded-xl p-3 mt-2"
                            >
                                <option>Low</option>
                                <option>Medium</option>
                                <option>High</option>
                            </select>
                        </div>
                        <div>
                            <label>Target Education</label>
                            <input
                                name="education"
                                value={form.education}
                                onChange={handleChange}
                                className="w-full border rounded-xl p-3 mt-2"
                                placeholder="e.g. B.Tech Computer Science"
                            />
                        </div>
                    </div>

                    <div className="mt-8">
                        <label>Required Skills</label>
                        <textarea
                            rows={3}
                            name="skills"
                            value={form.skills}
                            onChange={handleChange}
                            className="w-full border rounded-xl p-3 mt-2"
                        />
                    </div>

                    <div className="mt-8">
                        <label>Job Responsibilities / Description</label>
                        <textarea
                            rows={4}
                            name="responsibilities"
                            value={form.responsibilities}
                            onChange={handleChange}
                            className="w-full border rounded-xl p-3 mt-2"
                        />
                    </div>

                    <div className="mt-8">
                        <label>Interview Process Details</label>
                        <textarea
                            rows={3}
                            name="interviewprocess"
                            value={form.interviewprocess}
                            onChange={handleChange}
                            className="w-full border rounded-xl p-3 mt-2"
                            placeholder="Describe hiring rounds..."
                        />
                    </div>

                    <div className="mt-8">
                        <label>Remarks / Additional Notes</label>
                        <textarea
                            rows={3}
                            name="remarks"
                            value={form.remarks}
                            onChange={handleChange}
                            className="w-full border rounded-xl p-3 mt-2"
                        />
                    </div>

                    <div className="mt-10 flex justify-end">
                        <button
                            onClick={submitRequest}
                            className="bg-blue-700 hover:bg-blue-800 text-white px-10 py-4 rounded-xl font-semibold"
                        >
                            Submit Recruitment Request
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}