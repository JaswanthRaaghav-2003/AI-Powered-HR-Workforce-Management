const DepartmentMessage = require("../models/DepartmentMessage");
const Employee = require("../models/Employee");
const jwt = require("jsonwebtoken");

// One user's socket connection
async function initDepartmentMessaging({ io, socket, token }) {
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Employee.findOne({ email: decoded.email });
    if (!user) {
      socket.emit("errorMessage", "Unauthorized: user not found");
      socket.disconnect();
      return;
    }

    // Join department-specific room
    const deptRoom = `department_${user.department}`;
    socket.join(deptRoom);
    console.log(`✅ ${user.name} joined room: ${deptRoom}`);

    // Notify everyone that a new user joined
    io.to(deptRoom).emit("systemMessage", {
      text: `${user.name} joined the chat`,
      time: new Date(),
    });

    // Handle new message
    socket.on("sendMessage", async ({ text }) => {
      try {
        if (!text?.trim()) {
          socket.emit("errorMessage", "Message cannot be empty");
          return;
        }

        const newMsg = await DepartmentMessage.create({
          department: user.department,
          sender: user._id,
          text,
        });

        const populatedMsg = await newMsg.populate("sender", "name email");

        // Broadcast to everyone in the same department
        io.to(deptRoom).emit("receiveMessage", populatedMsg);
      } catch (err) {
        console.error("Send message error:", err);
        socket.emit("errorMessage", "Failed to send message");
      }
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log(`❌ ${user.name} disconnected from ${deptRoom}`);
      io.to(deptRoom).emit("systemMessage", {
        text: `${user.name} left the chat`,
        time: new Date(),
      });
    });

  } catch (err) {
    console.error("Socket auth error:", err);
    socket.emit("errorMessage", "Authentication failed");
    socket.disconnect();
  }
}

// Initialize socket.io globally
function initSocketIO(io) {
  io.on("connection", (socket) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      socket.emit("errorMessage", "Authentication token missing");
      socket.disconnect();
      return;
    }

    initDepartmentMessaging({ io, socket, token });
  });
}

module.exports = { initSocketIO };
