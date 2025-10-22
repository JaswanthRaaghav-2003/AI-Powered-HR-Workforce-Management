// src/components/employee/WelcomeWidget.jsx
import React from "react";
import QuickActions from "./QuickActions";

export default function WelcomeWidget({ user, todaySchedule, notifications, onClock, onLeave, onTimesheet, clockedIn }) {
  return (
    <section className="bg-white rounded-2xl p-4 shadow">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <h2 className="text-xl font-semibold">Good morning, {user.name.split(" ")[0]}</h2>
          <p className="text-sm text-slate-500">Here's your day at a glance.</p>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 rounded">
              <div className="text-xs text-slate-500">Today's schedule</div>
              <ul className="mt-2 text-sm space-y-1">
                {todaySchedule.map((s, idx)=>(
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    <span className="font-medium">{s.time}</span>
                    <span className="text-slate-500">— {s.title}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 bg-slate-50 rounded">
              <div className="text-xs text-slate-500">Urgent</div>
              <ul className="mt-2 space-y-2 text-sm">
                {notifications.slice(0,3).map(n => (
                  <li key={n.id} className="text-sm">
                    <span className="font-medium">{n.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        <div className="w-96">
          <div className="mb-3">
            <div className="text-xs text-slate-500">Quick Actions</div>
            <QuickActions onClock={onClock} onLeave={onLeave} onTimesheet={onTimesheet} clockedIn={clockedIn}/>
          </div>

          <div className="bg-slate-50 p-3 rounded">
            <div className="text-xs text-slate-500">Today summary</div>
            <div className="mt-2 text-sm">You have <span className="font-medium">2</span> meetings and <span className="font-medium">1</span> pending approval.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
