import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const PerformanceReview = () => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState({});

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

  const handleStarClick = (empId, rating) => {
    setReviews((prev) => ({
      ...prev,
      [empId]: { ...prev[empId], rating },
    }));
  };

  const handleNoteChange = (empId, note) => {
    setReviews((prev) => ({
      ...prev,
      [empId]: { ...prev[empId], note },
    }));
  };

  const handleSave = async (empId) => {
    const review = reviews[empId];
    if (!review?.rating) return alert("Please select a rating before saving.");

    try {
      await axios.post(
        `${API_BASE}/performance/review`,
        {
          employeeEmpId: empId,
          managerEmpId: localStorage.getItem("empId"), // manager's empId
          rating: review.rating,
          note: review.note,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      alert(`✅ Review saved for ${team.find((e) => e._id === empId).name}`);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save review");
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 p-6 rounded-xl text-center text-gray-400">
        Loading team data...
      </div>
    );
  }

  if (team.length === 0) {
    return (
      <div className="bg-gray-800 p-6 rounded-xl text-gray-400">
        No team members assigned yet.
      </div>
    );
  }

  return (
    <section className="bg-gray-800 p-6 rounded-xl shadow-md">
      <h3 className="text-2xl font-semibold mb-4 text-white">
        Performance Review
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {team.map((emp) => (
          <div
            key={emp._id}
            className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition duration-200 flex flex-col gap-2"
          >
            <h4 className="font-semibold text-lg text-white">{emp.name}</h4>
            <p className="text-gray-300 text-sm">{emp.role}</p>
            <p className="text-gray-400 text-sm">{emp.email}</p>
            <p className="text-green-400 text-sm">
              Reporting to: {emp.reportingManager || "N/A"}
            </p>

            <div className="flex mt-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-6 h-6 cursor-pointer ${
                    s <= (reviews[emp._id]?.rating || 0)
                      ? "text-yellow-400"
                      : "text-gray-400"
                  }`}
                  onClick={() => handleStarClick(emp._id, s)}
                />
              ))}
            </div>

            <textarea
              placeholder="Add review note..."
              value={reviews[emp._id]?.note || ""}
              onChange={(e) => handleNoteChange(emp._id, e.target.value)}
              className="bg-gray-600 p-2 rounded-md text-sm resize-none text-white mt-2"
            ></textarea>

            <button
              onClick={() => handleSave(emp._id)}
              className="self-start bg-blue-500 hover:bg-blue-600 px-4 py-1 rounded-md text-sm text-white mt-2"
            >
              Save Review
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PerformanceReview;
