import React, { useState } from "react";
import Navbar from "../components/AdminComponents/Navbar";
import Sidebar from "../components/AdminComponents/Sidebar";
import EmployeeDatabase from "../components/AdminComponents/EmployeeDatabase";
import OnboardingWorkflow from "../components/AdminComponents/OnboardWorkflow";
import BulkUpload from "../components/AdminComponents/BulkUpload";
import ReportsAnalytics from "../components/AdminComponents/ReportAnalytics";
import MetricsWidgets from "../components/AdminComponents/MetricsWidgets";
import Chatbot from "../components/AdminComponents/Chatbot";

//AdminComponents

const Admin = () => {
  const [activeSection, setActiveSection] = useState("dashboard");

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className="flex-1 p-6  overflow-y-auto">
          {activeSection === "dashboard" && <MetricsWidgets />}
          {activeSection === "employees" && <EmployeeDatabase />}
          {activeSection === "onboarding" && <OnboardingWorkflow />}
          {activeSection === "bulkupload" && <BulkUpload />}
          {activeSection === "reports" && <ReportsAnalytics />}
          {activeSection === "chatbot" && <Chatbot />}
        </main>
      </div>
    </div>
  );
};

export default Admin;

