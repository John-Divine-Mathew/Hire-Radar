import { useState } from "react";
import axios from "axios";
import { Briefcase, Building2, Users, MapPin, Calendar, IndianRupee } from "lucide-react";

export default function ManagerLogin() {

    const [form, setForm] = useState({

        managerName: "",
        managerEmail: "",
        department: "",
        designation: "",
        jobTitle: "",
        experience: "",
        employmentType: "Full Time",
        openings: 1,
        location: "",
        salary: "",
        joiningDate: "",
        skills: "",
        responsibilities: "",
        qualifications: "",
        notes: ""

    });

    const handleChange = (e) => {

        setForm({

            ...form,

            [e.target.name]: e.target.value

        });

    };

    const submitRequest = async () => {

        try {

            await axios.post(

                "http://localhost:5000/hireRadar/managerrequest",

                form

            );

            alert("Request Submitted Successfully");

            setForm({

                managerName: "",
                managerEmail: "",
                department: "",
                designation: "",
                jobTitle: "",
                experience: "",
                employmentType: "Full Time",
                openings: 1,
                location: "",
                salary: "",
                joiningDate: "",
                skills: "",
                responsibilities: "",
                qualifications: "",
                notes: ""

            });

        }

        catch (err) {

            console.log(err);

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

                    <h2 className="text-2xl font-semibold mb-8">

                        Manager Information

                    </h2>

                    <div className="grid grid-cols-2 gap-6">

                        <div>

                            <label className="font-medium">

                                Manager Name

                            </label>

                            <input

                                type="text"

                                name="managerName"

                                value={form.managerName}

                                onChange={handleChange}

                                className="w-full border rounded-xl p-3 mt-2"

                            />

                        </div>

                        <div>

                            <label className="font-medium">

                                Email

                            </label>

                            <input

                                type="email"

                                name="managerEmail"

                                value={form.managerEmail}

                                onChange={handleChange}

                                className="w-full border rounded-xl p-3 mt-2"

                            />

                        </div>

                        <div>

                            <label>

                                Department

                            </label>

                            <input

                                name="department"

                                value={form.department}

                                onChange={handleChange}

                                className="w-full border rounded-xl p-3 mt-2"

                            />

                        </div>

                        <div>

                            <label>

                                Designation

                            </label>

                            <input

                                name="designation"

                                value={form.designation}

                                onChange={handleChange}

                                className="w-full border rounded-xl p-3 mt-2"

                            />

                        </div>

                    </div>

                    <h2 className="text-2xl font-semibold mt-10 mb-8">

                        Job Requirement

                    </h2>

                    <div className="grid grid-cols-2 gap-6">

                        <div>

                            <label>

                                Job Title

                            </label>

                            <input

                                name="jobTitle"

                                value={form.jobTitle}

                                onChange={handleChange}

                                className="w-full border rounded-xl p-3 mt-2"

                            />

                        </div>

                        <div>

                            <label>

                                Experience

                            </label>

                            <input

                                name="experience"

                                value={form.experience}

                                onChange={handleChange}

                                className="w-full border rounded-xl p-3 mt-2"

                            />

                        </div>

                        <div>

                            <label>

                                Employment Type

                            </label>

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

                            <label>

                                Number of Openings

                            </label>

                            <input

                                type="number"

                                name="openings"

                                value={form.openings}

                                onChange={handleChange}

                                className="w-full border rounded-xl p-3 mt-2"

                            />

                        </div>

                        <div>

                            <label>

                                Location

                            </label>

                            <input

                                name="location"

                                value={form.location}

                                onChange={handleChange}

                                className="w-full border rounded-xl p-3 mt-2"

                            />

                        </div>

                        <div>

                            <label>

                                Salary Range

                            </label>

                            <input

                                name="salary"

                                value={form.salary}

                                onChange={handleChange}

                                className="w-full border rounded-xl p-3 mt-2"

                            />

                        </div>

                        <div>

                            <label>

                                Joining Date

                            </label>

                            <input

                                type="date"

                                name="joiningDate"

                                value={form.joiningDate}

                                onChange={handleChange}

                                className="w-full border rounded-xl p-3 mt-2"

                            />

                        </div>

                    </div>

                    <div className="mt-8">

                        <label>

                            Required Skills

                        </label>

                        <textarea

                            rows={4}

                            name="skills"

                            value={form.skills}

                            onChange={handleChange}

                            className="w-full border rounded-xl p-3 mt-2"

                        />

                    </div>

                    <div className="mt-8">

                        <label>

                            Job Responsibilities

                        </label>

                        <textarea

                            rows={5}

                            name="responsibilities"

                            value={form.responsibilities}

                            onChange={handleChange}

                            className="w-full border rounded-xl p-3 mt-2"

                        />

                    </div>

                    <div className="mt-8">

                        <label>

                            Qualifications

                        </label>

                        <textarea

                            rows={4}

                            name="qualifications"

                            value={form.qualifications}

                            onChange={handleChange}

                            className="w-full border rounded-xl p-3 mt-2"

                        />

                    </div>

                    <div className="mt-8">

                        <label>

                            Additional Notes

                        </label>

                        <textarea

                            rows={4}

                            name="notes"

                            value={form.notes}

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