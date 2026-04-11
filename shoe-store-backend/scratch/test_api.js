const http = require('http');

http.get('http://localhost:8000/api/products', (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log(`Received ${data.length} bytes`);
        try {
            const products = JSON.parse(data);
            console.log(`Successfully parsed ${Array.isArray(products) ? products.length : 'non-array'} products`);
            
            const tagCounts = {};
            products.forEach(p => {
                const t = p.tag || 'No Tag';
                tagCounts[t] = (tagCounts[t] || 0) + 1;
            });
            console.log('Tag Statistics:', tagCounts);
        } catch (e) {
            console.log('JSON parse error:', e.message);
        }
    });
}).on('error', (e) => {
    console.error(`Error: ${e.message}`);
});
