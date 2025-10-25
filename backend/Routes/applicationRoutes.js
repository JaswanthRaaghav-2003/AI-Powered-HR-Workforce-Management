const express = require("express");
const path = require("path");
const router = express.Router();
const multer = require("multer");
const Application = require("../models/Application");

// ------------------- FILE UPLOAD SETUP ------------------- //
const uploadsDir = path.join(__dirname, "../uploads");
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_")),
});
const upload = multer({ storage });

// ------------------- HELPER FUNCTION ------------------- //
function safeParseJSON(value) {
  if (!value) return value;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

// ------------------- APPLICATION ROUTES ------------------- //

// POST new application
router.post("/", upload.single("resume"), async (req, res) => {
  try {
    const body = req.body;
    const resumeFile = req.file
      ? `/uploads/${path.basename(req.file.path)}`
      : null;
    let skills = body.skills || "";

    if (
      typeof skills === "string" &&
      (skills.startsWith("[") || skills.startsWith("{"))
    )
      skills = safeParseJSON(skills);

    const newApp = new Application({
      jobTitle: body.jobTitle || null,
      fullName: body.fullName || "",
      email: body.email || "",
      phone: body.phone || "",
      address: body.address || "",
      eligibility: body.eligibility || "",
      linkedin: body.linkedin || "",
      github: body.github || "",
      qualification: body.qualification || "",
      expectedSalary: body.expectedSalary || "",
      preferredLocation: body.preferredLocation || "",
      noticePeriod: body.noticePeriod || "",
      startDate: body.startDate || "",
      employmentType: body.employmentType || "",
      experience: body.experience || "",
      skills: typeof skills === "object" ? JSON.stringify(skills) : skills,
      references: body.references || "",
      coverLetter: body.coverLetter || "",
      resumePath: resumeFile,
    });

    await newApp.save();
    res.json({ ok: true, application: newApp });
  } catch (error) {
    console.error("Error in POST /applications:", error);
    res
      .status(500)
      .json({ error: "Failed to create application", message: error.message });
  }
});

// GET applications
router.get("/", async (req, res) => {
  try {
    const query = {};
    if (req.query.jobId) query.jobId = req.query.jobId;

    const apps = await Application.find(query)
      .populate("userId", "name email")
      .populate("jobId", "title department");

    res.json(apps);
  } catch (error) {
    console.error("Error in GET /applications:", error);
    res
      .status(500)
      .json({ error: "Failed to get applications", message: error.message });
  }
});

module.exports = router;
