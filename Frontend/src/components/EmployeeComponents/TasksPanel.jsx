import React, { useEffect, useState } from "react";
import axios from "axios";
import { socket } from "../../socket"; // ✅ shared socket import

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function TasksPanel({ employeeId }) {
  const [tasks, setTasks] = useState([]);
  const [personalTodos, setPersonalTodos] = useState([]);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API_BASE}/tasks/${employeeId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTasks(res.data.tasks || []);
      setPersonalTodos(res.data.personalTodos || []);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  useEffect(() => {
    if (!employeeId) return;
    fetchTasks();

    console.log("🧩 Joining private socket room as employee:", employeeId);
    socket.emit("joinPrivate", { _id: employeeId });

    socket.on("receivePrivateMessage", (data) => {
      console.log("📬 Private message/task received in TasksPanel:", data);
      if (data.asTask && data.task) {
        setTasks((prev) => [data.task, ...prev]);
      }
    });

    return () => socket.off("receivePrivateMessage");
  }, [employeeId]);

  return (
    <section className="bg-white rounded-2xl p-4 shadow">
      <h3 className="font-semibold mb-3">Work & Performance</h3>

      <div className="grid grid-cols-2 gap-4">
        {/* My Tasks */}
        <div>
          <div className="text-xs text-slate-500 mb-2">My Tasks</div>
          <ul className="space-y-2">
            {tasks.length === 0 ? (
              <li className="text-sm text-gray-400">No tasks assigned.</li>
            ) : (
              tasks.map((t) => (
                <li key={t._id} className="p-3 rounded border">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{t.name}</div>
                      <div className="text-xs text-slate-500">
                        {t.priority} • Due{" "}
                        {t.due ? new Date(t.due).toLocaleDateString() : "N/A"}
                      </div>
                      {t.description && (
                        <div className="text-xs text-gray-400 mt-1">
                          {t.description}
                        </div>
                      )}
                    </div>
                    <div className="text-sm">{t.status}</div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Personal To-Do */}
        <div>
          <div className="text-xs text-slate-500 mb-2">Personal To-Do</div>
          <ul className="space-y-2">
            {personalTodos.length === 0 ? (
              <li className="text-sm text-gray-400">No personal to-dos.</li>
            ) : (
              personalTodos.map((p, i) => (
                <li
                  key={i}
                  className="p-2 bg-slate-50 rounded flex items-center justify-between"
                >
                  <div>{p.text}</div>
                  <div className="text-xs text-slate-400">
                    {p.done ? "Done" : "Open"}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
