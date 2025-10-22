// sockets/chatSockets.js

const jwt = require("jsonwebtoken");
const Message = require("../models/Message");
const Task = require("../models/Task");
const Leave = require("../models/Leave");
const PerformanceReview = require("../models/PerformanceReview");
const Notification = require("../models/Notification");
const User = require("../models/User");
const Employee = require("../models/Employee");
const DepartmentMessage = require("../models/DepartmentMessage");

function normalizeDept(dept) {
  return dept?.trim().toLowerCase();
}

// Handle multiple sockets per user
const activeUsers = new Map(); // userId or empId -> Set of socketIds

function addActiveUser(id, socketId) {
  if (!activeUsers.has(id)) activeUsers.set(id, new Set());
  activeUsers.get(id).add(socketId);
}

function removeActiveUser(socketId) {
  for (const [id, sockets] of activeUsers.entries()) {
    if (sockets.has(socketId)) {
      sockets.delete(socketId);
      if (sockets.size === 0) activeUsers.delete(id);
      break;
    }
  }
}

module.exports = function setupChatSockets(io) {
  // ---------------- Authentication Middleware ----------------
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token || socket.handshake.headers?.authorization;
      if (!token) return next(new Error("No token provided"));

      const decoded = jwt.verify(token.split(" ")[1] || token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error("User not found"));

      socket.user = user;
      next();
    } catch (err) {
      console.error("Socket auth error:", err.message);
      next(new Error("Authentication failed"));
    }
  });

   // ---------------- On Connection ----------------
  io.on("connection", (socket) => {
    console.log("🟢 Connected:", socket.id, socket.user?.email);

    const userId = socket.user._id.toString();
    addActiveUser(userId, socket.id);

    // Join department room
    const deptRoom = `dept_${normalizeDept(socket.user.department)}`;
    socket.join(deptRoom);
    console.log(`${socket.user.email} joined ${deptRoom}`);

    // Listen for department messages
    socket.on("departmentMessage", async ({ text }) => {
      try {
        if (!text || text.trim() === "")
          return socket.emit("messageSent", { success: false, error: "Message cannot be empty" });

        const msg = await DepartmentMessage.create({
          department: normalizeDept(socket.user.department),
          sender: socket.user._id,
          text: text.trim(),
        });

        const populatedMsg = await msg.populate("sender", "name email");

        // Broadcast to department room
        io.to(deptRoom).emit("departmentMessage", {
          _id: populatedMsg._id,
          department: populatedMsg.department,
          text: populatedMsg.text,
          sender: {
            _id: populatedMsg.sender._id,
            name: populatedMsg.sender.name,
            email: populatedMsg.sender.email,
          },
          createdAt: populatedMsg.createdAt,
        });

        socket.emit("messageSent", { success: true });
        console.log(`💬 Dept message sent by ${populatedMsg.sender.email}`);
      } catch (err) {
        console.error("Department chat error:", err.message);
        socket.emit("messageSent", { success: false, error: err.message });
      }
    });

    // ---------------- Private / Task Chat ----------------
    socket.on("sendPrivateMessage", async ({ to, message, asTask }) => {
      try {
        const sender = socket.user._id.toString();
        const recipientSockets = activeUsers.get(to);

        // Emit message to recipient sockets
        if (recipientSockets) {
          for (const sockId of recipientSockets) {
            io.to(sockId).emit("receivePrivateMessage", {
              message,
              from: sender,
              asTask: false,
            });
          }
        }

        if (asTask) {
          const task = await Task.create({
            name: message.substring(0, 50),
            description: message,
            priority: "Medium",
            status: "Open",
            assignedBy: sender,
            assignedTo: to,
          });

          if (recipientSockets) {
            for (const sockId of recipientSockets) {
              io.to(sockId).emit("receivePrivateMessage", {
                task,
                from: sender,
                asTask: true,
              });
            }
          }

          await Notification.create({
            userId: to,
            type: "Task Assigned",
            message: `New task assigned: "${task.name}"`,
          });
        }
      } catch (err) {
        console.error("Private message error:", err.message);
      }
    });

    // ---------------- Performance Review ----------------
    socket.on(
      "submitReview",
      async ({ employeeEmpId, rating, note }) => {
        try {
          const managerEmpId = socket.user.empId; // current user
          const review = await PerformanceReview.create({
            employeeEmpId,
            managerEmpId,
            rating,
            note,
          });

          const employeeSockets = activeUsers.get(employeeEmpId.toString());
          if (employeeSockets) {
            for (const sockId of employeeSockets)
              io.to(sockId).emit("newReview", review);
          }

          console.log("✅ Review saved and emitted");
        } catch (err) {
          console.error("Error saving review:", err);
        }
      }
    );

    // ---------------- Leave Requests ----------------
    socket.on("leaveRequest", async (data) => {
      try {
        const leave = await Leave.create({
          employeeEmpId: socket.user.empId,
          employeeName: socket.user.name,
          managerEmpId: data.managerEmpId,
          type: data.type,
          from: data.from,
          to: data.to,
          reason: data.reason,
          status: "pending",
        });

        const managerSockets = activeUsers.get(data.managerEmpId.toString());
        if (managerSockets) {
          for (const sockId of managerSockets)
            io.to(sockId).emit("newLeaveRequest", leave);
        }

        console.log("📤 Leave request emitted to manager:", data.managerEmpId);
      } catch (err) {
        console.error("Error processing leave request:", err.message);
      }
    });

    // ---------------- Leave Status Update ----------------
    socket.on("updateLeaveStatus", async ({ leaveId, status }) => {
      try {
        const leave = await Leave.findByIdAndUpdate(
          leaveId,
          { status },
          { new: true }
        );

        const employeeSockets = activeUsers.get(leave.employeeEmpId.toString());
        if (employeeSockets) {
          for (const sockId of employeeSockets)
            io.to(sockId).emit("leaveStatusUpdate", leave);
        }
      } catch (err) {
        console.error("Error updating leave:", err.message);
      }
    });

    // ---------------- Disconnect ----------------
    socket.on("disconnect", () => {
      removeActiveUser(socket.id);
      console.log("🔴 Disconnected:", socket.id);
    });
  });
};
