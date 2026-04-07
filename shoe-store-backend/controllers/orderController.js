const Order = require("../models/Order");

exports.createOrder = async (req, res) => {
  try {
    const { user, orderCode, buyerName, buyerAddress, buyerPhone, shippingMethod, paymentMethod, orderItems, totalPrice } = req.body;
    
    if (!user || !orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "Thiếu thông tin đơn hàng" });
    }

    const order = new Order({
      user,
      orderCode,
      buyerName,
      buyerAddress,
      buyerPhone,
      shippingMethod,
      paymentMethod,
      orderItems,
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
