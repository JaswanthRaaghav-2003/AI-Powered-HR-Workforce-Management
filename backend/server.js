require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const axios = require("axios");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pdfParse = require("pdf-parse");
const textract = require("textract");
const xlsx = require("xlsx");
const Employee = require("./models/Employee");
const Notification = require("./models/Notification");
const User = require("./models/User"); 
const Leave = require("./models/Leave");
const Message = require("./models/Message");
const Job = require("./models/Job");
const Application = require("./models/Application");
const http = require("http");
const { Server } = require("socket.io");
const Task = require("./models/Task");
const PerformanceReview = require("./models/PerformanceReview");
const facialRouter = require("./logicfacial/facialdata"); 
const Attendance = require("./models/Attendance");
const authRoutes = require("./Routes/authRoutes");
const notificationRoutes = require("./Routes/notificationRoutes");
const jobRoutes = require("./Routes/jobRoutes");
const applicationRoutes = require("./Routes/applicationRoutes");
const initTaskRoutes = require("./Routes/taskRoutes");



const app = express();
app.use(cors());

const PORT = process.env.PORT || 5000;
const JWT_SECRET =
  process.env.JWT_SECRET ||
  "your-super-secret-jwt-key-change-this-in-production";
const PALM_API_KEY =
  process.env.GEMINI_API_KEY || "AIzaSyDmTIp6OlpUjpQuDJWIfmAFekYdZcNy1qo";
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://Username:Password@cluster0.r0dbrfy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Ensure uploads directory
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + "-" + file.originalname.replace(/\s+/g, "_"));
  },
});
const upload = multer({ storage });

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});


const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000"], // frontend origin - adjust for production
    credentials: true,
  },
});

const activeUsers = new Map(); 

// Body parser
app.use(
  express.json({
    verify: (req, res, buf, encoding) => {
      try {
        JSON.parse(buf);
      } catch (e) {
        console.error("Invalid JSON received:", buf.toString());
        throw new Error("Invalid JSON in request body");
      }
    },
  })
);

app.use("/", authRoutes);
app.use("/", notificationRoutes);
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "10mb" })); // allow large payloads for descriptors
app.use(express.urlencoded({ extended: true }));
app.use(facialRouter);
app.use("/jobs", jobRoutes);
app.use("/applications", applicationRoutes);
app.use("/tasks", initTaskRoutes(io, activeUsers));

app.use("/uploads", express.static(uploadsDir));


app.get("/", (req, res) => res.send("HRMS Facial Attendance Server Running"));

// ------------------- MONGODB CONNECTION ------------------- //
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });


// ------------------- MIDDLEWARE ------------------- //

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Access token required" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token" });
    req.user = user;
    next();
  });
};



// reuse uploadsDir from your server.js; if not defined, set one
const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + "-" + file.originalname.replace(/\s+/g, "_"));
  },
});
const uploadSingle = multer({ storage: uploadStorage }).single("file");



// BULK UPLOAD
app.post("/bulk-upload", authenticateToken, async (req, res) => {
  // Admin only
  if (req.user.role !== "Admin")
    return res.status(403).json({ error: "Access denied" });

  uploadSingle(req, res, async function (err) {
    if (err) {
      console.error("Multer error:", err);
      return res
        .status(500)
        .json({ error: "File upload failed", details: err.message });
    }
    if (!req.file)
      return res.status(400).json({
        error:
          "No file uploaded. Provide a .xlsx or .csv file under field name 'file'.",
      });

    const filePath = req.file.path;
    try {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows = xlsx.utils.sheet_to_json(worksheet, { defval: "" });

      let createdCount = 0;
      let updatedCount = 0;
      const errors = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];

        const norm = (k) => (k || "").toString().trim().toLowerCase();
        const val = (keys) => {
          for (const k of keys) {
            const found = Object.keys(row).find((rk) => norm(rk) === k);
            if (found) return row[found];
          }
          return "";
        };

        const empId = (val(["empid", "employee id", "employeeid", "id"]) || "")
          .toString()
          .trim();
        const name = (val(["name", "employee name", "full name"]) || "")
          .toString()
          .trim();
        const email = (val(["email", "email id", "emailid"]) || "")
          .toString()
          .trim()
          .toLowerCase();
        const department = (val(["dept", "department"]) || "")
          .toString()
          .trim();
        const jobTitle = (val(["job title", "designation", "title"]) || "")
          .toString()
          .trim();
        const role = (val(["role", "user role"]) || "Employee")
          .toString()
          .trim();
        const salaryRaw = val([
          "salary",
          "salary per annum",
          "salarypa",
          "salary_per_annum",
        ]);
        const salaryPerAnnum =
          Number(String(salaryRaw).replace(/[^\d.-]/g, "")) || 0;
        const bankName = (val(["bank", "bank name", "bankname"]) || "")
          .toString()
          .trim();
        const dobRaw = val(["dob", "date of birth", "birthdate"]);
        const dob = dobRaw ? new Date(dobRaw) : null;
        const address = (val(["address"]) || "").toString().trim();
        const mobile = (val(["mobile", "mobile number", "phone", "phone number"]) || "")
          .toString()
          .trim();
        const reportingManager = (val([
          "reporting manager",
          "manager",
          "reporting_manager",
        ]) || "")
          .toString()
          .trim();
        const attendanceRaw = val([
          "attendance",
          "attendance %",
          "attendance percentage",
          "attendancepct",
        ]);
        const attendancePct =
          Number(String(attendanceRaw).replace(/[^\d.-]/g, "")) || 0;

        if (!email || !name || !empId) {
          errors.push({
            row: i + 2,
            reason: "Missing required fields (empId/name/email)",
          });
          continue;
        }

        try {
          // ✅ Upsert Employee
          const existingEmployee = await Employee.findOne({ empId });
          if (existingEmployee) {
            existingEmployee.name = name;
            existingEmployee.email = email;
            existingEmployee.department = department;
            existingEmployee.jobTitle = jobTitle;
            existingEmployee.role = role; // ✅ Save role in Employee collection
            existingEmployee.salaryPerAnnum = salaryPerAnnum;
            existingEmployee.bankName = bankName;
            existingEmployee.dob = dob || existingEmployee.dob;
            existingEmployee.address = address;
            existingEmployee.mobile = mobile;
            existingEmployee.reportingManager = reportingManager;
            existingEmployee.attendancePct = attendancePct;
            await existingEmployee.save();
            updatedCount++;
          } else {
            await Employee.create({
              empId,
              name,
              email,
              department,
              jobTitle,
              role, // ✅ New employee gets role
              salaryPerAnnum,
              bankName,
              dob,
              address,
              mobile,
              reportingManager,
              attendancePct,
            });
            createdCount++;
          }

          // ✅ Sync with User collection
          const existingUser = await User.findOne({ email: email.toLowerCase() });

          if (existingUser) {
            existingUser.name = name;
            existingUser.department = department || existingUser.department;

            // 🧩 Don't overwrite Admin role
            if (existingUser.role !== "Admin") {
              existingUser.role = role || "Employee"; // ✅ Update user role from Excel
            }

            await existingUser.save();
          } else {
            const defaultPassword = await bcrypt.hash("Welcome@123", 10);
            await User.create({
              name,
              email: email.toLowerCase(),
              role: role || "Employee",
              department,
              password: defaultPassword,
              status: "Approved",
            });
          }
        } catch (errInner) {
          console.error("Row process error:", errInner);
          errors.push({ row: i + 2, reason: errInner.message });
          continue;
        }
      }

      return res.json({
        ok: true,
        message: "Bulk upload processed successfully",
        summary: {
          created: createdCount,
          updated: updatedCount,
          errorsCount: errors.length,
        },
        errors,
      });
    } catch (parseErr) {
      console.error("Bulk parse error:", parseErr);
      return res
        .status(500)
        .json({ error: "Failed to parse file", message: parseErr.message });
    } finally {
      // Optionally delete file
      // fs.unlinkSync(filePath);
    }
  });
});


// Return the employee record for the signed-in user (match by email in JWT)
app.get("/employee/me", authenticateToken, async (req, res) => {
  try {
    const email = req.user.email?.toLowerCase();
    if (!email) return res.status(400).json({ error: "Invalid user token" });
    const employee = await Employee.findOne({ email }).lean();
    if (!employee) return res.status(404).json({ error: "Employee record not found" });
    res.json({ ok: true, employee });
  } catch (err) {
    console.error("Error GET /employee/me:", err);
    res.status(500).json({ error: "Failed to fetch employee", details: err.message });
  }
});

// Return all employees in a department (for Team Directory & Department Chat)
app.get("/employees/department/:dept", authenticateToken, async (req, res) => {
  try {
    const dept = req.params.dept;
    if (!dept) return res.status(400).json({ error: "Department required" });
    const members = await Employee.find({ department: dept }).select("-__v").lean();
    res.json({ ok: true, members });
  } catch (err) {
    console.error("Error GET /employees/department/:dept:", err);
    res.status(500).json({ error: "Failed to fetch department members", details: err.message });
  }
});



app.post("/leaves", authenticateToken, async (req, res) => {
  try {
    const { type, from, to, reason } = req.body;
    const requesterEmail = req.user.email?.toLowerCase();
    if (!requesterEmail) return res.status(400).json({ error: "Invalid token" });

    // fetch employee record
    const employee = await Employee.findOne({ email: requesterEmail });
    if (!employee) return res.status(404).json({ error: "Employee record not found" });

    // parse dates
    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (isNaN(fromDate) || isNaN(toDate)) return res.status(400).json({ error: "Invalid from/to dates" });

    // compute days (simple)
    const diffMs = Math.abs(toDate - fromDate);
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1;

    const leave = await Leave.create({
      employee: employee._id,
      employeeEmail: employee.email,
      employeeName: employee.name,
      type,
      from: fromDate,
      to: toDate,
      reason,
      days,
      status: "Pending"
    });

    // Determine reporting manager: reportingManager field stored in Employee (could be empId or name)
    let managerIdentifier = (employee.reportingManager || "").toString().trim();
    let managerUser = null;

    if (!managerIdentifier) {
      // fallback: try to find a manager in same department with jobTitle Manager/Team Lead
      managerUser = await (async () => {
        const mgrEmployee = await Employee.findOne({
          department: employee.department,
          jobTitle: { $in: ["Manager", "Team Lead", "Director", "Head of " + employee.department] }
        });
        if (!mgrEmployee) return null;
        return await User.findOne({ email: mgrEmployee.email.toLowerCase() });
      })();
    } else {
      // managerIdentifier might be an empId (EMPxxx) OR name OR email — try multiple lookups
      // 1) by empId
      const findByEmpId = await Employee.findOne({ empId: managerIdentifier });
      if (findByEmpId) {
        managerUser = await User.findOne({ email: findByEmpId.email.toLowerCase() });
      } else {
        // 2) by email
        const maybeUserByEmail = await User.findOne({ email: managerIdentifier.toLowerCase() });
        if (maybeUserByEmail) managerUser = maybeUserByEmail;
        else {
          // 3) by name
          const mgrEmployeeByName = await Employee.findOne({ name: new RegExp("^" + managerIdentifier + "$", "i") });
          if (mgrEmployeeByName) managerUser = await User.findOne({ email: mgrEmployeeByName.email.toLowerCase() });
        }
      }
    }

    // If managerUser found, create Notification with recipient = managerUser._id
    if (managerUser) {
      await Notification.create({
        message: `${employee.name} requested ${type} leave (${from} → ${to}) — ${days} day(s). Reason: ${reason || "—" }`,
        type: "User",
        recipient: managerUser._id,
        relatedUser: employee._id
      });
    } else {
      // fallback: create a system notification (no recipient) so admin can check
      await Notification.create({
        message: `${employee.name} requested ${type} leave (${from} → ${to}). Manager not found automatically.`,
        type: "System",
        recipient: null,
        relatedUser: employee._id
      });
    }

    return res.json({ ok: true, leave, message: "Leave request submitted" });
  } catch (err) {
    console.error("Error POST /leaves:", err);
    res.status(500).json({ error: "Failed to submit leave", details: err.message });
  }
});


function normalizeDept(dept) {
  return dept?.trim().toLowerCase();
}






// helper: verify token for socket handshake
async function verifySocketToken(token) {
  // If you already have token verification logic, reuse it; this is sample using jwt
  try {
    if (!token) throw new Error("No token");
    const payload = jwt.verify(token.split(" ")[1] || token, process.env.JWT_SECRET);
    // payload should contain user id (e.g. { id: '...' })
    const user = await User.findById(payload.id);
    if (!user) throw new Error("User not found");
    return user;
  } catch (err) {
    console.error("Socket auth failed:", err.message || err);
    return null;
  }
}

// use middleware to authenticate socket connection
io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
  const user = await verifySocketToken(token);
  if (!user) return next(new Error("Authentication error"));
  socket.user = user; // attach user to socket
  next();
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id, "user:", socket.user?.email);

  // join a department room
 socket.on("joinDepartment", (department) => {
  if (!socket.user) return socket.emit("errorMessage", "Unauthorized");

  if (normalizeDept(socket.user.department) !== normalizeDept(department)) {
    return socket.emit("errorMessage", "You are not a member of this department");
  }

  const roomName = `dept_${normalizeDept(department)}`;
  socket.join(roomName);
  console.log(`${socket.user.email} joined ${roomName}`);
});

  // handle sendMessage (payload: { department, text })
  socket.on("sendMessage", async ({ department, text }) => {
    try {
      if (!socket.user) return socket.emit("errorMessage", "Unauthorized");
     
      if (!text || !text.trim()) return;

       if (normalizeDept(socket.user.department) !== normalizeDept(department)) {
    return socket.emit("errorMessage", "Cannot send to other department");
  }
      

      // persist message to DB
      const message = await Message.create({
        department,
        sender: socket.user._id,
        text,
      });

      // populate sender with name & email
      const populated = await message.populate("sender", "name email");
       const roomName = `dept_${normalizeDept(department)}`;
      // emit to room
     
      io.to(roomName).emit("receiveMessage", {
        _id: populated._id,
        department: populated.department,
        text: populated.text,
        sender: {
          _id: populated.sender._id,
          name: populated.sender.name,
          email: populated.sender.email,
        },
        createdAt: populated.createdAt,
      });
    } catch (err) {
      console.error("sendMessage error:", err);
      socket.emit("errorMessage", "Failed to send message");
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// finally start server using server.listen instead of app.listen


// Get messages for a department
app.get("/chat/:department", authenticateToken, async (req, res) => {
  try {
    const department = req.params.department;

    // Ensure user belongs to this department
    const user = await User.findById(req.user.id);
    if (!user || user.department !== department)
      return res.status(403).json({ error: "Access denied" });

    const messages = await Message.find({ department })
      .populate("sender", "name email")
      .sort({ createdAt: 1 });

    res.json({ ok: true, messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get messages" });
  }
});

// Send message to department
app.post("/chat/:department", authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;
    const department = req.params.department;

    if (!text || !text.trim())
      return res.status(400).json({ error: "Message cannot be empty" });

    const user = await User.findById(req.user.id);
    if (!user || user.department !== department)
      return res.status(403).json({ error: "Access denied" });

    const message = await Message.create({
      department,
      sender: user._id,
      text,
    });

    const populated = await message.populate("sender", "name email");

    res.json({ ok: true, message: populated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send message" });
  }
});



// PUT /employee/update-personal-info
app.put("/employee/update-personal-info", authenticateToken, async (req, res) => {
  try {
    const email = req.user.email?.toLowerCase();
    const { phone, emergencyContact, bank } = req.body;

    const updated = await Employee.findOneAndUpdate(
      { email },
      { mobile: phone, emergencyContact, bankName: bank },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ error: "Employee record not found" });

    res.json({ ok: true, message: "Personal information updated", employee: updated });
  } catch (err) {
    console.error("Error in PUT /employee/update-personal-info:", err);
    res.status(500).json({ error: "Failed to update info" });
  }
});

// PUT /employee/update-password
app.put("/employee/update-password", authenticateToken, async (req, res) => {
  try {
    const email = req.user.email?.toLowerCase();
    const { currentPassword, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(400).json({ error: "Current password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ ok: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Error in PUT /employee/update-password:", err);
    res.status(500).json({ error: "Failed to update password" });
  }
});







// GET /employees/team → Returns team members reporting to the logged-in manager
app.get("/employees/team", authenticateToken, async (req, res) => {
  try {
    // Step 1️⃣: Get logged-in user's email from JWT
    const email = req.user.email?.toLowerCase();
    if (!email) return res.status(400).json({ error: "Invalid user token" });

    // Step 2️⃣: Find the manager’s record from Employee collection
    const manager = await Employee.findOne({ email });
    if (!manager)
      return res.status(404).json({ error: "Manager record not found" });

    // Step 3️⃣: Find employees whose reportingManager == manager.name
    const team = await Employee.find({
      reportingManager: manager.name,
    }).select("-__v -updatedAt -createdAt");

    res.json({
      ok: true,
      team,
      message: `Team members reporting to ${manager.name}`,
    });
  } catch (err) {
    console.error("Error GET /employees/team:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch team", details: err.message });
  }
});



// Map(userId -> socketId)


// --- Socket Authentication Middleware ---
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("No token provided"));
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = payload; // save decoded user info
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);

  // --- Join Private Room ---
  socket.on("joinPrivate", (user) => {
    const id = user?._id || socket.user?._id;
    const email = user?.email || socket.user?.email || "unknown";
    if (id) {
      activeUsers.set(id.toString(), socket.id);
      console.log(`👤 ${email} joined private room (${id})`);
    } else {
      console.log("⚠️ joinPrivate missing ID:", user);
    }
  });

  // --- Handle Private Message / Task ---
  socket.on("sendPrivateMessage", async ({ to, message, sender, asTask }) => {
    console.log("📨 Private message received:", { to, sender, message, asTask });

    try {
      const recipientSocket = activeUsers.get(to);

      // Always send plain chat
      if (recipientSocket) {
        io.to(recipientSocket).emit("receivePrivateMessage", {
          message,
          from: sender,
          asTask: false,
        });
      }

      // Create task if marked
      if (asTask) {
        if (!to || !sender) return console.error("❌ Missing sender or recipient ID");

        const task = await Task.create({
          name: message.substring(0, 50),
          description: message,
          priority: "Medium",
          status: "Open",
          assignedBy: sender,
          assignedTo: to,
        });

        console.log(`✅ Task created in MongoDB: ${task._id}`);

        if (recipientSocket) {
          io.to(recipientSocket).emit("receivePrivateMessage", {
            task,
            from: sender,
            asTask: true,
          });
          console.log("📤 Task emitted to employee:", to);
        }

        // Optional: create notification
        await Notification.create({
          userId: to,
          type: "Task Assigned",
          message: `New task from your manager: "${task.name}"`,
          createdAt: new Date(),
        });
      }
    } catch (err) {
      console.error("❌ Error in sendPrivateMessage:", err.message);
    }
  });

  socket.on("disconnect", () => {
    for (let [userId, sockId] of activeUsers.entries()) {
      if (sockId === socket.id) activeUsers.delete(userId);
    }
    console.log("🔴 Client disconnected:", socket.id);
  });
});



// Save performance review
app.post("/api/performance/review", async (req, res) => {
  try {
    const { managerId, employeeId, rating, note } = req.body;
    const review = new PerformanceReview({
      managerId,
      employeeId,
      rating,
      note,
      date: new Date(),
    });
    await review.save();
    res.json({ message: "Review saved successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error saving review" });
  }
});


io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join", (employeeEmpId) => {
    activeUsers.set(employeeEmpId, socket.id);
    console.log(`${employeeEmpId} joined room`);
  });

  socket.on("disconnect", () => {
    activeUsers.forEach((value, key) => {
      if (value === socket.id) activeUsers.delete(key);
    });
    console.log("Socket disconnected:", socket.id);
  });
});



// ------------------- PERFORMANCE REVIEW ROUTES ------------------- //

// Get team members for a manager
app.get("/api/employees/team/:managerEmpId", async (req, res) => {
  try {
    const { managerEmpId } = req.params;
    const team = await Employee.find({ reportingManager: managerEmpId });
    res.json({ employees: team });
  } catch (err) {
    console.error("Error fetching team:", err);
    res.status(500).json({ message: "Server error fetching team" });
  }
});

// Manager submits a review
app.post("/api/performance/review", async (req, res) => {
  try {
    const { employeeEmpId, managerEmpId, rating, note } = req.body;

    const review = new PerformanceReview({
      employeeEmpId,
      managerEmpId,
      rating,
      note,
    });
    await review.save();

    // Emit to employee if online
    const recipientSocket = activeUsers.get(employeeEmpId);
    if (recipientSocket) {
      io.to(recipientSocket).emit("newReview", review);
    }

    res.json({ message: "Review saved successfully!", review });
  } catch (err) {
    console.error("Error saving review:", err);
    res.status(500).json({ message: "Server error saving review" });
  }
});

// Employee fetches their reviews
app.get("/api/performance/employee/:employeeEmpId", async (req, res) => {
  try {
    const { employeeEmpId } = req.params;
    const reviews = await PerformanceReview.find({ employeeEmpId }).sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (err) {
    console.error("Error fetching employee reviews:", err);
    res.status(500).json({ message: "Server error fetching reviews" });
  }
});

//Leave Management//

// ------------------- SOCKET.IO ------------------- //
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("registerUser", (empId) => {
    activeUsers.set(empId.toString(), socket.id);
    console.log(`Registered ${empId} -> ${socket.id}`);
  });

  socket.on("disconnect", () => {
    for (const [empId, sockId] of activeUsers.entries()) {
      if (sockId === socket.id) {
        activeUsers.delete(empId);
        break;
      }
    }
    console.log("User disconnected:", socket.id);
  });
});

// ------------------- EMPLOYEE SUBMITS LEAVE ------------------- //
app.post("/api/leaves/request", async (req, res) => {
  try {
    const { employeeEmpId, employeeName, managerEmpId, type, from, to, reason } = req.body;

    if (!employeeEmpId || !employeeName || !type || !from || !to || !managerEmpId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const leave = new Leave({
      employeeEmpId,
      employeeName,
      managerEmpId,
      type,
      from,
      to,
      reason,
      status: "pending",
    });

    await leave.save();

    // Emit to manager if online
    const managerSocket = activeUsers.get(managerEmpId.toString());
    if (managerSocket) {
      io.to(managerSocket).emit("newLeaveRequest", leave);
    }

    res.json({ message: "Leave request submitted", leave });
  } catch (err) {
    console.error("Error in /api/leaves/request:", err);
    res.status(500).json({ message: "Failed to submit leave request", error: err.message });
  }
});

// ------------------- FETCH PENDING LEAVES FOR MANAGER ------------------- //
app.get("/api/leaves/pending/:managerEmpId", async (req, res) => {
  try {
    const { managerEmpId } = req.params;
    const leaves = await Leave.find({ managerEmpId, status: "pending" });
    res.json({ requests: leaves });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch pending leaves" });
  }
});

// ------------------- MANAGER APPROVES / REJECTS ------------------- //
app.post("/api/leaves/update", async (req, res) => {
  try {
    const { id, status } = req.body;
    const leave = await Leave.findByIdAndUpdate(id, { status }, { new: true });

    // Notify employee in real-time
    const employeeSocket = activeUsers.get(leave.employeeEmpId.toString());
    if (employeeSocket) {
      io.to(employeeSocket).emit("leaveStatusUpdate", leave);
    }

    res.json({ message: "Leave updated", leave });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update leave" });
  }
});

// ------------------- EMPLOYEE LEAVE HISTORY ------------------- //
app.get("/api/leaves/history/:employeeEmpId", async (req, res) => {
  try {
    const { employeeEmpId } = req.params;
    const leaves = await Leave.find({ employeeEmpId });
    res.json({ leaves });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch history" });
  }
});







app.post("/api/facial/match", async (req, res) => {
  try {
    const { descriptor } = req.body;
    if (!descriptor) return res.status(400).json({ error: "Missing face descriptor" });

    const knownFaces = await FacialData.find({});
    if (!knownFaces.length) return res.status(404).json({ error: "No registered faces found" });

    let bestMatch = null;
    let smallestDistance = Infinity;

    for (const face of knownFaces) {
      const dist = faceapi.euclideanDistance(face.embedding, descriptor);
      if (dist < smallestDistance) {
        smallestDistance = dist;
        bestMatch = face;
      }
    }

    if (smallestDistance > 0.45) {
      return res.status(404).json({ error: "No match found" });
    }

    const empId = bestMatch.empId;
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0]; // ✅ YYYY-MM-DD

    let attendance = await Attendance.findOne({ empId, date: formattedDate });

    if (!attendance) {
      attendance = new Attendance({
        empId,
        date: formattedDate,
        inTime: today,
        outTime: null,
      });
    } else {
      attendance.outTime = today; // ✅ update outTime if already exists
    }

    await attendance.save();

    res.json({
      match: {
        empId: bestMatch.empId,
        name: bestMatch.name,
        department: bestMatch.department,
      },
      message: "Attendance marked successfully",
    });
  } catch (err) {
    console.error("Face match error:", err);
    res.status(500).json({ error: err.message });
  }
});





// ------------------- AI SHORTLISTING ------------------- //

// Calculate weighted shortlisting
async function calculateScore(job, candidate) {
  let scoreApp = 0;
  let scoreResume = 0;
  let summaryArr = [];

  // 1️⃣ Job post fields vs candidate fields (50%)
  const preferredSkills = (job.preferredQualifications || "")
    .split(/[,•\n]/)
    .map((s) => s.trim().toLowerCase());
  const candidateSkills = (candidate.skills || "")
    .split(/[,•\n]/)
    .map((s) => s.trim().toLowerCase());
  const matchedSkills = preferredSkills.filter((p) =>
    candidateSkills.includes(p)
  );
  if (matchedSkills.length) {
    scoreApp += matchedSkills.length * 10;
    summaryArr.push(`Matched Preferred Skills: ${matchedSkills.join(", ")}`);
  }

  const requiredQuals = (job.qualifications || "")
    .split(/[,•\n]/)
    .map((s) => s.trim().toLowerCase());
  const candidateExp = candidate.experience
    ? candidate.experience.toLowerCase()
    : "";
  const matchedExp = requiredQuals.filter((req) => candidateExp.includes(req));
  if (matchedExp.length) {
    scoreApp += matchedExp.length * 20;
    summaryArr.push(
      `Matched Required Qualifications: ${matchedExp.join(", ")}`
    );
  }

  scoreApp = Math.min(scoreApp, 50); // max 50 points

  // 2️⃣ Resume text vs job description (50%)
  if (
    candidate.resumePath &&
    fs.existsSync(
      path.join(__dirname, candidate.resumePath.replace("/uploads/", ""))
    )
  ) {
    const resumeFullPath = path.join(
      __dirname,
      candidate.resumePath.replace("/uploads/", "")
    );
    let resumeText = fs.readFileSync(resumeFullPath, "utf8").toLowerCase();
    const jobKeywords = [
      job.title,
      job.responsibilities,
      job.qualifications,
      job.preferredQualifications,
    ]
      .join(" ")
      .toLowerCase()
      .split(/[,•\n]/)
      .filter(Boolean);
    const matchedKeywords = jobKeywords.filter((k) => resumeText.includes(k));
    if (matchedKeywords.length) {
      scoreResume += Math.min(matchedKeywords.length * 2, 50);
      summaryArr.push(
        `Resume matched keywords: ${matchedKeywords.slice(0, 10).join(", ")}`
      );
    }
  }

  const totalScore = Math.min(scoreApp + scoreResume, 100);

  return { score: totalScore, summary: summaryArr.join(" | ") };
}

// POST /shortlist/:jobId
app.post("/shortlist/:jobId", async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ error: "Job not found" });

    const apps = await Application.find({ jobId });
    if (!apps.length) return res.json({ ok: true, results: [] });

    const results = [];
    for (const appEntry of apps) {
      try {
        const { score, summary } = await calculateScore(job, appEntry);
        appEntry.shortlisting = { score, summary, modelRunAt: new Date() };
        await appEntry.save();
        results.push({ applicationId: appEntry._id, score, summary });
      } catch (err) {
        console.error(err);
        results.push({ applicationId: appEntry._id, error: err.message });
      }
    }

    res.json({ ok: true, results });
  } catch (error) {
    console.error("Error in POST /shortlist:", error);
    res
      .status(500)
      .json({ error: "Failed to shortlist", message: error.message });
  }
});

// ------------------- SECURE SHORTLISTED RESUME DOWNLOAD ------------------- //
app.get(
  "/download/resume/:applicationId",
  authenticateToken,
  async (req, res) => {
    try {
      const appEntry = await Application.findById(req.params.applicationId);
      if (!appEntry || !appEntry.resumePath)
        return res.status(404).json({ error: "Resume not found" });

      // Correct full path: join __dirname with stored path
      const resumeFullPath = path.join(__dirname, appEntry.resumePath);

      if (!fs.existsSync(resumeFullPath))
        return res.status(404).json({ error: "Resume file missing" });

      res.download(resumeFullPath);
    } catch (error) {
      console.error("Error downloading resume:", error);
      res
        .status(500)
        .json({ error: "Failed to download resume", message: error.message });
    }
  }
);


const PORTS = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORTS}`);
});




// ------------------- START SERVER ------------------- //
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);


