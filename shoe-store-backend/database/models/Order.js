const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: mongoose.Schema.Types.ObjectId,
    totalPrice: Number,
    status: {
      type: String,
      enum: ["pending", "paid", "shipped"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
