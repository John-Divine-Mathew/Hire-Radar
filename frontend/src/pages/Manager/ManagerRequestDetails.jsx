{/*import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export default function ManagerRequestDetails() {

    const { id } = useParams();

    const navigate = useNavigate();

    const [data, setData] = useState(null);

    useEffect(() => {

        loadRequest();

    }, []);

    const loadRequest = async () => {

        try {

            const res = await axios.get(

                `http://localhost:5000/hireRadar/managerrequest/${id}`

            );

            setData(res.data);

        }

        catch (err) {

            console.log(err);

        }

    };

    const updateStatus = async (status) => {

        try {

            await axios.put(

                `http://localhost:5000/hireRadar/managerrequest/${id}`,

                {

                    status

                }

            );

            alert("Status Updated");

            loadRequest();

        }

        catch (err) {

            console.log(err);

        }

    };

    if (!data)

        return (

            <div className="h-screen flex items-center justify-center">

                Loading...

            </div>

        );

    return (

        <div className="min-h-screen bg-[#F4F7FB] p-10">

            <div className="max-w-7xl mx-auto">

                <div className="bg-white rounded-3xl shadow-lg">

                    <div className="bg-gradient-to-r from-[#0F172A] to-[#1D4ED8] rounded-t-3xl px-10 py-8 text-white">

                        <h1 className="text-3xl font-bold">

                            Recruitment Request Details

                        </h1>

                        <p className="text-gray-200 mt-2">

                            Manager Hiring Requirement

                        </p>

                    </div>

                    <div className="p-10">

                        <div className="grid grid-cols-2 gap-8">

                            <div>

                                <label className="text-gray-500">

                                    Manager Name

                                </label>

                                <h2 className="text-xl font-semibold mt-2">

                                    {data.manager_name}

                                </h2>

                            </div>

                            <div>

                                <label className="text-gray-500">

                                    Email

                                </label>

                                <h2 className="text-xl font-semibold mt-2">

                                    {data.manager_email}

                                </h2>

                            </div>

                            <div>

                                <label className="text-gray-500">

                                    Department

                                </label>

                                <h2 className="text-xl font-semibold mt-2">

                                    {data.department}

                                </h2>

                            </div>

                            <div>

                                <label className="text-gray-500">

                                    Designation

                                </label>

                                <h2 className="text-xl font-semibold mt-2">

                                    {data.designation}

                                </h2>

                            </div>

                            <div>

                                <label className="text-gray-500">

                                    Job Title

                                </label>

                                <h2 className="text-xl font-semibold mt-2">

                                    {data.job_title}

                                </h2>

                            </div>

                            <div>

                                <label className="text-gray-500">

                                    Experience

                                </label>

                                <h2 className="text-xl font-semibold mt-2">

                                    {data.experience}

                                </h2>

                            </div>

                            <div>

                                <label className="text-gray-500">

                                    Employment Type

                                </label>

                                <h2 className="text-xl font-semibold mt-2">

                                    {data.employment_type}

                                </h2>

                            </div>

                            <div>

                                <label className="text-gray-500">

                                    Openings

                                </label>

                                <h2 className="text-xl font-semibold mt-2">

                                    {data.openings}

                                </h2>

                            </div>

                            <div>

                                <label className="text-gray-500">

                                    Salary

                                </label>

                                <h2 className="text-xl font-semibold mt-2">

                                    {data.salary}

                                </h2>

                            </div>

                            <div>

                                <label className="text-gray-500">

                                    Joining Date

                                </label>

                                <h2 className="text-xl font-semibold mt-2">

                                    {data.joining_date}

                                </h2>

                            </div>

                        </div>

                        <div className="mt-10">

                            <label className="text-gray-500">

                                Required Skills

                            </label>

                            <div className="bg-gray-50 rounded-2xl p-6 mt-3">

                                {data.skills}

                            </div>

                        </div>

                        <div className="mt-8">

                            <label className="text-gray-500">

                                Responsibilities

                            </label>

                            <div className="bg-gray-50 rounded-2xl p-6 mt-3">

                                {data.responsibilities}

                            </div>

                        </div>

                        <div className="mt-8">

                            <label className="text-gray-500">

                                Qualifications

                            </label>

                            <div className="bg-gray-50 rounded-2xl p-6 mt-3">

                                {data.qualifications}

                            </div>

                        </div>

                        <div className="mt-8">

                            <label className="text-gray-500">

                                Additional Notes

                            </label>

                            <div className="bg-gray-50 rounded-2xl p-6 mt-3">

                                {data.notes}

                            </div>

                        </div>

                        <div className="flex justify-end gap-5 mt-12">

                            <button

                                onClick={() => navigate(-1)}

                                className="px-8 py-3 rounded-xl border"

                            >

                                Back

                            </button>

                            <button

                                onClick={() => updateStatus("Rejected")}

                                className="px-8 py-3 rounded-xl bg-red-600 text-white"

                            >

                                Reject

                            </button>

                            <button

                                onClick={() => updateStatus("Approved")}

                                className="px-8 py-3 rounded-xl bg-green-600 text-white"

                            >

                                Approve

                            </button>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

}*/}