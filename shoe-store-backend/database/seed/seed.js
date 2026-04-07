const connectDB = require("../config/db");
const Product = require("../models/Product");
const User = require("../models/User");

const products = require("./products.json");
const users = require("./users.json");

const seedData = async () => {
  await connectDB();

  await Product.deleteMany();
  await User.deleteMany();

  await Product.insertMany(products);
  for (const user of users) {
    await User.create(user);
  }

  console.log("✅ Seed data thành công");
  process.exit();
};

seedData();
