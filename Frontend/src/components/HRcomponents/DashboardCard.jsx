import React from "react";

const DashboardCard = ({ title, value, icon }) => (
  <div className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center">
    <div className="text-2xl">{icon}</div>
    <h3 className="text-lg font-bold">{title}</h3>
    <p className="text-gray-600">{value}</p>
  </div>
);

export default DashboardCard;
