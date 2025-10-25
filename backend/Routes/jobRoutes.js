const express = require("express");
const router = express.Router();
const Job = require("../models/Job");

// ------------------- JOB ROUTES ------------------- //

// GET all jobs
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find().populate("postedBy", "name email");
    res.json(jobs);
  } catch (error) {
    console.error("Error in GET /jobs:", error);
    res
      .status(500)
      .json({ error: "Failed to get jobs", message: error.message });
  }
});

// POST a new job
router.post("/", async (req, res) => {
  try {
    const newJob = new Job({ ...req.body });
    await newJob.save();
    res.status(201).json({ ok: true, job: newJob });
  } catch (error) {
    console.error("Error in POST /jobs:", error);
    res
      .status(500)
      .json({ error: "Failed to create job", message: error.message });
  }
});

module.exports = router;
