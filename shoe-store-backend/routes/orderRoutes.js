const express = require("express");
const { createOrder, getOrders, getMyOrders, updateOrderStatus, deleteOrder } = require("../controllers/orderController");
const { protect, admin } = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/", getOrders);
router.get("/myorders/:userId", getMyOrders);
router.post("/", createOrder);
router.put("/:id", updateOrderStatus);
router.delete("/:id", protect, admin, deleteOrder);

module.exports = router;
