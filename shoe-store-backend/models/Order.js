const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const User = require("./User");

const Order = sequelize.define("Order", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  orderCode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  buyerName: {
    type: DataTypes.STRING,
  },
  buyerAddress: {
    type: DataTypes.STRING,
  },
  buyerPhone: {
    type: DataTypes.STRING,
  },
  shippingMethod: {
    type: DataTypes.STRING,
  },
  paymentMethod: {
    type: DataTypes.STRING,
  },
  itemsSubtotal: {
    type: DataTypes.FLOAT,
  },
  shippingFee: {
    type: DataTypes.FLOAT,
  },
  totalPrice: {
    type: DataTypes.FLOAT,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "Chờ xử lý",
  },
});

Order.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Order, { foreignKey: "userId" });

module.exports = Order;
