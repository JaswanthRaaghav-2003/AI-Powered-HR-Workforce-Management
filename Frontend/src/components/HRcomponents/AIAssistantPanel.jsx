import React from "react";

const AIAssistantPanel = () => (
  <div className="bg-white p-4 rounded-xl shadow-md flex justify-between items-center">
    <p className="text-gray-700 italic">
      Ask me: “Show top 5 candidates for React Developer” or “Generate report for last month hires.”
    </p>
    <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
      Chat Now
    </button>
  </div>
);

export default AIAssistantPanel;
