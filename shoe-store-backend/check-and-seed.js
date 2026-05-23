const fs = require("fs");
const { connectDB } = require("./config/db");
const Product = require("./models/Product");
const User = require("./models/User");

const TEST_USERS = fs.existsSync("./seed-users.json")
  ? JSON.parse(fs.readFileSync("./seed-users.json", "utf-8"))
  : [];

const normalizeEmail = (email = "") => email.trim().toLowerCase();

async function ensureUsers(users, label) {
  for (const rawUser of users) {
    const payload = {
      name: rawUser.name,
      email: normalizeEmail(rawUser.email),
      password: rawUser.password,
      isAdmin: Boolean(rawUser.isAdmin),
      role: rawUser.role || (rawUser.isAdmin ? "admin" : "user"),
      assignedBrand: rawUser.assignedBrand || null,
    };

    const existingUser = await User.findOne({ where: { email: payload.email } });

    if (!existingUser) {
      await User.create(payload);
      console.log(`Created ${label} account: ${payload.email}`);
      continue;
    }

    let changed = false;

    for (const field of ["name", "isAdmin", "role", "assignedBrand"]) {
      if (existingUser[field] !== payload[field]) {
        existingUser[field] = payload[field];
        changed = true;
      }
    }

    const passwordMatches = await existingUser.matchPassword(payload.password);
    if (!passwordMatches) {
      existingUser.password = payload.password;
      changed = true;
    }

    if (changed) {
      await existingUser.save();
      console.log(`Updated ${label} account: ${payload.email}`);
    }
  }
}

async function seedProductsIfNeeded() {
  const productCount = await Product.count();

  if (productCount > 0) {
    console.log(`Database already has ${productCount} products. Skipping product import.`);
    return;
  }

  if (!fs.existsSync("./seed_data.json")) {
    console.log("seed_data.json not found. Skipping product seeding.");
    return;
  }

  const productData = JSON.parse(fs.readFileSync("./seed_data.json", "utf-8"));
  const formattedProducts = productData.map((product) => ({
    ...product,
    size: Array.isArray(product.size) ? JSON.stringify(product.size) : "[]",
  }));

  await Product.bulkCreate(formattedProducts);
  console.log(`Seeded ${formattedProducts.length} products successfully.`);
}

async function checkAndSeed() {
  await connectDB();

  try {
    if (process.env.DB_URL && process.env.AUTO_SEED !== "true") {
      console.log(
        "Database is configured using DB_URL (Cloud Database). Skipping automatic seeding to prevent overwriting cloud data."
      );
      console.log("To force seeding on cloud database, set environment variable AUTO_SEED=true.");
      process.exit(0);
    }

    await seedProductsIfNeeded();

    if (TEST_USERS.length) {
      await ensureUsers(TEST_USERS, "test");
    } else {
      console.log("seed-users.json not found. Skipping test user seeding.");
    }

    console.log("Database seeding checks completed.");
    process.exit(0);
  } catch (error) {
    console.error("Error checking/seeding database:", error);
    process.exit(1);
  }
}

checkAndSeed();
