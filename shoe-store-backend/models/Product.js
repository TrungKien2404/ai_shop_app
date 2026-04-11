const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Product = sequelize.define("Product", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  brand: {
    type: DataTypes.STRING,
  },
  category: {
    type: DataTypes.STRING, // Dùng cho 'Bóng đá', 'Chạy bộ', 'Casual'
  },
  tag: {
    type: DataTypes.STRING, // Dùng cho 'Trending', 'Bestseller', 'Độc quyền'
  },
  size: {
    type: DataTypes.STRING, // Store as JSON string, e.g., "[38, 39, 40]"
    defaultValue: "[]",
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  description: {
    type: DataTypes.TEXT,
  },
  image: {
    type: DataTypes.STRING,
  },
});

module.exports = Product;
