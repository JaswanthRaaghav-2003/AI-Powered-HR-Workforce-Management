import React, { useState } from "react";

const Chatbot = () => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");

  const handleSend = () => {
    if (query.toLowerCase().includes("tax")) {
      setResponse("You paid a total of ₹15,480 in TDS in the last quarter. Check your payslips for July–September.");
    } else {
      setResponse("I'm here to help! Try asking about payroll, leave, or attendance.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">AI Chatbot Assistant</h2>
      <div className="border rounded-lg p-4 h-64 overflow-y-auto bg-gray-50 mb-4">
        {response ? <p className="text-gray-700">{response}</p> : <p className="text-gray-400">Ask me something...</p>}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Type your query..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <button onClick={handleSend} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500">
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
