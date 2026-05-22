const fs = require('fs');
const bcrypt = require('bcryptjs');
const { connectDB } = require('./config/db');
const Product = require('./models/Product');
const User = require('./models/User');

async function checkAndSeed() {
  await connectDB();
  try {
    if (process.env.DB_URL && process.env.AUTO_SEED !== "true") {
      console.log("Database is configured using DB_URL (Cloud Database). Skipping automatic seeding to prevent overwriting cloud data.");
      console.log("To force seeding on cloud database, set environment variable AUTO_SEED=true.");
      process.exit(0);
    }

    const productCount = await Product.count();
    const userCount = await User.count();
    
    if (productCount === 0 && userCount === 0) {
      console.log("Database is empty. Starting automatic seeding...");
      
      // 1. Seed Products
      if (fs.existsSync('./seed_data.json')) {
        const productData = JSON.parse(fs.readFileSync('./seed_data.json', 'utf-8'));
        const formattedProducts = productData.map(p => ({
          ...p,
          size: Array.isArray(p.size) ? JSON.stringify(p.size) : "[]",
        }));
        await Product.bulkCreate(formattedProducts);
        console.log(`✅ Seeded ${formattedProducts.length} products successfully.`);
      } else {
        console.log("⚠️ seed_data.json not found.");
      }

      // 2. Seed Users
      if (fs.existsSync('./seed-users.json')) {
        const userData = JSON.parse(fs.readFileSync('./seed-users.json', 'utf-8'));
        const formattedUsers = [];
        for (const u of userData) {
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(u.password, salt);
          formattedUsers.push({
            ...u,
            password: hashedPassword
          });
        }
        await User.bulkCreate(formattedUsers);
        console.log(`✅ Seeded ${formattedUsers.length} users successfully.`);
      } else {
        console.log("⚠️ seed-users.json not found.");
      }

      // 3. Seed Shippers (from seed_shippers.js)
      const shippers = [
        { name: "Shipper Nike", email: "nike@shipper.com", password: "password123", role: "shipper", assignedBrand: "Nike" },
        { name: "Shipper Adidas", email: "adidas@shipper.com", password: "password123", role: "shipper", assignedBrand: "Adidas" },
        { name: "Shipper Puma", email: "puma@shipper.com", password: "password123", role: "shipper", assignedBrand: "Puma" },
        { name: "Shipper Biti's", email: "bitis@shipper.com", password: "password123", role: "shipper", assignedBrand: "Biti's" },
        { name: "Shipper Mizuno", email: "mizuno@shipper.com", password: "password123", role: "shipper", assignedBrand: "Mizuno" },
      ];

      for (const s of shippers) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(s.password, salt);
        await User.create({
          ...s,
          password: hashedPassword
        });
        console.log(`✅ Created shipper account: ${s.email}`);
      }

      console.log("🎉 Database seeding completed!");
    } else {
      console.log("Database already has data. Skipping automatic seeding.");
    }
    process.exit(0);
  } catch (error) {
    console.error("❌ Error checking/seeding database:", error);
    process.exit(1);
  }
}

checkAndSeed();
