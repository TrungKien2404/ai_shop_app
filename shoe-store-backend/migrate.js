const Product = require('./models/Product');
const { connectDB } = require('./config/db');

async function migrate() {
    await connectDB();
    console.log('--- Đang bắt đầu quá trình hồi sinh nhãn sản phẩm ---');

    // 1. Gắn nhãn Bestseller cho 20 đôi đầu tiên
    const products = await Product.findAll();
    console.log(`Tìm thấy tổng cộng ${products.length} sản phẩm.`);

    let updatedCount = 0;
    for (let i = 0; i < products.length; i++) {
        const p = products[i];
        if (!p.tag) {
            if (i < 20) p.tag = 'Bestseller';
            else if (i < 40) p.tag = 'Trending';
            else if (i < 45) p.tag = 'Độc quyền';
            
            await p.save();
            updatedCount++;
        }
    }

    console.log(`✅ Thành công! Đã tự động gắn nhãn cho ${updatedCount} sản phẩm cũ.`);
    process.exit(0);
}

migrate();
