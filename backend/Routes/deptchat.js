const express = require("express");
const router = express.Router();
const DepartmentMessage = require("../models/DepartmentMessage");
const jwt = require("jsonwebtoken");
const Employee = require("../models/Employee");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token required" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = decoded;
    next();
  });
}

// Fetch all previous messages of a department
router.get("/:department", authenticateToken, async (req, res) => {
  try {
    const { department } = req.params;
    const messages = await DepartmentMessage.find({ department })
      .populate("sender", "name email")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Failed to load messages" });
  }
});

module.exports = router;
