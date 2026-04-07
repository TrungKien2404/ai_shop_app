const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  orderCode: { type: String, required: true },
  buyerName: String,
  buyerAddress: String,
  buyerPhone: String,
  shippingMethod: String,
  paymentMethod: String,
  orderItems: [
    {
      name: String,
      image: String,
      price: Number,
      quantity: Number,
      size: String,
    },
  ],
  totalPrice: Number,
  status: { type: String, default: "Đang giao" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
