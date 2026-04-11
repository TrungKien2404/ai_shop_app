const axios = require('axios');

const API_URL = 'http://localhost:8000/api/products';

async function checkProducts() {
    try {
        const res = await axios.get(API_URL);
        const products = Array.isArray(res.data) ? res.data : res.data.products;
        
        console.log('--- KẾT QUẢ KIỂM TRA DỮ LIỆU ---');
        console.log(`Tổng số sản phẩm: ${products.length}`);
        
        const tags = {};
        products.forEach(p => {
            if (p.tag) {
                tags[p.tag] = (tags[p.tag] || 0) + 1;
            }
        });
        
        console.log('Phân loại theo Tag (Khu vực):', tags);
        
        const latest = products.slice(-5).reverse();
        console.log('\nTop 5 sản phẩm mới nhất:');
        latest.forEach(p => console.log(`- ${p.name} [Brand: ${p.brand}] [Tag: ${p.tag || 'N/A'}]`));

    } catch (err) {
        console.error('Lỗi khi gọi API:', err.message);
    }
}

checkProducts();
