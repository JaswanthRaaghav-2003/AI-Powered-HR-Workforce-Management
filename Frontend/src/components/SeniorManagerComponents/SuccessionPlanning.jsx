// src/components/SeniorManagerComponents/SuccessionPlanning.jsx
import React, { useState } from "react";

const SuccessionPlanning = () => {
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");

  const sendMessage = () => {
    if (!message) return;
    setChat((prev) => [...prev, { sender: "Manager", message }]);
    setMessage("");
  };

  return (
    <section className="bg-gray-800 p-6 rounded-xl shadow-md">
      <h3 className="text-2xl font-semibold mb-4">Succession Planning (Group Chat)</h3>
      <div className="bg-gray-700 rounded-lg p-4 h-60 overflow-y-auto">
        {chat.map((msg, index) => (
          <p key={index} className="mb-1">
            <span className="font-semibold text-blue-400">{msg.sender}:</span>{" "}
            {msg.message}
          </p>
        ))}
      </div>
      <div className="flex mt-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 bg-gray-600 p-2 rounded-l-md"
          placeholder="Discuss succession plan..."
        />
        <button onClick={sendMessage} className="bg-blue-500 px-4 rounded-r-md">
          Send
        </button>
      </div>
    </section>
  );
};

export default SuccessionPlanning;
