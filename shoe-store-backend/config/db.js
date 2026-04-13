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
    await sequelize.sync({ alter: true }); 
    console.log("Database synchronized (altered).");
  } catch (error) {
    console.error("Unable to connect to the SQLite database:", error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
