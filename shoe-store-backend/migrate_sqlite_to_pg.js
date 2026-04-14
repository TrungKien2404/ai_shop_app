const { Sequelize } = require("sequelize");
const path = require("path");
const { connectDB } = require("./config/db");
const Product = require("./models/Product");
const User = require("./models/User");
const Order = require("./models/Order");
const OrderItem = require("./models/OrderItem");

async function migrate() {
  // 1. Kết nối PostgreSQL (thông qua config/db.js đã update lúc nãy)
  await connectDB(); 

  // 2. Kết nối lại vào file SQLite cũ
  const sqliteSequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'database.sqlite'),
    logging: false
  });

  try {
    console.log("📥 Đang kéo dữ liệu mới nhất từ SQLite...");
    // Đọc tất cả dữ liệu từ các bảng trong SQLite
    const [users] = await sqliteSequelize.query("SELECT * FROM Users");
    const [products] = await sqliteSequelize.query("SELECT * FROM Products");
    const [orders] = await sqliteSequelize.query("SELECT * FROM Orders");
    const [orderItems] = await sqliteSequelize.query("SELECT * FROM OrderItems");

    console.log("🗑️ Đang xoá dữ liệu bảng đang có ở Postgres...");
    // Nếu bảng có khóa ngoại, cần xoá con trước, cha sau
    await OrderItem.destroy({ where: {}, truncate: true, cascade: true });
    await Order.destroy({ where: {}, truncate: true, cascade: true });
    await Product.destroy({ where: {}, truncate: true, cascade: true });
    await User.destroy({ where: {}, truncate: true, cascade: true });

    console.log("📤 Đang đẩy lại dữ liệu sang Postgres...");
    // Insert lại theo thứ tự (Cha trước, con sau)
    if (users.length > 0) {
      await User.bulkCreate(users);
      console.log(`✅ Đã copy ${users.length} Users`);
    }

    if (products.length > 0) {
      await Product.bulkCreate(products);
      console.log(`✅ Đã copy ${products.length} Products`);
    }

    if (orders.length > 0) {
      await Order.bulkCreate(orders);
      console.log(`✅ Đã copy ${orders.length} Orders`);
    }

    if (orderItems.length > 0) {
      await OrderItem.bulkCreate(orderItems);
      console.log(`✅ Đã copy ${orderItems.length} OrderItems`);
    }

    // SQLite có thể đã lưu lại id sequence. 
    // Sequelize PostgreSQL đôi khi bị lệch sequence (bộ đếm khoá chính ID) nếu chèn ID thủ công.
    // Lệnh này giúp cập nhật lại bộ đếm của PostgreSQL để không bị lỗi khi tạo mới về sau:
    console.log("⚙️ Đang đồng bộ lại bộ đếm ID (Sequence)...");
    const pg = require("./config/db").sequelize;
    await pg.query(`SELECT setval('"Users_id_seq"', (SELECT MAX(id) FROM "Users"));`);
    await pg.query(`SELECT setval('"Products_id_seq"', (SELECT MAX(id) FROM "Products"));`);
    if(orders.length > 0) await pg.query(`SELECT setval('"Orders_id_seq"', (SELECT MAX(id) FROM "Orders"));`);
    if(orderItems.length > 0) await pg.query(`SELECT setval('"OrderItems_id_seq"', (SELECT MAX(id) FROM "OrderItems"));`);

    console.log("🎉 XIN CHÚC MỪNG: Migrate thành công TOÀN BỘ dữ liệu từ bản SQLite cũ nhất sang PostgreSQL!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi chuyển đổi:", error);
    process.exit(1);
  }
}

migrate();
