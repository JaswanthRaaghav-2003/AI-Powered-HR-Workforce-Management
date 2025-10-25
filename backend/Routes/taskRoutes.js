const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authMiddleware");
const Task = require("../models/Task");
const Employee = require("../models/Employee");

// You can import this from your server context if you use sockets globally
let io;
let activeUsers;

// Allow the server to inject io and activeUsers
function initTaskRoutes(socketIO, usersMap) {
  io = socketIO;
  activeUsers = usersMap;
  return router;
}

// ------------------- TASK ROUTES ------------------- //

// Assign a task manually via API
router.post("/assign", authenticateToken, async (req, res) => {
  try {
    const { assignedToId, name, description, priority, due } = req.body;

    if (!assignedToId || !name)
      return res.status(400).json({ error: "Employee and task name required" });

    const manager = await Employee.findOne({ email: req.user.email });
    if (!manager || !["Manager", "Senior Manager"].includes(manager.role)) {
      return res.status(403).json({ error: "Only managers can assign tasks" });
    }

    const task = await Task.create({
      name,
      description,
      priority,
      due,
      assignedBy: manager._id,
      assignedTo: assignedToId,
    });

    // Emit task to employee if connected
    const recipientSocket = activeUsers?.get(assignedToId);
    if (recipientSocket && io) {
      io.to(recipientSocket).emit("receivePrivateMessage", {
        message: name,
        from: manager._id,
        asTask: true,
        task,
      });
    }

    res.json({ ok: true, task });
  } catch (err) {
    console.error("Error assigning task:", err);
    res.status(500).json({ error: "Failed to assign task", details: err.message });
  }
});

// Fetch tasks of an employee
router.get("/:employeeId", authenticateToken, async (req, res) => {
  try {
    const employeeId = req.params.employeeId;
    const tasks = await Task.find({ assignedTo: employeeId }).sort({
      createdAt: -1,
    });
    res.json({ ok: true, tasks, personalTodos: [] });
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ error: "Failed to fetch tasks", details: err.message });
  }
});

// Fetch team members of a manager
router.get("/team/:managerId", async (req, res) => {
  try {
    const managerId = req.params.managerId;
    const team = await Employee.find({
      reportingManager: managerId,
    }).select("name email department empId role jobTitle");

    res.json({ employees: team });
  } catch (err) {
    console.error("Error fetching team:", err);
    res.status(500).json({ message: "Server error fetching team" });
  }
});

module.exports = initTaskRoutes;
