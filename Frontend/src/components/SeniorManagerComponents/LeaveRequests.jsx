import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const socket = io(API_BASE, { transports: ["websocket"] });

export default function LeaveRequests({ managerEmpId }) {
  const [requests, setRequests] = useState([]);

  // Register manager & listen
  useEffect(() => {
    if (!managerEmpId) return;
    socket.emit("registerUser", managerEmpId);

    socket.on("newLeaveRequest", leave => {
      setRequests(prev => [leave, ...prev]);
    });

    return () => socket.off("newLeaveRequest");
  }, [managerEmpId]);

  // Fetch pending leaves
  useEffect(() => {
    async function fetchLeaves() {
      try {
        const res = await axios.get(`${API_BASE}/api/leaves/pending/${managerEmpId}`);
        setRequests(res.data.requests || []);
      } catch (err) {
        console.error(err);
      }
    }
    fetchLeaves();
  }, [managerEmpId]);

  const handleAction = async (id, status) => {
    try {
      const res = await axios.post(`${API_BASE}/api/leaves/update`, { id, status });
      if (res.data.leave) setRequests(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to update leave");
    }
  };

  return (
    <section className="bg-gray-800 p-6 rounded-xl shadow-md">
      <h3 className="text-2xl font-semibold mb-4 text-white">Pending Leave Requests</h3>
      {requests.length === 0 ? <p className="text-gray-400">No pending requests</p> :
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests.map(req => (
            <div key={req._id} className="bg-gray-700 p-4 rounded-lg space-y-2 text-white">
              <p className="font-semibold">{req.employeeName}</p>
              <p className="text-sm">{req.type}</p>
              <p className="text-xs">{req.from} → {req.to}</p>
              <p className="text-xs italic">{req.reason || "No reason provided"}</p>
              <div className="flex gap-2 mt-2">
                <button onClick={() => handleAction(req._id, "approved")} className="bg-green-500 px-3 py-1 rounded-md text-sm">Approve</button>
                <button onClick={() => handleAction(req._id, "rejected")} className="bg-red-500 px-3 py-1 rounded-md text-sm">Reject</button>
              </div>
            </div>
          ))}
        </div>
      }
    </section>
  );
}
