import React from "react";

const MetricsWidgets = () => (
  <div className="grid grid-cols-3 gap-4">
    <div className="bg-blue-100 p-4 rounded-lg shadow">
      <h3 className="font-bold text-lg">Total Headcount</h3>
      <p className="text-3xl font-semibold mt-2">245</p>
      <p className="text-sm text-gray-700">IT: 120 | HR: 25 | Sales: 100</p>
    </div>
    <div className="bg-green-100 p-4 rounded-lg shadow">
      <h3 className="font-bold text-lg">Payroll Status</h3>
      <p className="text-3xl font-semibold mt-2">95% Verified</p>
      <p className="text-sm text-gray-700">Next run in 5 days</p>
    </div>
    <div className="bg-yellow-100 p-4 rounded-lg shadow">
      <h3 className="font-bold text-lg">Attendance Snapshot</h3>
      <p className="text-3xl font-semibold mt-2">192 Present</p>
      <p className="text-sm text-gray-700">15 on leave | 38 remote</p>
    </div>
  </div>
);

export default MetricsWidgets;
