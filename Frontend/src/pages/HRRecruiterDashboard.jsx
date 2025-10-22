import React, { useState, useEffect } from "react";
import Sidebar from "../components/HRcomponents/Sidebar";
import DashboardCard from "../components/HRcomponents/DashboardCard";
import JobPostForm from "../components/HRcomponents/JobPostForm";
import ReportsChart from "../components/HRcomponents/ReportsChart";
import AIAssistantPanel from "../components/HRcomponents/AIAssistantPanel";

// Replace with your Gemini API Key
const GEMINI_API_KEY = "Your_Gemini_API_KEY";

const HRRecruiterDashboard = () => {
  const [showForm, setShowForm] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [shortlisted, setShortlisted] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchJobs();
    fetchCandidates();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch("http://localhost:5000/jobs");
      const data = await res.json();
      setJobs(data);
      updateChart(data, candidates);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  const fetchCandidates = async () => {
    try {
      const res = await fetch("http://localhost:5000/applications");
      const data = await res.json();
      setCandidates(data);
      updateChart(jobs, data);
    } catch (err) {
      console.error("Error fetching candidates:", err);
    }
  };

  const updateChart = (jobsData, candidatesData) => {
    const chart = jobsData.map((job) => ({
      job: job.title,
      applications:
        candidatesData.filter((c) => c.jobTitle === job.title).length || 0,
    }));
    setChartData(chart);
  };

  const addJob = async (newJob) => {
    try {
      const res = await fetch("http://localhost:5000/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newJob),
      });
      const savedJob = await res.json();
      setJobs((prev) => [...prev, savedJob.job || savedJob]);
      setShowForm(false);
    } catch (err) {
      console.error("Failed to post job:", err);
    }
  };

  // ---------------- Updated AI Shortlisting ---------------- //
  const shortlistCandidates = async (job) => {
    setLoading(true);
    try {
      const filteredCandidates = candidates.filter(
        (c) => c.jobTitle === job.title
      );

      if (!filteredCandidates.length) {
        alert("No candidates found for this job.");
        setLoading(false);
        return;
      }

      const analyzedResults = [];

      for (const candidate of filteredCandidates) {
        const resumeText = candidate.resumeText || "";
        let jobFormScore = 0;
        let resumeScore = 0;
        const matchSummary = [];

        // 1️⃣ JOB APPLICATION MATCH (50% weight)
        if (job.preferredQualifications && candidate.skills) {
          const preferredSkills = job.preferredQualifications
            .split(/[,•\n]/)
            .map((s) => s.trim().toLowerCase());
          const candidateSkills = candidate.skills
            .split(/[,•\n]/)
            .map((s) => s.trim().toLowerCase());
          const matchedSkills = preferredSkills.filter((s) =>
            candidateSkills.includes(s)
          );
          if (matchedSkills.length) {
            jobFormScore += (matchedSkills.length / preferredSkills.length) * 50;
            matchSummary.push(
              `Matched Preferred Skills: ${matchedSkills.join(", ")}`
            );
          }
        }

        if (job.qualifications && candidate.experience) {
          const required = job.qualifications
            .split(/[,•\n]/)
            .map((s) => s.trim().toLowerCase());
          const experience = candidate.experience.toLowerCase();
          const matchedExp = required.filter((req) => experience.includes(req));
          if (matchedExp.length) {
            jobFormScore +=
              (matchedExp.length / required.length) * 50;
            matchSummary.push(
              `Matched Required Qualifications: ${matchedExp.join(", ")}`
            );
          }
        }

        // Normalize to max 50
        jobFormScore = Math.min(jobFormScore, 50);

        // 2️⃣ RESUME TEXT MATCH (50% weight)
        if (resumeText) {
          const jobKeywords = [
            job.title,
            ...(job.responsibilities || "").split(/[,•\n]/),
            ...(job.qualifications || "").split(/[,•\n]/),
            ...(job.preferredQualifications || "").split(/[,•\n]/),
          ]
            .map((k) => k.trim().toLowerCase())
            .filter(Boolean);

          const resumeLower = resumeText.toLowerCase();
          const matchedResumeKeywords = jobKeywords.filter((k) =>
            resumeLower.includes(k)
          );
          if (matchedResumeKeywords.length) {
            resumeScore +=
              (matchedResumeKeywords.length / jobKeywords.length) * 50;
            matchSummary.push(
              `Resume matches keywords: ${matchedResumeKeywords
                .slice(0, 10)
                .join(", ")}`
            );
          }
        }

        // Total weighted score
        const totalScore = Math.round(jobFormScore + resumeScore);

        if (totalScore > 0) {
          analyzedResults.push({
            ...candidate,
            score: totalScore,
            summary: matchSummary.join(" | "),
          });

          // Update backend shortlisting
          await fetch(`http://localhost:5000/applications/${candidate._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              shortlisting: {
                score: totalScore,
                summary: matchSummary.join(" | "),
                modelRunAt: new Date(),
              },
            }),
          });
        }
      }

      if (!analyzedResults.length) {
        alert("No candidates matched the job requirements.");
      }

      const topShortlisted = analyzedResults
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      setShortlisted(topShortlisted);
      setShowModal(true);
    } catch (err) {
      console.error("AI Shortlisting Error:", err);
      alert("❌ Failed to shortlist candidates.");
    } finally {
      setLoading(false);
      fetchCandidates();
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex justify-between items-center p-4 bg-gray-900 shadow-md">
          <h1 className="text-3xl font-light text-white">
            HR Recruiter Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <button className="text-2xl">🔔</button>
            <img
              src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              alt="profile"
              className="w-9 h-9 rounded-full"
            />
          </div>
        </nav>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4">
          <DashboardCard
            title="Active Job Posts"
            value={jobs.length}
            icon="📢"
          />
          <DashboardCard
            title="Total Applicants"
            value={candidates.length}
            icon="📋"
          />
          <DashboardCard
            title="AI Shortlisted"
            value={shortlisted.length}
            icon="🤖"
          />
          <DashboardCard title="Interviews Scheduled" value="18" icon="📅" />
          <DashboardCard title="Hires Completed" value="6" icon="🏁" />
        </div>

        {/* Post Job Section */}
        <section className="p-8 flex flex-col items-center justify-center text-center">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="bg-indigo-600 text-white text-xl font-bold px-10 py-6 rounded-full shadow-lg hover:bg-green-700 hover:scale-105 transform transition-all duration-300"
            >
              + Post a Job
            </button>
          ) : (
            <div className="w-full max-w-4xl bg-gray-800 p-6 rounded-2xl shadow-lg">
              <h2 className="text-white text-2xl font-semibold mb-4">
                Post a New Job
              </h2>
              <JobPostForm onAdd={addJob} />
            </div>
          )}
        </section>

        {/* Job Cards */}
        <section className="p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Job Posts</h2>
          {jobs.length === 0 ? (
            <p className="text-gray-400 text-center">No jobs posted yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <div
                  key={job._id}
                  className="bg-indigo-100 p-5 rounded-xl shadow-md hover:shadow-2xl transition transform hover:-translate-y-1"
                >
                  <h3 className="text-indigo-800 font-bold text-lg mb-2">
                    {job.title}
                  </h3>
                  <p className="text-gray-700 text-sm mb-1">
                    📍 {job.location}
                  </p>
                  <p className="text-gray-700 text-sm mb-1">
                    💼 Work Model: {job.workModel}
                  </p>
                  <p className="text-gray-700 text-sm mb-1">
                    💰 Salary: {job.salaryRange || "N/A"}
                  </p>
                  {job.jobSummary && (
                    <p className="text-gray-600 text-sm mb-3 italic">
                      {job.jobSummary.length > 120
                        ? job.jobSummary.slice(0, 120) + "..."
                        : job.jobSummary}
                    </p>
                  )}
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={() => shortlistCandidates(job)}
                      disabled={loading}
                      className="bg-indigo-600 text-white px-3 py-1 rounded-lg font-semibold hover:bg-indigo-700 text-sm"
                    >
                      {loading ? "Analyzing..." : "Shortlist with AI 🤖"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Shortlist Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-start overflow-y-auto z-50 p-4">
            <div className="bg-gray-900 w-full max-w-6xl rounded-xl p-6 relative">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-white text-2xl font-bold"
              >
                ✖
              </button>
              <h2 className="text-3xl font-bold text-white mb-6 text-center">
                Top {shortlisted.length} AI-Shortlisted Candidate
                {shortlisted.length > 1 ? "s" : ""}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shortlisted.map((c) => (
                  <div
                    key={c._id}
                    className="bg-gray-500 p-4 rounded-lg shadow-md border border-gray-700"
                  >
                    <p className="font-bold text-green-400 text-lg mb-1">
                      {c.fullName}
                    </p>
                    <p>Email: {c.email}</p>
                    <p>Phone: {c.phone}</p>
                    <p>Address: {c.address}</p>
                    <p>Qualification: {c.qualification}</p>
                    <p>Eligibility: {c.eligibility}</p>
                    <p>Employment Type: {c.employmentType}</p>
                    <p>Experience: {c.experience}</p>
                    <p>Skills: {c.skills}</p>
                    <p>Expected Salary: {c.expectedSalary}</p>
                    <p>Preferred Location: {c.preferredLocation}</p>
                    <p>Notice Period: {c.noticePeriod}</p>
                    <p>Available Start Date: {c.startDate}</p>
                    <p>
                      LinkedIn:{" "}
                      <a
                        href={c.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-400 underline"
                      >
                        {c.linkedin}
                      </a>
                    </p>
                    <p>
                      GitHub/Portfolio:{" "}
                      <a
                        href={c.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 underline"
                      >
                        {c.github}
                      </a>
                    </p>
                    <p>References: {c.references}</p>
                    <p>Cover Letter: {c.coverLetter}</p>
                    {c.resumePath && (
                      <p>
                        Resume:{" "}
                        <button
                          onClick={async () => {
                            try {
                              const token =
                                localStorage.getItem("token"); // JWT token
                              if (!token) {
                                alert(
                                  "Please login to download the resume."
                                );
                                return;
                              }

                              const res = await fetch(
                                `http://localhost:5000/download/resume/${c._id}`,
                                {
                                  headers: {
                                    Authorization: `Bearer ${token}`,
                                  },
                                }
                              );

                              if (!res.ok) {
                                const err = await res.json();
                                alert(
                                  err.error || "Failed to download resume"
                                );
                                return;
                              }

                              const blob = await res.blob();
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement("a");
                              a.href = url;
                              a.download = c.resumePath.split("/").pop();
                              document.body.appendChild(a);
                              a.click();
                              a.remove();
                              window.URL.revokeObjectURL(url);
                            } catch (err) {
                              console.error(err);
                              alert("Failed to download resume");
                            }
                          }}
                          className="text-blue-400 underline bg-transparent border-none cursor-pointer p-0"
                        >
                          View/Download
                        </button>
                      </p>
                    )}

                    <p className="mt-2 font-semibold text-yellow-300">
                      AI Score: {c.score}/100
                    </p>
                    <p className="italic text-gray-300">{c.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Reports */}
        <section className="p-6">
          <h2 className="text-2xl font-bold text-white mb-3">
            Recruitment Reports
          </h2>
          <ReportsChart data={chartData} />
        </section>

        {/* AI Assistant */}
        <section className="p-6">
          <h2 className="text-2xl font-bold text-white mb-3">
            AI Assistant 🤖
          </h2>
          <AIAssistantPanel />
        </section>
      </div>
    </div>
  );
};

export default HRRecruiterDashboard;
