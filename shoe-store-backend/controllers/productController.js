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

/**
 * Chỉ giữ lại các field hợp lệ của Product model,
 * tránh Sequelize ném ValidationError do field lạ (_id, v.v.)
 */
function sanitizeProductData(raw) {
  const data = {};

  if (raw.name      !== undefined) data.name         = String(raw.name).trim();
  if (raw.price     !== undefined) data.price         = Number(raw.price);
  if (raw.brand     !== undefined) data.brand         = raw.brand || '';
  if (raw.category  !== undefined) data.category      = raw.category || '';
  if (raw.tag       !== undefined) data.tag           = raw.tag || '';
  if (raw.stock     !== undefined) data.stock         = Number(raw.stock) || 0;
  if (raw.description !== undefined) data.description = raw.description || '';
  if (raw.image     !== undefined) data.image         = raw.image || '';
  if (raw.originalPrice !== undefined) data.originalPrice = Number(raw.originalPrice) || 0;

  // Xử lý size: chuyển array -> JSON string
  if (raw.size !== undefined) {
    data.size = Array.isArray(raw.size)
      ? JSON.stringify(raw.size)
      : (raw.size || '[]');
  }

  return data;
}

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
    const raw = req.body;

    // Validate bắt buộc
    if (!raw.name || String(raw.name).trim() === '') {
      return res.status(400).json({ message: 'Tên sản phẩm không được để trống.' });
    }
    if (!raw.price || isNaN(Number(raw.price)) || Number(raw.price) <= 0) {
      return res.status(400).json({ message: 'Giá bán phải là số lớn hơn 0.' });
    }

    const data = sanitizeProductData(raw);
    const product = await Product.create(data);
    res.status(201).json(transformProduct(product));
  } catch (err) {
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      const details = err.errors ? err.errors.map(e => e.message).join(', ') : err.message;
      return res.status(400).json({ message: `Lỗi dữ liệu: ${details}` });
    }
    console.error('createProduct error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.bulkCreateProducts = async (req, res) => {
  try {
    const { products } = req.body;
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Vui lòng cung cấp danh sách sản phẩm." });
    }

    // Validate từng dòng
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      if (!p.name || String(p.name).trim() === '') {
        return res.status(400).json({ message: `Dòng ${i + 1}: Tên sản phẩm không được để trống.` });
      }
      if (!p.price || isNaN(Number(p.price)) || Number(p.price) <= 0) {
        return res.status(400).json({ message: `Dòng ${i + 1}: Giá bán phải là số lớn hơn 0.` });
      }
    }

    const dataList = products.map(p => sanitizeProductData(p));

    const created = await Product.bulkCreate(dataList, { returning: true });
    res.status(201).json({
      success: true,
      message: `Đã thêm thành công ${created.length} sản phẩm.`,
      products: created.map(transformProduct)
    });
  } catch (err) {
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      const details = err.errors ? err.errors.map(e => e.message).join(', ') : err.message;
      return res.status(400).json({ message: `Lỗi dữ liệu: ${details}` });
    }
    console.error('bulkCreateProducts error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const data = sanitizeProductData(req.body);

    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    await product.update(data);
    res.json(transformProduct(product));
  } catch (err) {
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      const details = err.errors ? err.errors.map(e => e.message).join(', ') : err.message;
      return res.status(400).json({ message: `Lỗi dữ liệu: ${details}` });
    }
    console.error('updateProduct error:', err);
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
