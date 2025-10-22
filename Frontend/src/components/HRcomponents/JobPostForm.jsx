import React, { useState } from "react";

const JobPostForm = ({ onAdd }) => {
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    workModel: "",
    jobSummary: "",
    responsibilities: "",
    qualifications: "",
    preferredQualifications: "",
    salaryRange: "",
    companyOverview: "",
    benefits: "",
    howToApply: "",
    eeoStatement: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Job Posted:", formData);
    alert("Job posted successfully!");
    onAdd(formData);
    setFormData({
      title: "",
      location: "",
      workModel: "",
      jobSummary: "",
      responsibilities: "",
      qualifications: "",
      preferredQualifications: "",
      salaryRange: "",
      companyOverview: "",
      benefits: "",
      howToApply: "",
      eeoStatement: "",
    });
  };

  return (
    <div className="max-w-2xl mx-auto bg-gradient-to-br from-white to-gray-50 shadow-md rounded-xl p-6 sm:p-8 text-sm">
      <h2 className="text-2xl font-semibold mb-5 text-center text-gray-800">
        Create a Job Posting
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Job Title */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Job Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Senior Frontend Developer (React)"
            className="p-2 border rounded-md w-full"
            required
          />
        </div>

        {/* Location & Work Model */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Location *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Coimbatore, Tamil Nadu"
              className="p-2 border rounded-md w-full"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Work Model *
            </label>
            <select
              name="workModel"
              value={formData.workModel}
              onChange={handleChange}
              className="p-2 border rounded-md w-full"
              required
            >
              <option value="">Select</option>
              <option value="On-site">On-site</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Remote">Remote</option>
            </select>
          </div>
        </div>

        {/* Job Summary */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Job Summary *
          </label>
          <textarea
            name="jobSummary"
            value={formData.jobSummary}
            onChange={handleChange}
            placeholder="A brief engaging paragraph summarizing the role’s purpose and impact."
            className="p-2 border rounded-md w-full min-h-[80px]"
            required
          />
        </div>

        {/* Key Responsibilities */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Key Responsibilities *
          </label>
          <textarea
            name="responsibilities"
            value={formData.responsibilities}
            onChange={handleChange}
            placeholder={`List the main duties and tasks.\nExample:\n• Develop, test, and deploy scalable user features.\n• Collaborate with designers.\n• Optimize applications for speed.`}
            className="p-2 border rounded-md w-full min-h-[100px]"
            required
          />
        </div>

        {/* Required Qualifications */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Required Qualifications (Must-Haves) *
          </label>
          <textarea
            name="qualifications"
            value={formData.qualifications}
            onChange={handleChange}
            placeholder={`Example:\n• Bachelor’s degree in Computer Science or related field.\n• 5+ years experience in Frontend Development.\n• Expert in React.js, HTML5, CSS3.`}
            className="p-2 border rounded-md w-full min-h-[100px]"
            required
          />
        </div>

        {/* Preferred Qualifications */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Preferred Qualifications (Nice-to-Haves)
          </label>
          <textarea
            name="preferredQualifications"
            value={formData.preferredQualifications}
            onChange={handleChange}
            placeholder={`Example:\n• Experience with Node.js or AWS.\n• Prior experience in Agile environments.`}
            className="p-2 border rounded-md w-full min-h-[80px]"
          />
        </div>

        {/* Salary Range */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Salary Range
          </label>
          <input
            type="text"
            name="salaryRange"
            value={formData.salaryRange}
            onChange={handleChange}
            placeholder="e.g. ₹12,00,000 - ₹18,00,000 per annum"
            className="p-2 border rounded-md w-full"
          />
        </div>

        {/* Company Overview */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Company Overview & Culture
          </label>
          <textarea
            name="companyOverview"
            value={formData.companyOverview}
            onChange={handleChange}
            placeholder={`Example:\nAt [Company Name], our mission is to [Your Mission]. We value collaboration, innovation, and a healthy work-life balance.`}
            className="p-2 border rounded-md w-full min-h-[80px]"
          />
        </div>

        {/* Benefits */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Benefits & Perks
          </label>
          <textarea
            name="benefits"
            value={formData.benefits}
            onChange={handleChange}
            placeholder={`Example:\n• Comprehensive health insurance\n• Paid time off and flexible work hours\n• Annual learning budget\n• PF and bonuses`}
            className="p-2 border rounded-md w-full min-h-[80px]"
          />
        </div>

        {/* How to Apply */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            How to Apply *
          </label>
          <textarea
            name="howToApply"
            value={formData.howToApply}
            onChange={handleChange}
            placeholder={`Example:\nSubmit your updated resume and a link to your GitHub or portfolio.\nA cover letter is optional but appreciated.`}
            className="p-2 border rounded-md w-full min-h-[60px]"
            required
          />
        </div>

        {/* EEO Statement */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Equal Opportunity Statement (Optional)
          </label>
          <textarea
            name="eeoStatement"
            value={formData.eeoStatement}
            onChange={handleChange}
            placeholder="We are an Equal Opportunity Employer and value diversity in our company."
            className="p-2 border rounded-md w-full min-h-[60px]"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white px-4 py-2.5 rounded-md hover:bg-indigo-700 font-medium text-sm mt-4 transition-all duration-200"
        >
          Post Job
        </button>
      </form>
    </div>
  );
};

export default JobPostForm;
