// routes/authRoutes.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { authenticateToken } = require("../middleware/authMiddleware"); // optional if already in use
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// ------------------- AUTH ROUTES ------------------- //

// POST /signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, role, department, password, confirmPassword } =
      req.body;

    if (!name || !email || !role || !password || !confirmPassword)
      return res.status(400).json({ error: "All fields are required" });

    if (password !== confirmPassword)
      return res.status(400).json({ error: "Passwords do not match" });

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser)
      return res.status(409).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      role,
      department: role === "HR Manager" ? undefined : department,
      password: hashedPassword,
      status: "Pending",
    });

    await newUser.save();

    // Notify Admin
    await Notification.create({
      message: `${name} (${email}) has signed up and awaits admin approval.`,
      type: "User",
      relatedUser: newUser._id,
    });

    res.status(201).json({
      ok: true,
      message: "Signup successful. Awaiting admin approval.",
    });
  } catch (err) {
    console.error("Error in /signup:", err);
    res.status(500).json({ error: "Wait Until Admin Approves Your Request." });
  }
});

// POST /login
router.post("/login", async (req, res) => {
  try {
    const { nameOrEmail, password } = req.body;
    if (!nameOrEmail || !password)
      return res
        .status(400)
        .json({ error: "Name/Email and password are required" });

    const user = await User.findOne({
      $or: [
        { email: nameOrEmail.toLowerCase() },
        { name: new RegExp(`^${nameOrEmail}$`, "i") },
      ],
    });

    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: "Invalid credentials" });

    // ✅ Allow Admin login without approval
    if (user.role !== "Admin") {
      if (user.status === "Pending")
        return res.status(403).json({ error: "Awaiting admin approval." });
      if (user.status === "Rejected")
        return res.status(403).json({ error: "Your request was rejected." });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      ok: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        status: user.status,
      },
    });
  } catch (err) {
    console.error("Error in /login:", err);
    res.status(500).json({ error: "Failed to login" });
  }
});

// GET /me
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ ok: true, user });
  } catch (error) {
    console.error("Error in GET /me:", error);
    res
      .status(500)
      .json({ error: "Failed to get user data", message: error.message });
  }
});

// GET /users → Admin-only access
router.get("/users", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "Admin")
      return res.status(403).json({ error: "Access denied. Admin only." });

    const users = await User.find().select("-password");
    res.json({ ok: true, users });
  } catch (error) {
    console.error("Error in GET /users:", error);
    res
      .status(500)
      .json({ error: "Failed to get users", message: error.message });
  }
});

module.exports = router;
