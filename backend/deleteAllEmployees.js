require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

(async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("Missing MONGO_URI in .env file.");

    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB...");

    // Delete all users except the Admin
    const result = await User.deleteMany({
      email: { $ne: "admin@hrms.com" }, // keep admin
    });

    console.log(`🧹 Deleted ${result.deletedCount} non-admin users.`);
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB.");
  } catch (err) {
    console.error("❌ Error deleting users:", err);
  }
})();
