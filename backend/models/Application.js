// models/Application.js
const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
  jobTitle: String,
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  address: String,
  eligibility: String,
  linkedin: String,
  github: String,
  qualification: String,
  expectedSalary: String,
  preferredLocation: String,
  noticePeriod: String,
  startDate: String,
  employmentType: String,
  experience: String,
  skills: String,
  references: String,
  coverLetter: String,
  resumePath: String,
  shortlisting: {
    score: Number,
    summary: String,
    modelRunAt: Date,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Application", applicationSchema);
