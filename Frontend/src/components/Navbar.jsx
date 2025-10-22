import React from "react";
import { useNavigate } from "react-router-dom";

const Logo = () => (
  <div className="flex items-center space-x-2 cursor-pointer">
    <div className="w-6 h-6 border-2 border-white rounded-full"></div>
    <div className="w-6 h-6 bg-white rounded-full"></div>
    <span className="text-xl font-bold text-white">SmartHRX®</span>
  </div>
);

const Navbar = () => {
  const navigate = useNavigate();

  const navLinks = [
    { name: "About", id: "about", scroll: true },
    { name: "ATS Checker", id: "ats", scroll: true },
    { name: "How it Works", id: "how-it-works", scroll: true },
    { name: "Careers", path: "/careers", scroll: false },
  ];

  const handleScroll = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="w-full p-3 md:p-4 text-white fixed top-0 left-0 z-50 bg-black/1 backdrop-blur-md">
      <div className="max-w-[1280px] mx-auto flex items-center justify-between px-4 md:px-0">
        {/* Logo */}
        <div onClick={() => navigate("/")}>
          <Logo />
        </div>

        {/* Centered Navigation Links */}
        <div className="hidden md:flex flex-1 justify-center">
          <ul className="flex flex-wrap items-center space-x-2 md:space-x-3 p-2 bg-black/20 backdrop-blur-md rounded-full border border-white/10">
            <li>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="block px-4 py-2 text-sm bg-gray-800/50 rounded-full hover:bg-gray-700/70 transition-colors duration-300"
              >
                Home
              </button>
            </li>
            {navLinks.map((link) => (
              <li key={link.name}>
                {link.scroll ? (
                  <button
                    onClick={() => handleScroll(link.id)}
                    className="block px-4 py-2 text-sm rounded-full hover:bg-gray-800/50 transition-colors duration-300"
                  >
                    {link.name}
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(link.path)}
                    className="block px-4 py-2 text-sm rounded-full hover:bg-gray-800/50 transition-colors duration-300"
                  >
                    {link.name}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Right Buttons */}
        <div className="flex items-center space-x-3">
          {/* Facial Attendance Button */}
          <button
            onClick={() => navigate("/facial-login")}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-2 px-5 rounded-full shadow-lg hover:scale-105 transition-transform duration-300 text-sm"
          >
            Facial Attendance
          </button>

          {/* Login Button */}
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-600 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-full transition-colors duration-300 text-sm"
          >
            Login
          </button>
        </div>

        {/* Hamburger for Mobile */}
        <div className="md:hidden ml-2">
          <button className="text-white focus:outline-none">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
