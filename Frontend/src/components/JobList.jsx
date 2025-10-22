import React from "react";

const JobList = ({ jobs, onApply }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.map((job) => (
        <div
          key={job.id}
          className="bg-white p-5 rounded-xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1"
        >
          <h3 className="text-indigo-800 font-bold text-lg mb-2">{job.title || "Untitled Role"}</h3>
          <p className="text-gray-700 text-sm mb-1">📍 {job.location || "N/A"}</p>
          <p className="text-gray-700 text-sm mb-1">💼 Work Model: {job.workModel || "N/A"}</p>
          <p className="text-gray-700 text-sm mb-1">💰 Salary: {job.salaryRange || "N/A"}</p>
          {job.jobSummary && (
            <p className="text-gray-600 text-sm mb-3 italic">
              “{job.jobSummary.length > 120 ? job.jobSummary.slice(0, 120) + "..." : job.jobSummary}”
            </p>
          )}
          <button
            onClick={() => onApply(job)}
            className="mt-2 w-full bg-indigo-600 text-white px-3 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-all duration-200"
          >
            Apply Now
          </button>
        </div>
      ))}
    </div>
  );
};

export default JobList;
