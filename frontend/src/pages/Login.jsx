import React from "react";

const Login = () => {
  return (

    <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-purple-600 to-indigo-600">

      <div className="bg-white p-10 rounded-2xl shadow-2xl w-[90%] md:w-[400px]">

        <h1 className="text-4xl font-bold text-center text-purple-700 mb-8">
          Login
        </h1>

        {/* Email */}

        <div className="mb-5">

          <label className="block mb-2">
            Email
          </label>

          <input
            type="email"
            placeholder="Enter your email"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-purple-600"
          />

        </div>

        {/* Password */}

        <div className="mb-6">

          <label className="block mb-2">
            Password
          </label>

          <input
            type="password"
            placeholder="Enter your password"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-purple-600"
          />

        </div>

        {/* Login Button */}

        <button className="w-full bg-purple-700 hover:bg-purple-800 text-white py-3 rounded-lg">

          Login

        </button>

      </div>

    </div>

  );
};

export default Login;