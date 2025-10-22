// src/pages/Employee.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/EmployeeComponents/Navbar";
import Sidebar from "../components/EmployeeComponents/Sidebar";
import WelcomeWidget from "../components/EmployeeComponents/WelcomeWidget";
import AttendancePanel from "../components/EmployeeComponents/AttendancePanel";
import LeaveManagement from "../components/EmployeeComponents/LeaveManagement";
import TasksPanel from "../components/EmployeeComponents/TasksPanel";
import PerformancePanel from "../components/EmployeeComponents/PerformancePanel";
import DepartmentChat from "../components/EmployeeComponents/DepartmentChat";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function EmployeePage() {
  const [active, setActive] = useState("dashboard");
  const [meUser, setMeUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [team, setTeam] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [clockedIn, setClockedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // helper to get token header
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  };

  // Load user, employee, team, notifications
  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      try {
        // 1) Load /me (User)
        const meRes = await axios.get(`${API_BASE}/me`, { headers: getAuthHeaders() });
        setMeUser(meRes.data.user);

        // 2) Load employee record by email
        const empRes = await axios.get(`${API_BASE}/employee/me`, { headers: getAuthHeaders() });
        const emp = empRes.data.employee;
        setEmployee(emp);

        // 3) Load department members (Team Directory & Chat)
        if (emp?.department) {
          const teamRes = await axios.get(`${API_BASE}/employees/department/${encodeURIComponent(emp.department)}`, { headers: getAuthHeaders() });
          setTeam(teamRes.data.members || []);

          // 4) Load existing department chat messages
          const chatRes = await axios.get(`${API_BASE}/chat/${encodeURIComponent(emp.department)}`, { headers: getAuthHeaders() });
          setChatMessages(chatRes.data.messages || []);
        }

        // 5) Load notifications
        const noteRes = await axios.get(`${API_BASE}/notifications/me`, { headers: getAuthHeaders() });
        setNotifications(noteRes.data.notifications || []);
      } catch (err) {
        console.error("Failed to load employee data:", err);
        if (err.response && err.response.status === 401) window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    }

    loadAll();
  }, []);

  // Handle clock in/out
  async function handleClock() {
    setClockedIn((prev) => !prev);
    // TODO: backend integration
  }

  // Handle leave request
  async function handleLeaveRequest(form) {
    try {
      const payload = { type: form.type, from: form.from, to: form.to, reason: form.reason };
      const res = await axios.post(`${API_BASE}/leaves`, payload, { headers: getAuthHeaders() });
      if (res.data.ok) {
        alert("Leave request submitted.");
        const noteRes = await axios.get(`${API_BASE}/notifications/me`, { headers: getAuthHeaders() });
        setNotifications(noteRes.data.notifications || []);
      } else {
        alert("Failed to submit leave.");
      }
    } catch (err) {
      console.error("Leave request error:", err);
      alert(err?.response?.data?.error || "Leave request failed");
    }
  }

  // Handle send chat message
  async function handleSendMessage() {
    if (!newMessage.trim()) return;
    try {
      const res = await axios.post(
        `${API_BASE}/chat/${encodeURIComponent(employee.department)}`,
        { message: newMessage },
        { headers: getAuthHeaders() }
      );
      if (res.data.ok) {
        setChatMessages((prev) => [...prev, res.data.message]);
        setNewMessage("");
      }
    } catch (err) {
      console.error("Send message error:", err);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/login";
  }

  if (loading) return <div className="p-6 text-gray-700">Loading...</div>;
  if (!meUser || !employee) return <div className="p-6 text-red-600">Unable to load user/employee data.</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={meUser} notifications={notifications} onLogout={handleLogout} />
      <div className="flex">
        <Sidebar active={active} onNavigate={setActive} />
        <main className="p-6 flex-1 space-y-6">
          <WelcomeWidget
            user={meUser}
            todaySchedule={[]}
            notifications={notifications}
            onClock={handleClock}
            onLeave={() => {}}
            onTimesheet={() => {}}
            clockedIn={clockedIn}
          />

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              <AttendancePanel attendancePct={Math.round(employee.attendancePct || 0)} attendanceLog={[]} />
              
              {/* Pass employee._id to TasksPanel for real-time task updates */}
              <TasksPanel employeeId={employee._id} />

              <PerformancePanel reviews={[]} goals={[]} />

              <div className="bg-green-300 rounded-2xl p-4 border border-white shadow-600 shadow-sm">
                <DepartmentChat
                  department={employee.department}
                  messages={chatMessages}
                  newMessage={newMessage}
                  setNewMessage={setNewMessage}
                  onSendMessage={handleSendMessage}
                  team={team}
                />
              </div>

              <LeaveManagement
                leaveBalance={{
                  vacation: { available: 12, used: 3, pending: 0 },
                  sick: { available: 8, used: 1, pending: 0 },
                }}
                leaveHistory={[]}
                onRequestLeave={handleLeaveRequest}
                teamOnLeave={[]}
              />
            </div>

            <div>
              {/* Sidebar / additional panels */}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
