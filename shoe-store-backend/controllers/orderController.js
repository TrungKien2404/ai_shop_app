const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const User = require("../models/User");
const { sequelize } = require("../config/db");

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

const transformOrder = (o) => {
  const json = o.toJSON ? o.toJSON() : o;
  return {
    ...json,
    _id: json.id,
    user: json.User ? { ...json.User, _id: json.User.id } : json.userId,
    orderItems: json.orderItems ? json.orderItems.map(item => ({ ...item, _id: item.id })) : []
  };
};

exports.createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      user, // This might be an ID
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
      await transaction.rollback();
      return res.status(400).json({ message: "Thiếu thông tin đơn hàng" });
    }

    const itemsSubtotal = normalizedItems.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );
    const shippingFee = normalizeText(shippingMethod).includes("hoa toc") ? EXPRESS_FEE : 0;
    const totalPrice = itemsSubtotal + shippingFee;

    const order = await Order.create({
      userId: user,
      orderCode: orderCode || `DH${String(Math.floor(Math.random() * 99999)).padStart(5, "0")}`,
      buyerName,
      buyerAddress,
      buyerPhone,
      shippingMethod,
      paymentMethod,
      itemsSubtotal,
      shippingFee,
      totalPrice,
      status: "Đang giao"
    }, { transaction });

    for (const item of normalizedItems) {
      await OrderItem.create({
        ...item,
        orderId: order.id
      }, { transaction });
    }

    await transaction.commit();
    
    // Fetch with items for response
    const createdOrder = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, as: "orderItems" }]
    });
    
    res.status(201).json(transformOrder(createdOrder));
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: User, attributes: { exclude: ["password"] } },
        { model: OrderItem, as: "orderItems" }
      ],
      order: [["createdAt", "DESC"]]
    });
    res.json(orders.map(transformOrder));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.params.userId },
      include: [{ model: OrderItem, as: "orderItems" }],
      order: [["createdAt", "DESC"]]
    });
    res.json(orders.map(transformOrder));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    
    order.status = status;
    await order.save();
    
    const updatedOrder = await Order.findByPk(order.id, {
       include: [{ model: OrderItem, as: "orderItems" }]
    });
    res.json(transformOrder(updatedOrder));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
