const User = require("../models/User");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const jwt = require("jsonwebtoken");
const config = require("../config/env");
const { Op } = require("sequelize");

const normalizeEmail = (email) => (email || "").trim().toLowerCase();

const findUserByEmailCaseInsensitive = (email) =>
  User.findOne({
    where: {
      email: normalizeEmail(email),
    },
  });

// generate JWT
const generateToken = (id) =>
  jwt.sign({ id }, config.jwtSecret, { expiresIn: "7d" });

exports.register = async (req, res) => {
  try {
    const { name, password } = req.body;
    const email = normalizeEmail(req.body.email);

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const userExists = await findUserByEmailCaseInsensitive(email);
    if (userExists) return res.status(400).json({ message: "User exists" });

    const user = await User.create({
      name: name?.trim() || "User",
      email,
      password,
    });

    res.status(201).json({
      _id: user.id, // Aliasing id to _id for frontend compatibility
      name: user.name,
      email: user.email,
      isAdmin: Boolean(user.isAdmin),
      token: generateToken(user.id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await findUserByEmailCaseInsensitive(email);
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: Boolean(user.isAdmin),
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
    });
    // Transform to include _id for frontend
    const transformedUsers = users.map(u => ({
      ...u.toJSON(),
      _id: u.id
    }));
    res.json(transformedUsers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All password fields are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New password and confirm password do not match" });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createUserByAdmin = async (req, res) => {
  try {
    const { name, password, isAdmin } = req.body;
    const email = normalizeEmail(req.body.email);

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const userExists = await findUserByEmailCaseInsensitive(email);
    if (userExists) return res.status(400).json({ message: "User exists" });

    const user = await User.create({
      name: name?.trim() || "User",
      email,
      password,
      isAdmin: isAdmin || false
    });

    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: Boolean(user.isAdmin),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting oneself
    if (req.user && String(req.user.id) === String(id)) {
      return res.status(400).json({ message: "Cannot delete your own admin account" });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete associated orders and order items
    const orders = await Order.findAll({ where: { userId: id } });
    for (const order of orders) {
      // Find and delete all items for this order
      await OrderItem.destroy({ where: { orderId: order.id } });
      // Delete the order itself
      await order.destroy();
    }

    // Finally delete the user
    await user.destroy();

    res.json({ message: "User and associated orders deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
