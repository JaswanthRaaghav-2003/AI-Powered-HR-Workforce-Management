import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const socket = io(API_BASE);

export default function PerformancePanel({ employee }) {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (!employee?.empId) return;

    // Join socket room
    socket.emit("join", employee.empId);

    // Listen for new reviews
    socket.on("newReview", (review) => {
      setReviews((prev) => [review, ...prev]);
    });

    // Fetch existing reviews
    axios
      .get(`${API_BASE}/performance/employee/${employee.empId}`)
      .then((res) => setReviews(res.data.reviews || []))
      .catch((err) => console.error(err));

    return () => socket.off("newReview");
  }, [employee]);

  return (
    <section className="bg-white p-4 rounded-2xl shadow">
      <h3 className="font-semibold mb-3">Performance Reviews</h3>
      {reviews.length === 0 ? (
        <p className="text-gray-500 text-sm">No performance reviews yet.</p>
      ) : (
        <ul className="space-y-2">
          {reviews.map((r, i) => (
            <li key={i} className="p-3 border rounded">
              <div>⭐ {r.rating} / 5</div>
              <div className="text-xs text-gray-500">{r.note}</div>
              <div className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
