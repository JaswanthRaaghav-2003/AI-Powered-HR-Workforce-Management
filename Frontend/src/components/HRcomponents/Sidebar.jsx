import React from "react";

const Sidebar = () => (
  <aside className="w-64 bg-gradient-to-b text-white flex flex-col justify-between">
    <div>
      <div className="p-4 text-2xl font-bold tracking-wide border-b border-purple-400">SmartHRX</div>
      <ul className="mt-6 space-y-2 text-sm font-medium">
        <li className="p-3 bg-green-500 bg-opacity-20 rounded-lg cursor-pointer">🏠 Dashboard</li>
        <li className="p-3 hover:bg-indigo-600 hover:bg-opacity-20 rounded-lg cursor-pointer">📢 Job Posts</li>
        <li className="p-3 hover:bg-indigo-600 hover:bg-opacity-20 rounded-lg cursor-pointer">👥 Candidates</li>
        <li className="p-3 hover:bg-indigo-600 hover:bg-opacity-20 rounded-lg cursor-pointer">📅 Interviews</li>
        <li className="p-3 hover:bg-indigo-600 hover:bg-opacity-20 rounded-lg cursor-pointer">📊 Reports</li>
        <li className="p-3 hover:bg-indigo-600 hover:bg-opacity-20 rounded-lg cursor-pointer">🤖 AI Assistant</li>
      </ul>
    </div>
    <button className="m-4 bg-white text-indigo-600 rounded-lg py-2 font-semibold hover:bg-gray-200">
      Logout
    </button>
  </aside>
);

export default Sidebar;
