// src/js/products.js
const API_BASE = 'http://localhost:8000/api';

document.addEventListener('DOMContentLoaded', () => {
    fetchProductsForCurrentPage();
});

async function fetchProductsForCurrentPage() {
    try {
        const response = await fetch(`${API_BASE}/products`);
        if (!response.ok) throw new Error("Failed to fetch products");
        
        const products = await response.json();
        
        // Render mục Bestseller nếu có element
        const bestsellerGrid = document.getElementById('bestsellerGrid');
        if (bestsellerGrid) {
            bestsellerGrid.innerHTML = '';
            const bestsellers = products.slice(0, 12); // Lấy 12 đôi
            renderProductCards(bestsellerGrid, bestsellers);
            return; // Dừng nếu chỉ trang này
        }

        // Render mục Trending nếu có element
        const trendingGrid = document.getElementById('trendingGrid');
        if (trendingGrid) {
            trendingGrid.innerHTML = '';
            const trending = products.slice(12, 24); // Lấy 12 đôi tiếp theo
            renderProductCards(trendingGrid, trending);
            return;
        }

        // Render mục Danh mục Hãng (Nike, Adidas, vv) hoặc Dòng sản phẩm (Sport, Running, Casual)
        const categoryGrid = document.getElementById('categoryGrid');
        if (categoryGrid) {
            const brand = categoryGrid.getAttribute('data-brand');
            const type = categoryGrid.getAttribute('data-type');
            categoryGrid.innerHTML = '';
            
            let filtered = products;
            
            if (brand) {
                filtered = products.filter(p => (p.category || "").toLowerCase() === brand.toLowerCase());
            } else if (type) {
                filtered = products.filter(p => {
                    const name = (p.name || "").toLowerCase();
                    const isSport = name.match(/bóng đá|cầu lông|pickleball|tennis|tf|club|academy|predator|f50|phantom|mercurial|alpha|morelia|gate sky|wave claw|wave fang|wave drive|wave medal|wave dimension|sky blaster|dribble|vapor lite|hyperwarp/i);
                    const isRunning = name.match(/chạy bộ|run|nitro|pureboost|galaxy|duramo|ultrarun|response|speed|deviate|velocity|darter|reflect lite|fast|vomero|quest|downshifter|revolution|metcon|invincible|wave mujin/i);
                    
                    if (type === 'sport') {
                        return isSport && !isRunning;
                    } else if (type === 'running') {
                        return isRunning;
                    } else if (type === 'casual') {
                        return !isSport && !isRunning;
                    }
                    return true;
                });
            }
            
            if (filtered.length === 0) {
                categoryGrid.innerHTML = `<p class="col-span-full text-center text-gray-500">Chưa có sản phẩm phù hợp.</p>`;
            } else {
                renderProductCards(categoryGrid, filtered);
            }
            return;
        }

    } catch (err) {
        console.error("Lỗi lấy danh sách sản phẩm:", err);
    }
}

let currentProducts = [];
let currentPage = 1;
const ITEMS_PER_PAGE = 8;
let currentContainerId = null;

function renderProductCards(container, productsSet, page = 1) {
    currentProducts = productsSet;
    currentContainerId = container.id;
    currentPage = page;

    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const itemsToShow = productsSet.slice(start, end);

    let html = '';

    itemsToShow.forEach(p => {
        const priceFmt = p.price ? p.price.toLocaleString('vi-VN') + ' đ' : 'Liên hệ';
        const img = p.image || 'https://via.placeholder.com/300x300';
        const orderUrl = `order.html?name=${encodeURIComponent(p.name)}&price=${encodeURIComponent(p.price)}&image=${encodeURIComponent(img)}`;
        html += `
            <div class="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition group cursor-pointer" onclick="window.location.href='${orderUrl}'">
                <div class="relative overflow-hidden h-64 bg-gray-100 flex items-center justify-center">
                    <img src="${img}" alt="${p.name}" class="object-cover w-full h-full group-hover:scale-105 transition duration-500">
                    <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <button onclick="event.stopPropagation(); addToCart('${p._id}', '${p.name}', ${p.price})" class="bg-blue-600 text-white px-4 py-2 rounded-full font-medium hover:bg-blue-700 transform translate-y-4 group-hover:translate-y-0 transition">
                            Thêm vào giỏ
                        </button>
                    </div>
                </div>
                <div class="p-4">
                    <p class="text-xs text-gray-500 font-semibold mb-1 uppercase tracking-wider">${p.category || 'Khác'}</p>
                    <h3 class="font-bold text-gray-800 text-lg mb-2 truncate" title="${p.name}">${p.name}</h3>
                    <p class="text-red-600 font-bold text-lg">${priceFmt}</p>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    
    // Add pagination wrapper
    renderPagination(container, productsSet.length, page);
}

function renderPagination(container, totalItems, page) {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    
    let paginationDiv = document.getElementById('dynamic-pagination');
    if (!paginationDiv) {
        paginationDiv = document.createElement('div');
        paginationDiv.id = 'dynamic-pagination';
        paginationDiv.className = 'w-full flex justify-center gap-2 mt-8 col-span-full';
        // Thêm ngay sau container thay vì bên trong để không đè lên lưới grid
        container.parentElement.insertBefore(paginationDiv, container.nextSibling);
    }

    if (totalPages <= 1) {
        paginationDiv.innerHTML = '';
        return;
    }

    let pHTML = '';
    
    const prevClass = page > 1 ? "bg-white border text-blue-600 hover:bg-gray-100 cursor-pointer" : "bg-gray-100 border text-gray-400 cursor-not-allowed";
    pHTML += `<button ${page > 1 ? `onclick="window.changePage(${page - 1})"` : 'disabled'} class="px-4 py-2 rounded font-bold transition ${prevClass}">←</button>`;

    for (let i = 1; i <= totalPages; i++) {
        if (i === page) {
            pHTML += `<button class="px-4 py-2 bg-blue-600 text-white rounded font-bold transition">${i}</button>`;
        } else {
            pHTML += `<button onclick="window.changePage(${i})" class="px-4 py-2 bg-white border text-blue-600 rounded font-bold hover:bg-gray-100 transition">${i}</button>`;
        }
    }

    const nextClass = page < totalPages ? "bg-white border text-blue-600 hover:bg-gray-100 cursor-pointer" : "bg-gray-100 border text-gray-400 cursor-not-allowed";
    pHTML += `<button ${page < totalPages ? `onclick="window.changePage(${page + 1})"` : 'disabled'} class="px-4 py-2 rounded font-bold transition ${nextClass}">→</button>`;

    paginationDiv.innerHTML = pHTML;
}

window.changePage = function(page) {
    const container = document.getElementById(currentContainerId);
    if (container && currentProducts.length > 0) {
        renderProductCards(container, currentProducts, page);
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

function addToCart(id, name, price) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check exist
    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.quantity += 1;
        existing.total = existing.quantity * existing.price;
    } else {
        cart.push({
            id,
            name,
            price: price,
            quantity: 1,
            total: price
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Đã thêm "' + name + '" vào giỏ hàng!');
}
