// src/components/employee/Announcements.jsx
import React from "react";

export default function Announcements({ items = [] }) {
  return (
    <section className="bg-white rounded-2xl p-4 shadow">
      <h3 className="font-semibold mb-3">Announcements</h3>
      <ul className="space-y-2 text-sm">
        {items.map(a => (
          <li key={a.id} className="p-2 border rounded">
            <div className="text-xs text-slate-500">{a.scope} • {a.date}</div>
            <div className="mt-1">{a.text}</div>
          </li>
        ))}
      </ul>
    </section>
  )
}
