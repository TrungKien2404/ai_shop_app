const fs = require("fs");
const path = require("path");
const connectDB = require("../config/db");
const Product = require("../models/Product");

const importData = async () => {
  try {
    // Kết nối đến MongoDB
    await connectDB();

    console.log("Đang đọc file dữ liệu datas.csv...");
    // Đường dẫn tới datas.csv ở thư mục gốc (project_cki)
    const csvFilePath = path.join(__dirname, "../../datas.csv");
    
    if (!fs.existsSync(csvFilePath)) {
      console.error(`❌ Không tìm thấy file: ${csvFilePath}`);
      process.exit(1);
    }

    const rawData = fs.readFileSync(csvFilePath, "utf8");
    const lines = rawData.split(/\r?\n/).filter(line => line.trim() !== "");

    const products = [];
    // Định dạng CSV header: Tên_sản_phẩm;Giá;Hãng;Mô tả;img_link
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(";");
      if (parts.length >= 5) {
        let name = parts[0].trim();
        let price = parseInt(parts[1]) || 0;
        let brand = parts[2].trim();
        let desc = parts[3].trim();
        let image = parts[4].replace(/"/g, "").trim();

        // Đổi dấu \ thành mũi tên / để dễ dùng cho HTML src=""
        image = image.replace(/\\/g, "/");

        products.push({
          name: name,
          price: price,
          brand: brand,
          category: brand,
          size: [38, 39, 40, 41, 42, 43], // Giá trị mẫu
          stock: Math.floor(Math.random() * 50) + 10,
          description: desc || "Thông tin mô tả sản phẩm đang được cập nhật.",
          image: image,
        });
      }
    }

    console.log(`Đã quét thấy ${products.length} sản phẩm. Đang cập nhật Database (Member 3 Workspace)...`);

    // Xóa sản phẩm cũ để tránh trùng lặp
    await Product.deleteMany();
    console.log("Đã xóa các sản phẩm cũ trong Database.");

    // Nhúng sản phẩm mới vào
    await Product.insertMany(products);
    console.log("🎉 Hoàn thành! Đã nạp thành công toàn bộ dữ liệu mẫu vào file cơ sở dữ liệu.");
    
    process.exit();
  } catch (error) {
    console.error("❌ Lỗi trong quá trình import:", error);
    process.exit(1);
  }
};

importData();
