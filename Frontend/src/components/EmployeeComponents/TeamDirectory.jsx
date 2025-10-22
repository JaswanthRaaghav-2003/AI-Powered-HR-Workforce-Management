// src/components/EmployeeComponents/TeamDirectory.jsx
import React from "react";

export default function TeamDirectory({ team = [] }) {
  return (
    <section className="bg-white rounded-2xl p-4 shadow">
      <h3 className="font-semibold mb-3">Team Directory</h3>
      <ul className="space-y-2">
        {team.map(member => (
          <li key={member.empId || member._id} className="flex items-center gap-3 p-2 rounded hover:bg-slate-50">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">{member.name.split(" ")[0][0]}</div>
            <div className="flex-1">
              <div className="font-medium">{member.name} <span className="text-xs text-slate-400">• {member.jobTitle || member.role || "-"}</span></div>
              <div className="text-xs text-slate-500">{member.email}</div>
            </div>
            <div className="text-xs text-slate-500">{member.status || "-"}</div>
          </li>
        ))}
      </ul>
    </section>
  )
}
