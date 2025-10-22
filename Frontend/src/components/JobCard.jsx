import React from "react";

const JobCard = ({ job, onApply }) => (
  <div className="bg-white shadow-md p-6 rounded-xl hover:shadow-xl transition">
    <h2 className="text-xl font-bold text-indigo-700">{job.title}</h2>
    <p className="text-gray-600">{job.department} | {job.location}</p>
    <p className="mt-2 text-gray-700">{job.description}</p>
    <ul className="list-disc list-inside mt-2 text-gray-600">
      {job.qualifications.map((q, i) => <li key={i}>{q}</li>)}
    </ul>
    <button
      onClick={onApply}
      className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
    >
      Apply
    </button>
  </div>
);

export default JobCard;
