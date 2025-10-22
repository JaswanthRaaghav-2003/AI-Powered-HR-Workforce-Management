import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const AttendancePanel = ({ empId, instantPct }) => {
  const [attendance, setAttendance] = useState(null);

  const fetchAttendance = async () => {
    if (!empId) return;
    try {
      const res = await axios.get(`${API_URL}/api/attendance/${empId}`);
      setAttendance(res.data);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [empId]);

  useEffect(() => {
    if (instantPct) {
      setAttendance((prev) => ({
        ...(prev || {}),
        attendancePct: instantPct,
      }));
    }
  }, [instantPct]);

  if (!attendance) return <div>Loading attendance...</div>;

  return (
    <div className="bg-white shadow-lg rounded-2xl p-6 text-center">
      <h2 className="text-xl font-semibold mb-4">Attendance Summary</h2>
      <p>Days Present: {attendance.daysPresent}</p>
      <p>Days Passed: {attendance.daysPassed}</p>
      <p className="text-green-600 font-bold text-lg">
        Attendance: {attendance.attendancePct}%
      </p>
    </div>
  );
};

export default AttendancePanel;
