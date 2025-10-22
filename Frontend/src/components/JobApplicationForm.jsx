


import React, { useState } from "react";

const JobApplicationForm = ({ job, onBack }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    eligibility: "",
    linkedin: "",
    github: "",
    qualification: "",
    expectedSalary: "",
    preferredLocation: "",
    noticePeriod: "",
    startDate: "",
    employmentType: "",
    experience: "",
    skills: "",
    references: "",
    resume: null,
    coverLetter: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") setFormData((prev) => ({ ...prev, [name]: files[0] }));
    else setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!formData.fullName || !formData.email || !formData.resume) {
      setError("Please fill required fields and attach a resume.");
      return;
    }

    try {
      setLoading(true);
      const fd = new FormData();
      
      // Only append non-empty values
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "resume") {
          // Handle file separately
          if (value) {
            fd.append("resume", value);
          }
        } else if (value !== null && value !== undefined && value !== "") {
          // Only append non-empty string values
          fd.append(key, String(value).trim());
        }
      });
      
      // Add job information
      fd.append("jobId", String(job.id));
      fd.append("jobTitle", String(job.title));

      console.log("Submitting application for job:", job.id);

      const res = await fetch("http://localhost:5000/applications", { 
        method: "POST", 
        body: fd 
      });
      
      // Get response text first for debugging
      const responseText = await res.text();
      console.log("Response status:", res.status);
      console.log("Response text:", responseText);

      if (!res.ok) {
        let errorMessage = "Failed to submit application";
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Parse successful response
      const data = JSON.parse(responseText);
      console.log("Application submitted:", data);

      alert("Application submitted successfully ✅");

      // Reset form
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        eligibility: "",
        linkedin: "",
        github: "",
        qualification: "",
        expectedSalary: "",
        preferredLocation: "",
        noticePeriod: "",
        startDate: "",
        employmentType: "",
        experience: "",
        skills: "",
        references: "",
        resume: null,
        coverLetter: "",
      });

      // Reset file input
      const fileInput = document.getElementById("resume-upload");
      if (fileInput) fileInput.value = "";

      onBack();
    } catch (err) {
      console.error("Error submitting application:", err);
      setError(err.message || "Error submitting application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-gradient-to-br from-white via-gray-50 to-gray-100 shadow-lg rounded-xl p-6 sm:p-8 text-sm">
      <button 
        onClick={onBack} 
        className="text-indigo-600 hover:underline text-xs mb-3"
      >
        ← Back to Jobs
      </button>
      
      <h1 className="text-xl font-semibold mb-5 text-gray-800 text-center">
        {job.title} - Application Form
      </h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input 
            name="fullName" 
            value={formData.fullName} 
            onChange={handleChange} 
            placeholder="Full Name *" 
            className="p-2 border rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
            required 
          />
          
          <input 
            name="email" 
            type="email" 
            value={formData.email} 
            onChange={handleChange} 
            placeholder="Email Address *" 
            className="p-2 border rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
            required 
          />
          
          <input 
            name="phone" 
            type="tel" 
            value={formData.phone} 
            onChange={handleChange} 
            placeholder="Phone *" 
            className="p-2 border rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
            required 
          />
          
          <input 
            name="address" 
            value={formData.address} 
            onChange={handleChange} 
            placeholder="Address *" 
            className="p-2 border rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
            required 
          />
          
          <input 
            name="qualification" 
            value={formData.qualification} 
            onChange={handleChange} 
            placeholder="Highest Qualification *" 
            className="p-2 border rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
            required 
          />
          
          <select 
            name="eligibility" 
            value={formData.eligibility} 
            onChange={handleChange} 
            className="p-2 border rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
            required
          >
            <option value="">Eligibility to Work *</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
          
          <select 
            name="employmentType" 
            value={formData.employmentType} 
            onChange={handleChange} 
            className="p-2 border rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">Employment Type</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
          </select>
          
          <input 
            name="expectedSalary" 
            value={formData.expectedSalary} 
            onChange={handleChange} 
            placeholder="Expected Salary" 
            className="p-2 border rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
          />
          
          <input 
            name="preferredLocation" 
            value={formData.preferredLocation} 
            onChange={handleChange} 
            placeholder="Preferred Location" 
            className="p-2 border rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
          />
          
          <input 
            name="noticePeriod" 
            value={formData.noticePeriod} 
            onChange={handleChange} 
            placeholder="Notice Period (days)" 
            className="p-2 border rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
          />
          
          <div>
            <label className="block text-[11px] text-gray-600 ml-1 mb-1">
              Available Start Date *
            </label>
            <input 
              name="startDate" 
              value={formData.startDate} 
              onChange={handleChange} 
              type="date" 
              className="p-2 border rounded-md w-full text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
              required 
            />
          </div>
          
          <input 
            name="linkedin" 
            type="url" 
            value={formData.linkedin} 
            onChange={handleChange} 
            placeholder="LinkedIn URL" 
            className="p-2 border rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
          />
          
          <input 
            name="github" 
            type="url" 
            value={formData.github} 
            onChange={handleChange} 
            placeholder="GitHub / Portfolio URL" 
            className="p-2 border rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
          />
        </div>

        <textarea 
          name="experience" 
          value={formData.experience} 
          onChange={handleChange} 
          placeholder="Work Experience" 
          className="p-2 border rounded-md w-full min-h-[80px] text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
        />
        
        <textarea 
          name="skills" 
          value={formData.skills} 
          onChange={handleChange} 
          placeholder="Key Skills & Tools (e.g., JavaScript, React, Node.js)" 
          className="p-2 border rounded-md w-full min-h-[80px] text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
        />

        <div>
          <label 
            htmlFor="resume-upload" 
            className="block text-xs font-medium text-gray-700 mb-1"
          >
            Upload Resume (PDF/DOC/TXT) *
          </label>
          <input 
            id="resume-upload" 
            name="resume" 
            type="file" 
            onChange={handleChange} 
            accept=".pdf,.doc,.docx,.txt" 
            className="block w-full cursor-pointer rounded-md border border-gray-300 bg-gray-50 text-xs text-gray-900 focus:outline-none file:mr-3 file:border-0 file:bg-gray-200 file:px-3 file:py-2 file:font-medium hover:file:bg-gray-300" 
            required 
          />
        </div>

        <textarea 
          name="references" 
          value={formData.references} 
          onChange={handleChange} 
          placeholder="References (optional)" 
          className="p-2 border rounded-md w-full min-h-[60px] text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
        />
        
        <textarea 
          name="coverLetter" 
          value={formData.coverLetter} 
          onChange={handleChange} 
          placeholder="Cover Letter (optional)" 
          className="p-2 border rounded-md w-full min-h-[90px] text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
        />

        <button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-indigo-600 text-white px-4 py-2.5 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-sm mt-3 transition-all duration-200"
        >
          {loading ? "Submitting..." : "Submit Application"}
        </button>
      </form>
    </div>
  );
};

export default JobApplicationForm;