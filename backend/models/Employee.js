// models/Employee.js
const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  empId: { type: String, required: true, unique: true }, // company employee id
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, index: true },
  department: { type: String },
  jobTitle: { type: String },
  role:{ type: String },
  salaryPerAnnum: { type: Number },
  bankName: { type: String },
  dob: { type: Date },
  address: { type: String },
  mobile: { type: String },
  reportingManager: { type: String }, // store manager's empId or name
  attendancePct: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

employeeSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Employee", employeeSchema);
