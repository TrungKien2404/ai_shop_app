const fs = require('fs');
const files = ['adidas.html', 'puma.html', 'bitis.html', 'mizuno.html', 'bestseller.html', 'trending.html'];

files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    
    // Nếu đã có products.js thì bỏ qua
    if (content.includes('js/products.js')) {
        console.log(f + ': already has products.js');
        return;
    }
    
    // Thêm products.js trước theme.js
    content = content.replace(
        '<script src="js/theme.js"></script>',
        '<script src="js/products.js"></script>\n  <script src="js/theme.js"></script>'
    );
    
    fs.writeFileSync(f, content);
    console.log(f + ': FIXED - added products.js');
});

console.log('Done!');
