import React, { useEffect, useState } from "react";
import axios from "axios";
import { socket } from "../../socket";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const PrivateChat = ({ manager }) => {
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [message, setMessage] = useState("");
  const [asTask, setAsTask] = useState(false);
  const [chat, setChat] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Fetch manager's team
  useEffect(() => {
    async function fetchTeam() {
      try {
        const res = await axios.get(`${API_BASE}/employees/team`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setEmployees(res.data.team || []);
      } catch (err) {
        console.error("Error fetching team:", err);
      }
    }
    fetchTeam();
  }, []);

  // Join private chat room for this manager
  useEffect(() => {
    if (!manager?._id) return;
    console.log("🧩 Joining private socket room as manager:", manager._id);
    socket.emit("joinPrivate", { _id: manager._id, email: manager.email });

    socket.on("receivePrivateMessage", (data) => {
      console.log("📩 Message received in manager chat:", data);
      setChat((prev) => [...prev, { from: "employee", ...data }]);
    });

    return () => socket.off("receivePrivateMessage");
  }, [manager]);

  // Send message / assign task
  const sendMessage = () => {
    if (!message || !selectedEmp) return;

    const payload = {
      to: selectedEmp._id,
      message,
      sender: manager._id,
      asTask, // ✅ checkbox state decides
    };

    console.log("🧠 Sending private message:", payload);
    socket.emit("sendPrivateMessage", payload);

    setChat((prev) => [...prev, { from: "me", message }]);
    setMessage("");
    setAsTask(false);
  };

  return (
    <section className="bg-indigo-800 p-6 rounded-xl shadow-md">
      <h3 className="text-2xl font-semibold mb-4">Private Chat 💬 - Assign Tasks 🎯</h3>

      <div className="flex">
        {/* Employee List */}
        <div className="w-1/3 border-r border-green-700 pr-4">
          <h4 className="text-lg mb-2 text-green-400">Team Members</h4>
          {employees.map((emp) => (
            <div
              key={emp._id}
              onClick={() => {
                setSelectedEmp(emp);
                setChat([]);
              }}
              className={`p-2 rounded-md cursor-pointer ${
                selectedEmp?._id === emp._id
                  ? "bg-blue-600 text-white"
                  : "hover:bg-green-700 text-gray-300"
              }`}
            >
              {emp.name}
            </div>
          ))}
        </div>

        {/* Chat Box */}
        <div className="flex-1 pl-4 flex flex-col">
          {selectedEmp ? (
            <>
              <div className="flex-1 bg-green-200 rounded-lg p-4 overflow-y-auto">
                {chat.map((msg, index) => (
                  <div
                    key={index}
                    className={`mb-2 ${
                      msg.from === "me" ? "text-right" : "text-left"
                    }`}
                  >
                    <p
                      className={`inline-block px-3 py-2 rounded-lg ${
                        msg.from === "me"
                          ? "bg-blue-500 text-white"
                          : "bg-green-600 text-gray-200"
                      }`}
                    >
                      {msg.message}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-2 flex items-center gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 bg-indigo-300 text-black p-2 rounded-l-md outline-none"
                  placeholder={`Message ${selectedEmp.name}`}
                />
                <button
                  onClick={sendMessage}
                  className="bg-blue-500 px-4 rounded-r-md"
                >
                  Send
                </button>
              </div>

              <label className="flex items-center gap-2 mt-1 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={asTask}
                  onChange={(e) => setAsTask(e.target.checked)}
                  className="accent-blue-400"
                />
                Assign this message as a task
              </label>
            </>
          ) : (
            <p className="text-gray-400 text-center mt-10">
              Select an employee to start chatting.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default PrivateChat;
