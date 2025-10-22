import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  Link,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import heroImage from "./assets/hero.png";
import About from "./components/About";
import ResumeUpload from "./components/ResumeUpload";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Careers from "./pages/Careers";
import HRRecruiterDashboard from "./pages/HRRecruiterDashboard";
import Admin from "./pages/Admin";
import Employee from "./pages/Employee";
import SeniorManager from "./pages/SeniorManager";
import CameraPage from "./pages/CameraPage";
import HowItWorks from "./pages/HowItWorks";
import FacialLogin from "./pages/FacialLogin"; // New page
import Dashboard from "./pages/Dashboard";

const AppContent = () => {
  const location = useLocation();

  const showNavbar =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/signup";

  const role = localStorage.getItem("role");

  return (
    <>
      {showNavbar && <Navbar />}

      <Routes>
        {/* Home Page */}
        <Route
          path="/"
          element={
            <>
              {/* Hero Section */}
              <div
                className="relative h-screen w-screen bg-cover bg-center"
                style={{ backgroundImage: `url(${heroImage})` }}
              >
                {/* Facial Attendance Button (Top Left) */}
              
              </div>

              <About />
              <ResumeUpload />
              <HowItWorks />
            </>
          }
        />

        {/* Auth Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Facial Attendance Login */}
        <Route path="/facial-login" element={<FacialLogin />} />

        {/* Careers */}
        <Route path="/careers" element={<Careers />} />

        {/* HR Recruiter Dashboard */}
        <Route
          path="/recruiter-dashboard"
          element={
            role === "HR Recruiter" || role === "HR Manager" ? (
              <HRRecruiterDashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin-dashboard"
          element={
            role === "Admin" ? <Admin /> : <Navigate to="/login" replace />
          }
        />

        {/* Employee Dashboard */}
        <Route
          path="/employee-dashboard"
          element={
            role === "Employee" ? <Employee /> : <Navigate to="/login" replace />
          }
        />

        {/* Manager Dashboard */}
        <Route
          path="/manager-dashboard"
          element={
            role === "Senior Technical Manager" ? (
              <SeniorManager />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Camera Page (protected via hardcoded login) */}
        <Route path="/camera" element={<Dashboard />} />
      </Routes>
    </>
  );
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
