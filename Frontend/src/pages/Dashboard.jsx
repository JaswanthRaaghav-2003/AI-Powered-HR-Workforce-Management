import React, { useState } from "react";
import CameraPage from "./CameraPage";
import AttendancePanel from "../components/EmployeeComponents/AttendancePanel";

export default function Dashboard({ empId }) {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAttendanceUpdate = () => {
    setRefreshKey(prev => prev + 1); // triggers AttendancePanel to refetch
  };

  return (
    <div className="flex gap-6">
      <CameraPage onAttendanceUpdate={handleAttendanceUpdate} />
      <AttendancePanel empId={empId} refreshKey={refreshKey} />
    </div>
  );
}