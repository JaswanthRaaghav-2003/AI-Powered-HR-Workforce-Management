import React from "react";
import { Home, Users, FileText, Database, BarChart2, MessageCircle } from "lucide-react";

const Sidebar = ({ activeSection, setActiveSection }) => {
  const items = [
    { key: "dashboard", label: "Dashboard", icon: <Home size={18} /> },
    { key: "employees", label: "Employees", icon: <Users size={18} /> },
    { key: "onboarding", label: "Onboarding/Offboarding", icon: <FileText size={18} /> },
    { key: "bulkupload", label: "Bulk Upload", icon: <Database size={18} /> },
    { key: "reports", label: "Reports", icon: <BarChart2 size={18} /> },
    { key: "chatbot", label: "AI Chatbot", icon: <MessageCircle size={18} /> },
  ];

  return (
    <aside className="w-64 bg-gradient-to-r text-white  shadow-md">
      <ul className="p-4 space-y-3">
        {items.map((item) => (
          <li
            key={item.key}
            onClick={() => setActiveSection(item.key)}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition-all ${
              activeSection === item.key ? "bg-indigo-600 text-white" : "hover:bg-green-800 text-white-700"
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
