// src/components/employee/Sidebar.jsx
import React from "react";
import { Home, Clock, Calendar, FileText, MessageCircle } from "lucide-react";

export default function Sidebar({ active="dashboard", onNavigate = ()=>{} }) {
  const items = [
    { key: "dashboard", label: "My Day", icon: <Home className="w-4 h-4"/> },
    { key: "attendance", label: "Attendance", icon: <Clock className="w-4 h-4"/> },
    { key: "leave", label: "Leaves", icon: <Calendar className="w-4 h-4"/> },
    { key: "tasks", label: "Tasks", icon: <FileText className="w-4 h-4"/> },
    { key: "team", label: "Team", icon: <MessageCircle className="w-4 h-4"/> },
  ];

  return (
    <aside className="w-72 bg-gradient-to-r from-indigo-900 to-sky-900/90 border-r p-4 min-h-screen">
      <div className="text-sm text-white uppercase font-bold mb-4">Workspace 🏢</div>
      <nav className="space-y-1">
        {items.map(it => (
          <button
            key={it.key}
            onClick={()=>onNavigate(it.key)}
            className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded ${active===it.key ? "bg-indigo-50 border-l-4 border-indigo-600" : "hover:bg-slate-50"}`}
          >
            {it.icon}
            <span className="font-medium">{it.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-6 text-xs text-indigo-500">
        <div>Quick Links</div>
        <ul className="mt-2 space-y-1">
          <li className="hover:text-indigo-900 cursor-pointer">Payslips</li>
          <li className="hover:text-indigo-900 cursor-pointer">Company Policies</li>
        </ul>
      </div>
    </aside>
  )
}
