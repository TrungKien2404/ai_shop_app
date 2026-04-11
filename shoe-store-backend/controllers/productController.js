const Product = require("../models/Product");
const { Op } = require("sequelize");

const transformProduct = (p) => {
  const json = p.toJSON ? p.toJSON() : p;
  return {
    ...json,
    _id: json.id,
    size: typeof json.size === "string" ? JSON.parse(json.size) : json.size,
  };
};

exports.getProducts = async (req, res) => {
  try {
    const { keyword, category } = req.query;
    let where = {};
    if (keyword) where.name = { [Op.like]: `%${keyword}%` };
    if (category) where.category = category;

    const products = await Product.findAll({ where });
    res.json(products.map(transformProduct));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (product) res.json(transformProduct(product));
    else res.status(404).json({ message: "Product not found" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const data = { ...req.body };
    if (Array.isArray(data.size)) data.size = JSON.stringify(data.size);
    
    const product = await Product.create(data);
    res.status(201).json(transformProduct(product));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const data = { ...req.body };
    if (Array.isArray(data.size)) data.size = JSON.stringify(data.size);

    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    await product.update(data);
    res.json(transformProduct(product));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (product) {
      await product.destroy();
      res.json({ message: "Deleted successfully" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
