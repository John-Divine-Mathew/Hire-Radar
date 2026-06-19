import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const teamMembers = [
    {
      email: "test@gmail.com",
      name: "Bharath",
    },
    {
      email: "mathewdivine95@gmail.com",
      name: "Mathew",
    },
    {
      email: "admin@gmail.com",
      name: "Admin",
    },
  ];

  const handleLogin = (e) => {
    e.preventDefault();

    const user = teamMembers.find(
      (member) => member.email === email
    );

    if (user && password === "Hirotec@123") {
      localStorage.setItem("adminName", user.name);

      alert(`Welcome ${user.name}`);

      navigate("/assessmentform");
    } else {
      alert("Invalid Email or Password");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-xl p-8 w-[400px]">
        <h1 className="text-3xl font-bold text-center text-purple-700 mb-6">
          User Login
        </h1>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Enter Email"
            className="w-full border p-3 rounded mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Enter Password"
            className="w-full border p-3 rounded mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="w-full bg-purple-700 hover:bg-purple-800 text-white py-3 rounded-lg"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;