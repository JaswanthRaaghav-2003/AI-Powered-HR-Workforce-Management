const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema({
  employeeEmpId: { type: String, required: true },
  employeeName: { type: String, required: true },
  managerEmpId: { type: String },
  type: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  reason: { type: String },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  days: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Leave", leaveSchema);
