const mongoose = require("mongoose");

const performanceReviewSchema = new mongoose.Schema({
  employeeEmpId: { type: String, required: true },
  managerEmpId: { type: String, required: true },
  rating: { type: Number, required: true },
  note: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("PerformanceReview", performanceReviewSchema);
