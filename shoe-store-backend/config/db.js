const { Sequelize } = require("sequelize");
const path = require("path");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "..", "database.sqlite"),
  logging: false,
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully.");
    // Tat alter: true vi cau truc da on dinh, tranh lam treo may chu voi 111 san pham
    await sequelize.sync(); 
    console.log("Database synchronized.");
  } catch (error) {
    console.error("Unable to connect to the SQLite database:", error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
