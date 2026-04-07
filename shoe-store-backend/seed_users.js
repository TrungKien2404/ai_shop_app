const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config({ path: path.join(__dirname, ".env") });

const DEFAULT_MONGO_URI = "mongodb://127.0.0.1:27017/shoe_shop";
const mongoUri = process.env.MONGO_URI || DEFAULT_MONGO_URI;
const seedFilePath = path.join(__dirname, "seed-users.json");

function normalizeUser(rawUser = {}) {
  return {
    name: String(rawUser.name || "User").trim(),
    email: String(rawUser.email || "").trim().toLowerCase(),
    password: String(rawUser.password || "").trim(),
    isAdmin: Boolean(rawUser.isAdmin),
  };
}

function readSeedUsers() {
  if (!fs.existsSync(seedFilePath)) {
    throw new Error(`Khong tim thay file seed: ${seedFilePath}`);
  }

  const rawContent = fs.readFileSync(seedFilePath, "utf8");
  const parsed = JSON.parse(rawContent);

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("seed-users.json phai la mang va co it nhat 1 user");
  }

  const users = parsed.map(normalizeUser);

  const invalidUser = users.find((user) => !user.email || !user.password);
  if (invalidUser) {
    throw new Error("Moi user trong seed-users.json phai co email va password");
  }

  return users;
}

async function upsertUser(userData) {
  let user = await User.findOne({ email: userData.email });

  if (user) {
    user.name = userData.name;
    user.password = userData.password;
    user.isAdmin = userData.isAdmin;
    await user.save();
    return { type: "updated", user };
  }

  user = await User.create(userData);
  return { type: "created", user };
}

async function seedUsers() {
  const seedUsersList = readSeedUsers();

  console.log(`Dang ket noi MongoDB: ${mongoUri}`);
  await mongoose.connect(mongoUri);
  console.log("MongoDB connected");

  let createdCount = 0;
  let updatedCount = 0;

  for (const userData of seedUsersList) {
    const result = await upsertUser(userData);

    if (result.type === "created") createdCount += 1;
    if (result.type === "updated") updatedCount += 1;

    console.log(
      `[${result.type.toUpperCase()}] ${result.user.email} | isAdmin=${result.user.isAdmin}`
    );
  }

  console.log("");
  console.log("Seed user/admin thanh cong");
  console.log(`Created: ${createdCount}`);
  console.log(`Updated: ${updatedCount}`);
  console.log(`Tong user xu ly: ${seedUsersList.length}`);
  console.log("");
  console.log("Tai khoan hien tai trong file seed-users.json:");
  seedUsersList.forEach((user, index) => {
    console.log(
      `${index + 1}. ${user.email} | password: ${user.password} | isAdmin: ${user.isAdmin}`
    );
  });
}

seedUsers()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Seed that bai:", error.message);
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      // Ignore disconnect errors on failure path.
    }
    process.exit(1);
  });
