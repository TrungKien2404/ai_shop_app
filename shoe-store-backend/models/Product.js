const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  brand: String,
  category: String,
  size: [Number],
  stock: { type: Number, default: 0 },
  description: String,
  image: String,
});

module.exports = mongoose.model("Product", productSchema);
