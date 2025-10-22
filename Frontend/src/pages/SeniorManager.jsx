// src/pages/SeniorManager.jsx
import React, { useState, useEffect } from "react";
import Navbar from "../components/SeniorManagerComponents/Navbar";
import TeamOverview from "../components/SeniorManagerComponents/TeamOverview";
import LeaveRequests from "../components/SeniorManagerComponents/LeaveRequests";
import PrivateChat from "../components/SeniorManagerComponents/PrivateChat";
import PerformanceReview from "../components/SeniorManagerComponents/PerformanceReview";
import PersonalInfoModal from "../components/SeniorManagerComponents/PersonalInfoModal";
import SuccessionPlanning from "../components/SeniorManagerComponents/SuccessionPlanning";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL||"http://localhost:5000";

export default function SeniorManager() {
  const [manager, setManager] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const res = await axios.get(`${API_BASE}/me`, {
          headers: getAuthHeaders(),
        });
        setManager(res.data.user);
      } catch (err) {
        console.error("Failed to fetch manager info:", err);
      }
    }
    loadData();
  }, []);

  if (!manager) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar manager={manager} onOpenInfo={() => setShowInfoModal(true)} />

      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-semibold">
          Welcome back, <span className="text-blue-400">{manager.name}</span> 👋
        </h1>

        <TeamOverview />
        <LeaveRequests />
        <PrivateChat manager={manager} />
        <PerformanceReview />
        <SuccessionPlanning />

        {showInfoModal && (
          <PersonalInfoModal
            manager={manager}
            onClose={() => setShowInfoModal(false)}
          />
        )}
      </div>
    </div>
  );
}

