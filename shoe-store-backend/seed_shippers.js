const { sequelize } = require("./config/db");
const User = require("./models/User");

async function seed() {
  try {
    await sequelize.authenticate();
    console.log("Connected to DB.");
    
    // Sync schema changes (add role and assignedBrand columns)
    await sequelize.sync({ alter: true });
    console.log("Database schema updated.");

    const shippers = [
      { name: "Shipper Nike", email: "nike@shipper.com", password: "password123", role: "shipper", assignedBrand: "Nike" },
      { name: "Shipper Adidas", email: "adidas@shipper.com", password: "password123", role: "shipper", assignedBrand: "Adidas" },
      { name: "Shipper Puma", email: "puma@shipper.com", password: "password123", role: "shipper", assignedBrand: "Puma" },
      { name: "Shipper Biti's", email: "bitis@shipper.com", password: "password123", role: "shipper", assignedBrand: "Biti's" },
      { name: "Shipper Mizuno", email: "mizuno@shipper.com", password: "password123", role: "shipper", assignedBrand: "Mizuno" },
    ];

    for (const s of shippers) {
      const exists = await User.findOne({ where: { email: s.email } });
      if (!exists) {
        await User.create(s);
        console.log(`Created: ${s.email}`);
      } else {
        // Update existing to ensure role and brand are set
        exists.role = s.role;
        exists.assignedBrand = s.assignedBrand;
        await exists.save();
        console.log(`Updated: ${s.email}`);
      }
    }

    console.log("Seeding completed.");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();
