// src/components/EmployeeComponents/DepartmentChat.jsx
import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const DepartmentChat = ({ department }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]); 
  const [team, setTeam] = useState([]);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);
  const messagesRef = useRef(null);

  const token = localStorage.getItem("token");

  // helper axios headers
  const getAuthHeaders = () => ({ Authorization: `Bearer ${token}` });

  useEffect(() => {
    if (!department) return;

    let mounted = true;

    async function loadInitial() {
      try {
        // 1) load department members (team)
        const teamRes = await axios.get(`${API_BASE}/employees/department/${encodeURIComponent(department)}`, {
          headers: getAuthHeaders(),
        });
        if (!mounted) return;
        setTeam(teamRes.data.members || []);

        // 2) load previous messages for this department
        const chatRes = await axios.get(`${API_BASE}/chat/${encodeURIComponent(department)}`, {
          headers: getAuthHeaders(),
        });
        if (!mounted) return;
        setMessages(chatRes.data.messages || []);
      } catch (err) {
        console.error("Failed to load chat data:", err);
        setError(err?.response?.data?.error || "Failed to load chat");
      }
    }

    loadInitial();

    // Setup socket
    const socket = io(API_BASE, {
      auth: { token }, // pass token to backend socket auth
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      // join department room (server checks membership)
      socket.emit("joinDepartment", department);
    });

    socket.on("receiveMessage", (msg) => {
      // append message if not present already
      setMessages((prev) => {
        const exists = prev.some((m) => String(m._id) === String(msg._id));
        if (exists) return prev;
        return [...prev, msg];
      });
      // scroll to bottom
      setTimeout(() => scrollToBottom(), 50);
    });

    socket.on("errorMessage", (msg) => {
      console.warn("Chat error:", msg);
      setError(msg);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connect error:", err);
      setError("Socket connect error");
    });

    return () => {
      mounted = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [department]);

  // auto scroll
  const scrollToBottom = () => {
    if (!messagesRef.current) return;
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  };

  useEffect(() => scrollToBottom(), [messages]);

  const sendMessage = async () => {
    const text = message?.trim();
    if (!text) return;
    setMessage("");

    // optimistic UI: append a temp message (optional)
    const tempMsg = {
      _id: `temp-${Date.now()}`,
      text,
      sender: { _id: "me", name: "You" },
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);
    scrollToBottom();

    // send via socket, server will persist and emit real message back
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("sendMessage", { department, text });
    } else {
      // fallback: try REST POST
      try {
        const res = await axios.post(
          `${API_BASE}/chat/${encodeURIComponent(department)}`,
          { text },
          { headers: getAuthHeaders() }
        );
        if (res.data?.message) {
          setMessages((prev) => {
            // remove temp by id and append real message
            const filtered = prev.filter((m) => !String(m._id).startsWith("temp-"));
            return [...filtered, res.data.message];
          });
        }
      } catch (err) {
        console.error("Send message failed:", err);
        setError("Failed to send message");
      }
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-lg font-semibold mb-6">Team — {department}</h3>

      <div className="mb-3">
        <div className="text-sm text-indigo-600">Members:</div>
        <div className="flex flex-wrap gap-2 mt-2">
          {team.length === 0 && <div className="text-xs text-gray-500">No members found</div>}
          {team.map((m) => (
            <div key={m._id} className="px-2 py-1 bg-indigo-300 rounded text-sm">
              {m.name || m.email}
            </div>
          ))}
        </div>
      </div>

      <div ref={messagesRef} className="h-56 overflow-y-auto mb-3 border p-4 rounded bg-green-200 text-gray-800">
        {messages.length === 0 && <div className="text-xs text-gray-500">No messages yet</div>}
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`mb-2 ${msg.sender?.name === "You" || msg.sender?._id === "me" ? "text-right" : "text-left"}`}
          >
            <div className="text-xs text-gray-500">
              <span className="font-semibold">{msg.sender?.name || msg.sender?.email || "Unknown"}</span>{" "}
              <span className="ml-2">• {new Date(msg.createdAt).toLocaleString()}</span>
            </div>
            <div className="mt-1 inline-block px-3 py-1 rounded bg-white shadow-sm">{msg.text}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 border rounded px-3 py-2"
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} className="px-3 py-2 bg-indigo-600 text-green-300 rounded">
          Send
        </button>
      </div>

      {error && <div className="mt-2 text-xs text-red-600">{error}</div>}
    </div>
  );
};

export default DepartmentChat;
