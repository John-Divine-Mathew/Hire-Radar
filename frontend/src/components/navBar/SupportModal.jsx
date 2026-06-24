import React from "react";

const SupportModal = ({ closeModal }) => {
  return (

    <div className="fixed inset-0 bg-black bg-opacity-40  flex justify-center items-center z-50">

      <div className="bg-white w-[90%] md:w-[500px] rounded-3xl shadow-2xl p-9 relative">

        {/* Close Button */}

        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-red-500"
        >
          ✕
        </button>

        {/* Heading */}

        <h1 className="text-2xl font-bold text-center text-purple-700 mb-6">
          Support Team
        </h1>

        {/* Developer Names */}

        <div className="mb-5">

          <h2 className="text-xl font-semibold mb-2">
            Developer Name
          </h2>

          <ul className="text-gray-600 space-y-1">

            <li>• John Divine Mathew J</li>
            <li>• vijayanandha</li>
            <li>• Bharathsnehan</li>

          </ul>

        </div>

        {/* Email */}

        <div className="mb-5">

          <h2 className="text-xl font-semibold mb-2">
            Email
          </h2>

          <p className="text-gray-600">
            mathewdivine95@gmail.com
          </p>

        </div>

        {/* Phone */}

        <div className="mb-5">

          <h2 className="text-xl font-semibold mb-2">
            Phone & WhatsApp
          </h2>

          <ul className="text-gray-600 space-y-1">

            <li>• 9626749641</li>
            <li>• 7373774847</li>

          </ul>

        </div>

        {/* Department */}

        <div className="mb-5">

          <h2 className="text-xl font-semibold mb-2">
            Department
          </h2>

          <p className="text-gray-600">
            Automation
          </p>

        </div>

        {/* Working Hours */}

        <div className="mb-5">

          <h2 className="text-xl font-semibold mb-2">
            Working Hours
          </h2>

          <p className="text-gray-600">
            Monday to Friday
          </p>

          <p className="text-gray-600">
            9:00 AM - 6:00 PM
          </p>

        </div>

        {/* Close Button */}

        <div className="text-center mt-8">

          <button
            onClick={closeModal}
            className="bg-purple-700 hover:bg-purple-800 text-white px-6 py-2 rounded-lg"
          >
            Close
          </button>

        </div>

      </div>

    </div>

  );
};

export default SupportModal;