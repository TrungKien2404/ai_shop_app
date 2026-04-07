const Product = require("../models/Product");

exports.getProducts = async (req, res) => {
  const { keyword, category } = req.query;
  let query = {};
  if (keyword) query.name = { $regex: keyword, $options: "i" };
  if (category) query.category = category;

  const products = await Product.find(query);
  res.json(products);
};

exports.getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) res.json(product);
  else res.status(404).json({ message: "Product not found" });
};

exports.createProduct = async (req, res) => {
  const product = new Product(req.body);
  const created = await product.save();
  res.status(201).json(created);
};

exports.updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (product) res.json(product);
  else res.status(404).json({ message: "Product not found" });
};

exports.deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (product) res.json({ message: "Deleted successfully" });
  else res.status(404).json({ message: "Product not found" });
};
