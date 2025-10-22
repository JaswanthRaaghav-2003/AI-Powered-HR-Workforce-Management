const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
  due: { type: Date },
  status: { type: String, enum: ["Open", "In Progress", "Done"], default: "Open" },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Task", taskSchema);
