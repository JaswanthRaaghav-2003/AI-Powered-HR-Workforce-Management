// setDefaultPassword.js

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User"); // adjust the path to your User model

const MONGO_URI = process.env.MONGODB_URI ;

async function updateEmployees() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB...");

    const defaultPassword = "Welcome@123";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    // Update all users with status 'Pending' or 'Rejected' (bulk-uploaded employees)
      const result = await User.updateMany(
    { role: { $in: ["Employee", "HR Manager", "Senior Technical Manager"] } }, // adjust if needed
    { password: hashedPassword, status: "Approved" }
  );


    console.log(
      `Updated ${result.modifiedCount} users. Password set to '${defaultPassword}' and status set to 'Approved'.`
    );

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  } catch (err) {
    console.error("Error updating employees:", err);
    process.exit(1);
  }
}

updateEmployees();
