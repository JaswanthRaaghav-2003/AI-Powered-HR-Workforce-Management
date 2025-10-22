import React, { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const socket = io(API_BASE, { transports: ["websocket"] });

export default function LeaveManagement({ employeeEmpId, employeeName, managerEmpId }) {
  const [form, setForm] = useState({ type: "Vacation", from: "", to: "", reason: "" });
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState({
    vacation: { available: 12, used: 0, pending: 0 },
    sick: { available: 8, used: 0, pending: 0 },
  });

  // Register socket
  useEffect(() => {
    if (!employeeEmpId) return;
    socket.emit("registerUser", employeeEmpId);

    socket.on("leaveStatusUpdate", (updatedLeave) => {
      setLeaveHistory(prev => prev.map(l => l._id === updatedLeave._id ? updatedLeave : l));

      // Update balance
      const typeKey = updatedLeave.type.toLowerCase();
      if (updatedLeave.status === "approved") {
        setLeaveBalance(prev => ({
          ...prev,
          [typeKey]: {
            ...prev[typeKey],
            used: prev[typeKey].used + 1,
            pending: Math.max(prev[typeKey].pending - 1, 0),
            available: Math.max(prev[typeKey].available - 1, 0),
          }
        }));
      } else if (updatedLeave.status === "rejected") {
        setLeaveBalance(prev => ({
          ...prev,
          [typeKey]: {
            ...prev[typeKey],
            pending: Math.max(prev[typeKey].pending - 1, 0),
          }
        }));
      }

      alert(`Your leave from ${updatedLeave.from} to ${updatedLeave.to} was ${updatedLeave.status}`);
    });

    return () => socket.off("leaveStatusUpdate");
  }, [employeeEmpId]);

  // Fetch leave history
  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await axios.get(`${API_BASE}/api/leaves/history/${employeeEmpId}`);
        setLeaveHistory(res.data.leaves || []);
      } catch (err) {
        console.error(err);
      }
    }
    fetchHistory();
  }, [employeeEmpId]);

  const submitLeave = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/api/leaves/request`, {
        employeeEmpId,
        employeeName,
        managerEmpId,
        ...form,
      });
      setLeaveHistory(prev => [res.data.leave, ...prev]);
      setLeaveBalance(prev => ({
        ...prev,
        [form.type.toLowerCase()]: { ...prev[form.type.toLowerCase()], pending: prev[form.type.toLowerCase()].pending + 1 }
      }));
      setForm({ type: "Vacation", from: "", to: "", reason: "" });
      alert("Leave submitted successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to submit leave");
    }
  };

  return (
    <section className="bg-indigo-300 rounded-2xl p-4 shadow">
      <h3 className="font-semibold mb-3">Leave Management</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1 bg-slate-50 p-3 rounded">
          <div className="text-xs text-indigo-900 mb-2">Leave Balances</div>
          <ul className="mt-2 space-y-2 text-sm">
            {Object.entries(leaveBalance).map(([k, v]) => (
              <li key={k}>
                <div className="font-medium">{k.toUpperCase()}</div>
                <div className="text-xs text-indigo-900">{v.available} available • {v.used} used • {v.pending} pending</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-2">
          <form onSubmit={submitLeave} className="grid grid-cols-2 gap-3 mb-4">
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="p-2 border rounded">
              <option>Vacation</option>
              <option>Sick</option>
              <option>Casual</option>
            </select>
            <input type="date" value={form.from} onChange={e => setForm({ ...form, from: e.target.value })} className="p-2 border rounded" />
            <input type="date" value={form.to} onChange={e => setForm({ ...form, to: e.target.value })} className="p-2 border rounded" />
            <input type="text" placeholder="Reason" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} className="p-2 border rounded" />
            <div className="col-span-2 flex gap-2">
              <button className="px-4 py-2 bg-green-600 text-white rounded">Submit Request</button>
              <button type="button" onClick={() => setForm({ type: "Vacation", from: "", to: "", reason: "" })} className="px-4 py-2 bg-slate-100 rounded">Clear</button>
            </div>
          </form>

          <div>
            <div className="text-xs text-indigo-900 mb-2">Leave History</div>
            <table className="w-full text-sm">
              <thead className="text-xs text-indigo-900 text-left">
                <tr><th>Date Range</th><th>Type</th><th>Days</th><th>Status</th></tr>
              </thead>
              <tbody>
                {leaveHistory.length ? leaveHistory.map((l) => (
                  <tr key={l._id} className="border-t">
                    <td className="py-2">{l.from} → {l.to}</td>
                    <td className="py-2">{l.type}</td>
                    <td className="py-2">{l.days || 1}</td>
                    <td className="py-2">{l.status}</td>
                  </tr>
                )) : <tr><td colSpan="4" className="p-3 text-black">No leave history</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
