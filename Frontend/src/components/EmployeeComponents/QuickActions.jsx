// src/components/employee/QuickActions.jsx
import React, { useState } from "react";

export default function QuickActions({ onClock = ()=>{}, onLeave = ()=>{}, onTimesheet = ()=>{} , clockedIn=false }) {
  const [ setLoading] = useState(false);

  async function handleClock() {
    setLoading(true);
    await onClock();
    setLoading(false);
  }

  return (
    <div className="flex gap-3">
      <button onClick={handleClock} className="px-4 py-3 bg-indigo-600 text-white rounded-lg shadow flex-1 hover:opacity-95">
        {clockedIn ? "Clock Out" : "Clock In"}
      </button>
      <button onClick={onLeave} className="px-4 py-3 bg-amber-400 text-white rounded-lg shadow flex-1 hover:opacity-95">Request Leave</button>
      <button onClick={onTimesheet} className="px-4 py-3 bg-slate-200 text-slate-800 rounded-lg shadow flex-1 hover:bg-slate-300">Submit Timesheet</button>
    </div>
  );
}
