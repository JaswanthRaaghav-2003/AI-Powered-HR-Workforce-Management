// routes/notificationRoutes.js
const express = require("express");
const Notification = require("../models/Notification");
const User = require("../models/User");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Get all signup notifications (Admin only)
router.get("/api/notifications", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "Admin")
      return res.status(403).json({ error: "Access denied. Admin only." });

    const pendingUsers = await User.find({ status: "Pending" }).select(
      "name email department role status createdAt"
    );

    res.json(pendingUsers);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// Add a new notification manually
router.post("/add-notification", async (req, res) => {
  try {
    const { message, type } = req.body;
    const notification = new Notification({ message, type });
    await notification.save();
    res.json({ ok: true, notification });
  } catch (error) {
    res.status(500).json({ error: "Failed to create notification" });
  }
});

router.get("/pending-users", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "Admin")
      return res.status(403).json({ error: "Access denied" });
    const pendingUsers = await User.find({ status: "Pending" }).select(
      "-password"
    );
    res.json({ ok: true, users: pendingUsers });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch pending users" });
  }
});

// ✅ Approve a user signup
router.post(
  "/api/notifications/approve/:id",
  authenticateToken,
  async (req, res) => {
    try {
      if (req.user.role !== "Admin")
        return res.status(403).json({ error: "Access denied" });

      const user = await User.findByIdAndUpdate(
        req.params.id,
        { status: "Approved" },
        { new: true }
      );

      if (!user) return res.status(404).json({ error: "User not found" });

      await Notification.create({
        message: `Your account has been approved by the Admin.`,
        type: "Approval",
        recipient: user._id,
      });

      res.json({ ok: true, message: "User approved successfully" });
    } catch (err) {
      console.error("Error approving user:", err);
      res.status(500).json({ error: "Failed to approve user" });
    }
  }
);

// ✅ Reject a user signup
router.post(
  "/api/notifications/reject/:id",
  authenticateToken,
  async (req, res) => {
    try {
      if (req.user.role !== "Admin")
        return res.status(403).json({ error: "Access denied" });

      const user = await User.findByIdAndUpdate(
        req.params.id,
        { status: "Rejected" },
        { new: true }
      );

      if (!user) return res.status(404).json({ error: "User not found" });

      await Notification.create({
        message: `Your signup request has been rejected by the Admin.`,
        type: "Rejection",
        recipient: user._id,
      });

      res.json({ ok: true, message: "User rejected successfully" });
    } catch (err) {
      console.error("Error rejecting user:", err);
      res.status(500).json({ error: "Failed to reject user" });
    }
  }
);

// GET /notifications/me
router.get("/notifications/me", authenticateToken, async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [{ recipient: req.user.id }, { recipient: null }],
    })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ ok: true, notifications });
  } catch (error) {
    console.error("Error in GET /notifications/me:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch notifications", details: error.message });
  }
});

// PATCH /notifications/:id/read
router.patch("/notifications/:id/read", authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification)
      return res.status(404).json({ error: "Notification not found" });

    if (
      notification.recipient &&
      notification.recipient.toString() !== req.user.id &&
      req.user.role !== "Admin"
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    notification.isRead = true;
    await notification.save();
    res.json({ ok: true, notification });
  } catch (error) {
    console.error("Error in PATCH /notifications/:id/read:", error);
    res
      .status(500)
      .json({ error: "Failed to update notification", details: error.message });
  }
});

module.exports = router;
