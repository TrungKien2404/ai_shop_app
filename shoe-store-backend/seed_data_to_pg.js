const fs = require('fs');
const bcrypt = require('bcryptjs');
const { connectDB, sequelize } = require('./config/db');
const Product = require('./models/Product');
const User = require('./models/User');

async function importData() {
  await connectDB();

  try {
    // 1. Phục hồi dữ liệu Products
    if (fs.existsSync('./seed_data.json')) {
      const productData = JSON.parse(fs.readFileSync('./seed_data.json', 'utf-8'));
      
      const formattedProducts = productData.map(p => ({
        ...p,
        size: Array.isArray(p.size) ? JSON.stringify(p.size) : "[]",
      }));

      // Xoá dữ liệu cũ (nếu có) và thêm mới
      await Product.destroy({ where: {}, truncate: true, cascade: true });
      await Product.bulkCreate(formattedProducts);
      console.log(`✅ Đã import thành công ${formattedProducts.length} sản phẩm từ seed_data.json`);
    } else {
      console.log(`⚠️ Không tìm thấy file seed_data.json`);
    }

    // 2. Phục hồi dữ liệu Users
    if (fs.existsSync('./seed-users.json')) {
      const userData = JSON.parse(fs.readFileSync('./seed-users.json', 'utf-8'));
      
      const formattedUsers = [];
      for (const u of userData) {
        // Hash lại mật khẩu để model authentication hoạt động bình thường
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(u.password, salt);
        formattedUsers.push({
          ...u,
          password: hashedPassword
        });
      }

      await User.destroy({ where: {}, truncate: true, cascade: true });
      await User.bulkCreate(formattedUsers);
      console.log(`✅ Đã import thành công ${formattedUsers.length} người dùng từ seed-users.json`);
    }

    console.log("🎉 Hoàn tất quá trình đồng bộ dữ liệu vào PostgreSQL!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi import data:", error);
    process.exit(1);
  }
}

importData();
