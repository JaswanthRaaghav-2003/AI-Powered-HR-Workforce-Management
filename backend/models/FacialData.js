const mongoose = require("mongoose");

const facialDataSchema = new mongoose.Schema({
  empId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  department: { type: String },
  descriptor: { type: [Number], required: true },
  employeeRef: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

facialDataSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("FacialData", facialDataSchema);
