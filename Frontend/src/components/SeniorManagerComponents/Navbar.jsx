// src/components/SeniorManagerComponents/Navbar.jsx
import React from "react";
import { Bell, User, LogOut } from "lucide-react";

const Navbar = ({  onOpenInfo }) => {
  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/login";
  }

  return (
    <nav className="flex justify-between items-center bg-gray-800 px-6 py-4 shadow-lg">
      <h2 className="text-xl font-semibold">Senior Manager Dashboard</h2>
      <div className="flex items-center gap-6">
        <button className="relative">
          <Bell className="w-6 h-6 hover:text-blue-400" />
          <span className="absolute -top-1 -right-2 bg-red-500 text-xs rounded-full px-1">
            3
          </span>
        </button>

        <button onClick={onOpenInfo}>
          <User className="w-6 h-6 hover:text-green-400" />
        </button>

        <button onClick={handleLogout}>
          <LogOut className="w-6 h-6 hover:text-red-400" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
