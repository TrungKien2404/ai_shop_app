const { sequelize } = require("./config/db");
const OrderItem = require("./models/OrderItem");

async function fixBrands() {
  try {
    await sequelize.authenticate();
    console.log("Connected to DB.");

    const items = await OrderItem.findAll();
    const brands = ["Nike", "Adidas", "Puma", "Biti's", "Mizuno"];

    for (const item of items) {
      if (!item.brand) {
        const name = item.name.toLowerCase();
        const foundBrand = brands.find(b => name.includes(b.toLowerCase()));
        if (foundBrand) {
          item.brand = foundBrand;
          await item.save();
          console.log(`Updated brand for ${item.name}: ${foundBrand}`);
        }
      }
    }

    console.log("Fix completed.");
    process.exit(0);
  } catch (error) {
    console.error("Fix failed:", error);
    process.exit(1);
  }
}

fixBrands();
