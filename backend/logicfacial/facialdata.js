const express = require("express");
const router = express.Router();
const FacialData = require("../models/FacialData");
const Employee = require("../models/Employee");
const Attendance = require("../models/Attendance");

/** Compute Euclidean distance between two face descriptors */
function euclideanDistance(a, b) {
  if (!a || !b || a.length !== b.length) return Infinity;
  return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0));
}

/** Bulk upload facial data */
router.post("/api/facial/bulk-upload", async (req, res) => {
  try {
    const { records } = req.body;
    if (!Array.isArray(records) || !records.length)
      return res.status(400).json({ error: "No records provided" });

    const summary = { inserted: 0, updated: 0, errors: [] };

    for (let i = 0; i < records.length; i++) {
      const r = records[i];
      if (!r.empId || !r.name || !Array.isArray(r.descriptor)) {
        summary.errors.push({ row: i + 1, reason: "Missing empId, name, or descriptor" });
        continue;
      }

      const employee = await Employee.findOne({ empId: r.empId });
      const existing = await FacialData.findOne({ empId: r.empId });

      const payload = {
        empId: r.empId,
        name: r.name,
        department: r.department || employee?.department || "",
        descriptor: r.descriptor.map(Number),
        employeeRef: employee?._id || null,
      };

      if (existing) {
        await FacialData.updateOne({ _id: existing._id }, { $set: payload });
        summary.updated++;
      } else {
        await FacialData.create(payload);
        summary.inserted++;
      }
    }

    return res.json({ success: true, summary });
  } catch (err) {
    console.error("Bulk upload error:", err);
    return res.status(500).json({ error: "Server error", detail: err.message });
  }
});

/** List all facial data (admin) */
router.get("/api/facial/list", async (req, res) => {
  try {
    const list = await FacialData.find().limit(1000);
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** Match face descriptor and update attendance */
router.post("/api/facial/match", async (req, res) => {
  try {
    const { descriptor, threshold = 0.6 } = req.body;
    if (!Array.isArray(descriptor)) return res.status(400).json({ error: "Missing descriptor" });

    const allFaces = await FacialData.find({});
    if (!allFaces.length) return res.status(404).json({ error: "No facial data available" });

    // Find closest match
    let best = { empId: null, distance: Infinity };
    for (const f of allFaces) {
      const dist = euclideanDistance(descriptor, f.descriptor);
      if (dist < best.distance) best = { empId: f.empId, name: f.name, department: f.department, distance: dist };
    }

    if (best.distance > threshold)
      return res.status(404).json({ success: false, error: "No match", best });

    const today = new Date();
    const dateKey = today.toISOString().split("T")[0]; // YYYY-MM-DD
    const employee = await Employee.findOne({ empId: best.empId });

    // Upsert attendance for today
    let att = await Attendance.findOne({ empId: best.empId, date: dateKey });
    const now = new Date();
    if (!att) {
      att = await Attendance.create({
        empId: best.empId,
        employeeRef: employee?._id || null,
        date: dateKey,
        inTime: now,
      });
    } else {
      att.outTime = now; // always update outTime to latest detection
      await att.save();
    }

    // Compute monthly attendance percentage
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthAtt = await Attendance.find({
      empId: best.empId,
      date: { $regex: `^${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}` },
    });
    const daysPresent = new Set(monthAtt.map(a => a.date)).size;
    const daysPassed = today.getDate();
    const attendancePct = Math.round((daysPresent / daysPassed) * 100);

    if (employee) {
      employee.attendancePct = attendancePct;
      await employee.save();
    }

    return res.json({
      success: true,
      match: best,
      attendance: {
        empId: best.empId,
        date: dateKey,
        inTime: att.inTime,
        outTime: att.outTime,
        attendancePct,
      },
    });
  } catch (err) {
    console.error("Face match error:", err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
