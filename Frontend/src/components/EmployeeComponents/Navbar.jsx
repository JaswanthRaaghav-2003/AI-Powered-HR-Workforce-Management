// src/components/employee/Navbar.jsx
import React, { useState, useRef, useEffect } from "react";
import { LogOut, User, Bell } from "lucide-react";

export default function Navbar({ user = {}, onLogout = () => {} , notifications = []}) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-indigo-900 to-sky-900 text-white shadow">
      <div className="flex items-center gap-2">
        <div className="w-15 h-15 rounded-lg bg-white/10 flex items-center justify-center font-bold text-white"> ED </div>
        <div>
          <div className="text-xl text-yellow-500">Employee Dashboard</div>
          <div className="text-xl opacity-90">{user.department} • {user.jobTitle}</div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-full hover:bg-white/10" onClick={() => setOpen(!open)} ref={ref}>
          <Bell className="w-5 h-5" />
          {notifications.length > 0 && <span className="absolute top-0 right-0 w-2 h-2 bg-rose-400 rounded-full" />}
        </button>

        {/* small dropdown */}
        {open && (
          <div className="absolute right-6 top-14 w-80 bg-white text-slate-800 rounded shadow-lg border z-50">
            <div className="p-3 border-b font-semibold">Notifications</div>
            <ul className="max-h-48 overflow-auto">
              {notifications.length ? notifications.map(n => (
                <li key={n.id} className="px-3 py-2 text-sm hover:bg-slate-50">{n.text}</li>
              )) : <li className="p-3 text-sm text-slate-500">No notifications</li>}
            </ul>
          </div>
        )}

        <div className="flex items-center gap-2 px-3 py-1 rounded hover:bg-white/10 cursor-pointer">
          <User className="w-5 h-5" />
          <div className="text-sm">{user.name}</div>
        </div>

        <button onClick={onLogout} className="px-3 py-1 bg-white text-indigo-600 rounded flex items-center gap-2 shadow-sm hover:opacity-95">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </header>
  );
}
