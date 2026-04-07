const express = require("express");
const { createOrder, getOrders, getMyOrders, updateOrderStatus } = require("../controllers/orderController");
const router = express.Router();

router.get("/", getOrders);
router.get("/myorders/:userId", getMyOrders);
router.post("/", createOrder);
router.put("/:id", updateOrderStatus);

module.exports = router;
