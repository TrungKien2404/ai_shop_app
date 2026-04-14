const { Sequelize } = require("sequelize");
require("dotenv").config(); // Load biến môi trường

let sequelize;

if (process.env.DB_URL) {
  // 1. Chạy với Cloud Database (Render, Supabase,...)
  sequelize = new Sequelize(process.env.DB_URL, {
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Bắt buộc thiết lập SSL khi kết nối từ ngoài vào Render
      }
    }
  });
} else {
  console.log('Connecting to database with:');
  console.log(`- DB_NAME: ${process.env.DB_NAME || 'shoe_shop'}`);
  console.log(`- DB_USER: ${process.env.DB_USER || 'postgres'}`);
  console.log(`- DB_HOST: ${process.env.DB_HOST || '127.0.0.1'}`);
  console.log(`- DB_PORT: ${process.env.DB_PORT || 5432}`);

  sequelize = new Sequelize(
    process.env.DB_NAME || 'shoe_shop',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 5432,
      dialect: "postgres",
      logging: false,
    }
  );
}

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL Database connected successfully.");

    // Đồng bộ model với database (sẽ tự động tạo bảng nếu chưa có)
    await sequelize.sync({ alter: true });
    console.log("Database synchronized (altered).");
  } catch (error) {
    console.error("Unable to connect to the PostgreSQL database:", error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
