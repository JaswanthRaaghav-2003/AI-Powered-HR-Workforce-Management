import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const ReportsChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data}>
      <XAxis dataKey="job" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="applications" fill="#6366f1" />
    </BarChart>
  </ResponsiveContainer>
);

export default ReportsChart;
