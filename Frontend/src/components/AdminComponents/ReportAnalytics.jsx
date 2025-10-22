import React from "react";

const ReportsAnalytics = () => (
  <div>
    <h2 className="text-2xl font-semibold mb-4">Reports & Analytics</h2>
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white p-4 shadow rounded-lg">Headcount Report</div>
      <div className="bg-white p-4 shadow rounded-lg">Payroll Register</div>
      <div className="bg-white p-4 shadow rounded-lg">Diversity & Inclusion Stats</div>
    </div>
    <div className="mt-6 bg-blue-100 p-4 rounded-lg">
      <h3 className="font-semibold">Predictive Analytics (AI Forecasts)</h3>
      <p className="text-sm text-gray-700 mt-2">
        Forecast upcoming hiring needs and budget impact using AI insights.
      </p>
    </div>
  </div>
);

export default ReportsAnalytics;
