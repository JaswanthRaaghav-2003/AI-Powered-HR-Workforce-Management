const mongoose = require("mongoose");

const departmentMessageSchema = new mongoose.Schema({
  department: { type: String, required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("DepartmentMessage", departmentMessageSchema);
