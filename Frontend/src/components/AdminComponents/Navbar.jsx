import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bell } from "lucide-react";

const Navbar = () => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
    if (storedToken) fetchNotifications(storedToken);
  }, []);

  const fetchNotifications = async (authToken) => {
    try {
      const res = await axios.get("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setNotifications(res.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.post(
        `http://localhost:5000/api/notifications/approve/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      alert("✅ User approved successfully!");
    } catch (err) {
      console.error("Error approving user:", err);
      alert("❌ Failed to approve user");
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.post(
        `http://localhost:5000/api/notifications/reject/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      alert("🚫 User rejected!");
    } catch (err) {
      console.error("Error rejecting user:", err);
      alert("❌ Failed to reject user");
    }
  };

  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-gray-800 text-white shadow-md">
      <h1 className="text-xl font-semibold">Admin Dashboard</h1>

      <div className="relative">
        <button onClick={() => setShowDropdown(!showDropdown)} className="relative">
          <Bell size={24} />
          {notifications.length > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-xs px-2 py-0.5 rounded-full">
              {notifications.length}
            </span>
          )}
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-3 w-80 bg-white text-black rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-3 font-semibold border-b">Notifications</div>
            {notifications.length === 0 ? (
              <p className="p-3 text-gray-500 text-sm">No new notifications</p>
            ) : (
              <ul className="max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <li
                    key={n._id}
                    className="p-3 border-b hover:bg-gray-100 transition-colors"
                  >
                    <p className="font-medium">{n.name}</p>
                    <p className="text-sm text-gray-600">
                      {n.email} — {n.department || n.role}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleApprove(n._id)}
                        className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(n._id)}
                        className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
