// src/socket.js
import { io } from "socket.io-client";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Send JWT in auth when connecting
export const socket = io(API_BASE, {
  auth: {
    token: localStorage.getItem("token"),
  },
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("✅ Connected to Socket.IO server:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("🔴 Disconnected from Socket.IO server:", reason);
});

socket.on("connect_error", (err) => {
  console.error("❌ Socket connection error:", err.message);
});
