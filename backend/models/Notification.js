const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["User", "System", "Approval", "Rejection"],
      default: "System",
    },
    isRead: { type: Boolean, default: false },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    relatedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
