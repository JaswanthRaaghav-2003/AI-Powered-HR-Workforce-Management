// src/components/SeniorManagerComponents/TeamOverview.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const TeamOverview = () => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeam() {
      try {
        const res = await axios.get(`${API_BASE}/employees/team`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setTeam(res.data.team || []);
      } catch (err) {
        console.error("Error fetching team:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTeam();
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-800 p-6 rounded-xl text-center text-gray-400">
        Loading team data...
      </div>
    );
  }

  return (
    <section className="bg-gray-800 p-6 rounded-xl shadow-md">
      <h3 className="text-2xl font-semibold mb-4">Team Overview</h3>
      {team.length === 0 ? (
        <p className="text-gray-400">No team members found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {team.map((emp) => (
            <div
              key={emp._id}
              className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition duration-200"
            >
              <h4 className="font-semibold text-lg">{emp.name}</h4>
              <p className="text-gray-300 text-sm">{emp.role}</p>
              <p className="text-gray-400 text-sm">{emp.email}</p>
              <p className="mt-1 text-green-400 text-sm">
                Reporting to: {emp.reportingManager || "N/A"}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default TeamOverview;
