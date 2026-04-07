const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config({ path: path.join(__dirname, ".env") });

const DEFAULT_MONGO_URI = "mongodb://127.0.0.1:27017/shoe_shop";
const mongoUri = process.env.MONGO_URI || DEFAULT_MONGO_URI;
const backupFilePath = path.join(__dirname, "users-backup.json");

function readBackupUsers() {
  if (!fs.existsSync(backupFilePath)) {
    throw new Error(`Khong tim thay file backup: ${backupFilePath}`);
  }

  const content = fs.readFileSync(backupFilePath, "utf8");
  const parsed = JSON.parse(content);

  if (!Array.isArray(parsed)) {
    throw new Error("users-backup.json phai la mot mang");
  }

  const users = parsed.map((user) => ({
    name: String(user.name || "User").trim(),
    email: String(user.email || "").trim().toLowerCase(),
    passwordHash: String(user.passwordHash || "").trim(),
    isAdmin: Boolean(user.isAdmin),
  }));

  const invalid = users.find((user) => !user.email || !user.passwordHash);
  if (invalid) {
    throw new Error("Moi user trong users-backup.json phai co email va passwordHash");
  }

  return users;
}

async function restoreUsers() {
  const users = readBackupUsers();

  console.log(`Dang ket noi MongoDB: ${mongoUri}`);
  await mongoose.connect(mongoUri);
  console.log("MongoDB connected");

  let restoredCount = 0;

  for (const user of users) {
    await User.updateOne(
      { email: user.email },
      {
        $set: {
          name: user.name,
          email: user.email,
          password: user.passwordHash,
          isAdmin: user.isAdmin,
        },
      },
      { upsert: true }
    );

    restoredCount += 1;
    console.log(`[RESTORED] ${user.email} | isAdmin=${user.isAdmin}`);
  }

  console.log("");
  console.log(`Restore thanh cong ${restoredCount} user tu users-backup.json`);
}

restoreUsers()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Restore that bai:", error.message);
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      // Ignore disconnect errors on failure path.
    }
    process.exit(1);
  });
