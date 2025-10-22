import React from "react";

const CandidatesTable = ({ candidates }) => (
  <div className="overflow-x-auto bg-white rounded-xl shadow-md">
  <table className="min-w-full text-sm text-gray-700">
    <thead className="bg-indigo-100 text-indigo-700">
      <tr>
        <th className="p-2 text-left">Name</th>
        <th className="p-2 text-left">Job Applied</th>
        <th className="p-2 text-left">AI Score</th>
        <th className="p-2 text-left">Experience</th>
        <th className="p-2 text-left">Status</th>
      </tr>
    </thead>
    <tbody>
      {candidates.map((c, i) => (
        <tr key={i} className="border-b hover:bg-gray-50">
          <td className="p-2">{c.name}</td>
          <td className="p-2">{c.job}</td>
          <td className="p-2">{c.score}%</td>
          <td className="p-2">{c.exp}</td>
          <td className="p-2 font-semibold text-green-600">{c.status}</td>
        </tr>
      ))}
    </tbody>
  </table> 
</div>

);

export default CandidatesTable;
