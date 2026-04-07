const connectDB = require("../config/db");
const Product = require("../models/Product");

const run = async () => {
  await connectDB();

  const data = await Product.find();
  console.log("📦 Products:", data);

  process.exit();
};

run();
