const Product = require("../models/Product");
const { Op } = require("sequelize");

const transformProduct = (p) => {
  const json = p.toJSON ? p.toJSON() : p;
  
  let parsedSize = [];
  if (json.size) {
    if (typeof json.size === "string") {
      try {
        parsedSize = JSON.parse(json.size);
      } catch (e) {
        // Fallback cho dữ liệu cũ (ví dụ: "38, 39, 40")
        parsedSize = json.size.split(',').map(s => s.trim()).filter(Boolean);
      }
    } else {
      parsedSize = json.size;
    }
  }

  return {
    ...json,
    _id: json.id,
    size: Array.isArray(parsedSize) ? parsedSize : [],
    originalPrice: json.originalPrice || 0,
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

exports.bulkCreateProducts = async (req, res) => {
  try {
    const { products } = req.body;
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Vui lòng cung cấp danh sách sản phẩm." });
    }

    const dataList = products.map(p => {
      const d = { ...p };
      if (Array.isArray(d.size)) d.size = JSON.stringify(d.size);
      return d;
    });

    const created = await Product.bulkCreate(dataList, { returning: true });
    res.status(201).json({
      success: true,
      message: `Đã thêm thành công ${created.length} sản phẩm.`,
      products: created.map(transformProduct)
    });
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
