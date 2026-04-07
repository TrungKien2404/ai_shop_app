const Order = require("../models/Order");

const EXPRESS_FEE = 15000;

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function normalizeOrderItems(orderItems = []) {
  if (!Array.isArray(orderItems)) return [];

  return orderItems
    .filter((item) => item && item.name)
    .map((item) => ({
      name: String(item.name).trim(),
      image: item.image || "",
      price: Math.max(0, Number(item.price) || 0),
      quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
      size: item.size || "",
    }));
}

exports.createOrder = async (req, res) => {
  try {
    const {
      user,
      orderCode,
      buyerName,
      buyerAddress,
      buyerPhone,
      shippingMethod,
      paymentMethod,
      orderItems,
    } = req.body;

    const normalizedItems = normalizeOrderItems(orderItems);

    if (!user || normalizedItems.length === 0) {
      return res.status(400).json({ message: "Thiếu thông tin đơn hàng" });
    }

    const itemsSubtotal = normalizedItems.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );
    const shippingFee = normalizeText(shippingMethod).includes("hoa toc") ? EXPRESS_FEE : 0;
    const totalPrice = itemsSubtotal + shippingFee;

    const order = new Order({
      user,
      orderCode: orderCode || `DH${String(Math.floor(Math.random() * 99999)).padStart(5, "0")}`,
      buyerName,
      buyerAddress,
      buyerPhone,
      shippingMethod,
      paymentMethod,
      orderItems: normalizedItems,
      itemsSubtotal,
      shippingFee,
      totalPrice,
      status: "Đang giao"
    });

    const created = await order.save();
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.userId })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    
    order.status = status;
    const updated = await order.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
