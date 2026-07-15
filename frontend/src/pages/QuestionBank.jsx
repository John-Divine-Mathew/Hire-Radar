import React, { useState, useEffect } from "react";

import Navbar from "../components/navBar/navBar";
import Sidebar from "../components/sideBar/sideBar";

import {
    Building2,
    Search,
    Plus,
    Upload,
    Download,
    FolderOpen,
    BookOpen,
    Layers,
    Clock3,
    ChevronRight,
    Code2,
    Cpu,
    Briefcase,
    Factory,
    Users,
    Wrench,
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000/api";

function QuestionBank() {

    /*=====================================================
                STATES
    =====================================================*/

    const [departments, setDepartments] = useState([]);

    const [questions, setQuestions] = useState([]);

    const [selectedDept, setSelectedDept] = useState("");

    const [selectedDifficulty, setSelectedDifficulty] = useState("");

    const [showDifficultyModal, setShowDifficultyModal] = useState(false);

    const [loading, setLoading] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");



    /*=====================================================
                ICONS
    =====================================================*/

    const departmentIcons = {

        "Software Development": Code2,

        Automation: Cpu,

        Mechanical: Wrench,

        Production: Factory,

        "Human Resources": Users,

        "Quality Assurance": Briefcase,

    };



    /*=====================================================
            FETCH DEPARTMENTS
    =====================================================*/

    useEffect(() => {

        fetch(`${API_BASE_URL}/departments`)

            .then((res) => res.json())

            .then((data) => {

                setDepartments(data);

            })

            .catch(() => {

                setDepartments([

                    "Software Development",

                    "Automation",

                    "Mechanical",

                    "Quality Assurance",

                    "Human Resources",

                    "Production",

                ]);

            });

    }, []);





    /*=====================================================
        FETCH QUESTIONS
    =====================================================*/

    const fetchQuestions = (dept, level) => {

        setLoading(true);

        fetch(

            `${API_BASE_URL}/questions?department=${encodeURIComponent(

                dept

            )}&difficulty=${level}`

        )

            .then((res) => res.json())

            .then((data) => {

                setQuestions(data);

                setLoading(false);

            })

            .catch(() => {

                setLoading(false);

            });

    };





    /*=====================================================
        DEPARTMENT CLICK
    =====================================================*/

    const handleDepartmentClick = (dept) => {

        setSelectedDept(dept);

        setShowDifficultyModal(true);

    };





    /*=====================================================
        DIFFICULTY CLICK
    =====================================================*/

    const handleDifficulty = (level) => {

        setSelectedDifficulty(level);

        setShowDifficultyModal(false);

        fetchQuestions(selectedDept, level);

    };





    /*=====================================================
        SEARCH FILTER
    =====================================================*/

    const filteredQuestions = questions.filter((question) =>

        question.question_text

            ?.toLowerCase()

            .includes(searchQuery.toLowerCase())

    );





    /*=====================================================
            STATISTICS
    =====================================================*/

    const statistics = [

        {

            title: "Departments",

            value: departments.length,

            icon: Building2,

            color: "bg-indigo-100 text-indigo-700",

        },

        {

            title: "Questions",

            value: questions.length,

            icon: BookOpen,

            color: "bg-green-100 text-green-700",

        },

        {

            title: "Difficulty",

            value: selectedDifficulty || "-",

            icon: Layers,

            color: "bg-purple-100 text-purple-700",

        },

        {

            title: "Last Updated",

            value: "Today",

            icon: Clock3,

            color: "bg-orange-100 text-orange-700",

        },

    ];



    return (

        <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">

            <Navbar />



            <div className="flex flex-1 overflow-hidden">

                <Sidebar />



                <div className="flex-1 overflow-y-auto p-8">

                    {/* ================================================= */}

                    {/* HEADER */}

                    {/* ================================================= */}

                    <div className="flex justify-between items-center mb-8">

                        <div>

                            <h1 className="text-4xl font-bold text-gray-900">

                                Question Bank

                            </h1>



                            <p className="text-gray-500 mt-2">

                                Create, organize and manage assessment

                                questions professionally.

                            </p>

                        </div>



                    </div>





                    {/* ================================================= */}

                    {/* STATISTICS */}

                    {/* ================================================= */}

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">

                        {statistics.map((item) => {

                            const Icon = item.icon;

                            return (

                                <div

                                    key={item.title}

                                    className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6"

                                >

                                    <div className="flex justify-between items-center">

                                        <div>

                                            <p className="text-sm text-gray-500">

                                                {item.title}

                                            </p>



                                            <h2 className="text-3xl font-bold mt-2">

                                                {item.value}

                                            </h2>

                                        </div>



                                        <div

                                            className={`h-14 w-14 rounded-2xl flex items-center justify-center ${item.color}`}

                                        >

                                            <Icon size={28} />

                                        </div>

                                    </div>

                                </div>

                            );

                        })}

                    </div>





                    {/* ================================================= */}

                    {/* SEARCH */}

                    {/* ================================================= */}

                    <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-5 mb-8">

                        <div className="relative">

                            <Search

                                className="absolute left-4 top-3.5 text-gray-400"

                                size={20}

                            />



                            <input

                                type="text"

                                placeholder="Search Questions..."

                                value={searchQuery}

                                onChange={(e) =>

                                    setSearchQuery(e.target.value)

                                }

                                className="w-full border border-gray-200 rounded-2xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"

                            />

                        </div>

                    </div>





                    {/* ================================================= */}

                    {/* DEPARTMENTS */}

                    {/* ================================================= */}

                    <div className="mb-10">

                        <div className="flex items-center gap-2 mb-5">

                            <FolderOpen className="text-indigo-600" />



                            <h2 className="text-2xl font-bold">

                                Departments

                            </h2>

                        </div>



                        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

                            {departments.map((dept) => {

                                const Icon =

                                    departmentIcons[dept] ||

                                    Building2;



                                return (

                                    <div

                                        key={dept}

                                        onClick={() =>

                                            handleDepartmentClick(dept)

                                        }

                                        className={`cursor-pointer rounded-3xl bg-white border transition-all duration-300 p-6 shadow-md hover:shadow-xl hover:-translate-y-2

                                        ${

                                            selectedDept === dept

                                                ? "border-indigo-600"

                                                : "border-gray-200"

                                        }`}

                                    >

                                        <div className="flex justify-between">

                                            <div>

                                                <div className="bg-indigo-100 text-indigo-700 h-14 w-14 rounded-2xl flex items-center justify-center mb-5">

                                                    <Icon size={28} />

                                                </div>



                                                <h3 className="text-xl font-bold">

                                                    {dept}

                                                </h3>



                                                <p className="text-gray-500 text-sm mt-2">

                                                    Click to manage

                                                    department questions

                                                </p>

                                            </div>



                                            <ChevronRight className="text-gray-400" />

                                        </div>

                                    </div>

                                );

                            })}

                        </div>

                    </div>

                    {/* ===== PART 2 STARTS HERE ===== */}

                </div>

            </div>

        </div>

    );

}

export default QuestionBank;