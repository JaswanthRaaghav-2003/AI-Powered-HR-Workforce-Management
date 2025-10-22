const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  empId: { type: String, required: true, index: true },
  employeeRef: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  date: { type: String, required: true },
  inTime: { type: Date },
  outTime: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

attendanceSchema.index({ empId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
