import React, { useState, useEffect } from "react";
import JobList from "../components/JobList";
import JobApplicationForm from "../components/JobApplicationForm";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000" ;

const Careers = () => {
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/jobs`)
      .then(res => res.json())
      .then(data => {
        setJobs(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch jobs:", err);
        setJobs([]);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center mt-20 text-gray-700">Loading jobs...</div>;
  if (!jobs.length) return <div className="text-center mt-20 text-gray-700">No job postings available.</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {!selectedJob ? (
        <JobList jobs={jobs} onApply={setSelectedJob} />
      ) : (
        <JobApplicationForm job={selectedJob} onBack={() => setSelectedJob(null)} />
      )}
    </div>
  );
};

export default Careers;
