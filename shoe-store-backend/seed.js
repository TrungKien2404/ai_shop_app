const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB...");

    const data = fs.readFileSync('./data.csv', 'utf8');
    const lines = data.split('\n').filter(line => line.trim().length > 0);
    
    // Lines[0] is header
    const productsToInsert = [];
    
    for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(';');
        if (parts.length >= 5) {
            let img = parts[4].trim();
            // replace "anh_sp\" with "images/"
            img = img.replace(/\\/g, '/');
            img = img.replace('anh_sp/', 'images/');

            let price = parseInt(parts[1].trim(), 10);
            if (isNaN(price)) price = 0;

            productsToInsert.push({
                name: parts[0].trim(),
                price: price,
                brand: parts[2].trim(),
                category: parts[2].trim(),
                description: parts[3].trim(),
                image: img,
                stock: 100 // default stock
            });
        }
    }

    if (productsToInsert.length > 0) {
        // clear old products
        await Product.deleteMany({});
        console.log("Cleared old products...");
        
        await Product.insertMany(productsToInsert);
        console.log(`Successfully seeded ${productsToInsert.length} products!`);
    } else {
        console.log("No products found in CSV or parsing error.");
    }
    
    process.exit();
  } catch (e) {
    console.error("Error seeding:", e);
    process.exit(1);
  }
}

seedProducts();
