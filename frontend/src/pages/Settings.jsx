import React from "react";
import Sidebar from "../components/sideBar/sideBar.jsx";

const Settings = () => {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex flex-col lg:flex-row">
        <aside className="w-full lg:w-72">
          <Sidebar />
        </aside>

        <main className="flex-1 p-6">
          <div className="bg-white rounded-3xl shadow-2xl p-10">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-slate-900">Project Settings</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <section className="rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Project</h2>
                    <p className="text-sm text-slate-500 mt-2">Manage project scope and environment.</p>
                  </div>
                  <button className="text-purple-700 font-semibold">Configure</button>
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Security</h2>
                    <p className="text-sm text-slate-500 mt-2">Review access and authentication settings.</p>
                  </div>
                  <button className="text-purple-700 font-semibold">Configure</button>
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Notifications</h2>
                    <p className="text-sm text-slate-500 mt-2">Control alerts and activity updates.</p>
                  </div>
                  <button className="text-purple-700 font-semibold">Configure</button>
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">System</h2>
                    <p className="text-sm text-slate-500 mt-2">Set dashboard defaults and reporting options.</p>
                  </div>
                  <button className="text-purple-700 font-semibold">Configure</button>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
