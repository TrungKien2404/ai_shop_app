const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const User = require("./models/User");
const config = require("./config/env");

const backupFilePath = path.join(__dirname, "users-backup.json");

async function backupUsers() {
  console.log(`Dang ket noi MongoDB: ${config.mongoUri}`);
  await mongoose.connect(config.mongoUri);
  console.log("MongoDB connected");

  const users = await User.find({}, { name: 1, email: 1, password: 1, isAdmin: 1 })
    .sort({ email: 1 })
    .lean();

  const backupData = users.map((user) => ({
    name: user.name,
    email: String(user.email || "").toLowerCase(),
    passwordHash: user.password,
    isAdmin: Boolean(user.isAdmin),
  }));

  fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2), "utf8");

  console.log(`Backup thanh cong: ${backupFilePath}`);
  console.log(`Tong user da backup: ${backupData.length}`);
}

backupUsers()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Backup that bai:", error.message);
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      // Ignore disconnect errors on failure path.
    }
    process.exit(1);
  });
