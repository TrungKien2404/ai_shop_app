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
        
        const isHomePage = location.pathname.includes('home.html') || location.pathname.endsWith('/');
        
        // Render mục Best Seller
        const bestsellerGrid = document.getElementById('bestsellerGrid');
        if (bestsellerGrid) {
            bestsellerGrid.innerHTML = '';
            let bestsellItems = products.filter(p => {
                const t = (p.tag || "").toLowerCase();
                return t.includes('bestseller') || t.includes('best seller');
            }).reverse();

            if (bestsellItems.length === 0) {
                bestsellItems = products.slice(-8).reverse(); 
            } else if (isHomePage) {
                bestsellItems = bestsellItems.slice(0, 12); 
            }
            renderProductCards(bestsellerGrid, bestsellItems);
        }

        // Render mục Trending
        const trendingGrid = document.getElementById('trendingGrid');
        if (trendingGrid) {
            trendingGrid.innerHTML = '';
            let trendingItems = products.filter(p => (p.tag || "").toLowerCase().includes('trending')).reverse();
            if (trendingItems.length === 0) {
                trendingItems = products.slice(-8).reverse(); 
            } else if (isHomePage) {
                trendingItems = trendingItems.slice(0, 12);
            }
            renderProductCards(trendingGrid, trendingItems);
        }

        // Render mục Sản phẩm độc quyền (Exclusive)
        const exclusiveGrid = document.getElementById('exclusiveGrid');
        if (exclusiveGrid) {
            exclusiveGrid.innerHTML = '';
            let exclusiveItems = products.filter(p => {
                const t = (p.tag || "").toLowerCase();
                return t.includes('độc quyền') || t.includes('exclusive');
            }).reverse();
            
            if (exclusiveItems.length === 0) {
                exclusiveItems = products.slice(-4).reverse(); 
            } else if (isHomePage) {
                exclusiveItems = exclusiveItems.slice(0, 8);
            }
            renderProductCards(exclusiveGrid, exclusiveItems);
        }

        // Render mục Danh mục Hãng hoặc Loại hình
        const categoryGrid = document.getElementById('categoryGrid');
        if (categoryGrid) {
            const brand = categoryGrid.getAttribute('data-brand'); // VD: Nike, Adidas...
            const type = categoryGrid.getAttribute('data-type');   // VD: sport, running...
            categoryGrid.innerHTML = '';
            
            let filtered = products;
            
            if (brand) {
                // Lọc theo cột brand (Hãng) hoặc category (dành cho dữ liệu cũ)
                filtered = products.filter(p => 
                    (p.brand || "").toLowerCase() === brand.toLowerCase() || 
                    (p.category || "").toLowerCase() === brand.toLowerCase()
                );
            } else if (type) {
                // Lọc theo cột category (Loại hình) hoặc từ khóa tên
                const typeMap = { 'sport': 'Bóng đá', 'running': 'Chạy bộ', 'casual': 'Casual' };
                const targetType = typeMap[type];

                filtered = products.filter(p => {
                    // 1. Ưu tiên khớp chính xác cột category
                    if (p.category === targetType) return true;
                    
                    // 2. Fallback: Quét từ khóa trong tên
                    const name = (p.name || "").toLowerCase();
                    const isSport = name.match(/bóng đá|cầu lông|pickleball|tennis|tf|club|academy|predator|f50|phantom|mercurial|alpha|morelia|gate sky|wave claw|wave fang|wave drive|wave medal|wave dimension|sky blaster|dribble|vapor lite|hyperwarp/i);
                    const isRunning = name.match(/chạy bộ|run|nitro|pureboost|galaxy|duramo|ultrarun|performance|speed|deviate|velocity|darter|reflect lite|fast|vomero|quest|downshifter|revolution|metcon|invincible|wave mujin/i);
                    
                    if (type === 'sport') return isSport;
                    if (type === 'running') return isRunning;
                    if (type === 'casual') return !isSport && !isRunning;
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
        // Hiển thị báo lỗi lên giao diện thay vì để xoay mãi
        const grids = ['bestsellerGrid', 'trendingGrid', 'exclusiveGrid', 'categoryGrid'];
        grids.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = `<p class="col-span-full text-center text-red-500 py-10">Lỗi kết nối máy chủ! (Vui lòng kiểm tra Backend)</p>`;
        });
    }
}

let currentProducts = [];
let currentPage = 1;
const ITEMS_PER_PAGE = 8;
let currentContainerId = null;
let pendingCartProduct = null;
const AVAILABLE_SIZES = ["38", "39", "40", "41", "42", "43"];

function renderProductCards(container, productsSet, page = 1) {
    currentProducts = productsSet;
    currentContainerId = container.id;
    currentPage = page;

    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const itemsToShow = productsSet.slice(start, end);

    let html = '';

    if (itemsToShow.length === 0) {
        container.innerHTML = `<p class="col-span-full text-center text-gray-500 py-10">Không có sản phẩm nào phù hợp.</p>`;
        return;
    }

    itemsToShow.forEach(p => {
        const priceFmt = p.price ? Number(p.price).toLocaleString('vi-VN') + ' đ' : 'Liên hệ';
        const imgRaw = p.image || 'https://via.placeholder.com/300x300';
        const img = encodeURI(imgRaw);
        // Xử lý an toàn cả dấu nháy đơn và kép cho HTML attribute
        const safeName = (p.name || "").replace(/"/g, "&quot;").replace(/'/g, "\\'");
        const orderUrl = `order.html?name=${encodeURIComponent(p.name)}&price=${encodeURIComponent(p.price)}&image=${encodeURIComponent(img)}`.replace(/'/g, "%27");

        html += `
            <div class="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition group cursor-pointer" onclick="location.href='${orderUrl}'">
                <div class="relative overflow-hidden h-64 bg-gray-50 flex items-center justify-center p-4">
                    <img src="${img}" alt="${safeName}" class="object-contain w-full h-full group-hover:scale-105 transition duration-500">
                    <div class="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <button onclick="event.stopPropagation(); openSizePicker('${p._id}', '${safeName}', ${p.price}, '${img}')" 
                                class="bg-blue-600 text-white px-4 py-2 rounded-full font-medium hover:bg-blue-700 transform translate-y-4 group-hover:translate-y-0 transition">
                            Thêm vào giỏ
                        </button>
                    </div>
                </div>
                <div class="p-4">
                    <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">${p.brand || 'SHOE STORE'}</p>
                    <h3 class="font-bold text-gray-800 text-sm mb-2 truncate" title="${p.name}">${p.name}</h3>
                    <p class="text-blue-600 font-bold text-base">${priceFmt}</p>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    renderPagination(container, productsSet.length, page);
    ensureSizePickerModal();
}

function renderPagination(container, totalItems, page) {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    let paginationDiv = document.getElementById('dynamic-pagination');
    
    if (!paginationDiv) {
        paginationDiv = document.createElement('div');
        paginationDiv.id = 'dynamic-pagination';
        paginationDiv.className = 'w-full flex justify-center gap-2 mt-8 col-span-full';
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
        pHTML += `<button onclick="window.changePage(${i})" class="px-4 py-2 ${i === page ? 'bg-blue-600 text-white' : 'bg-white border text-blue-600 hover:bg-gray-100'} rounded font-bold transition">${i}</button>`;
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

// ================== LOGIC CHỌN SIZE & GIỎ HÀNG ================== //

function ensureSizePickerModal() {
    if (document.getElementById('sizePickerModal')) return;
    const modal = document.createElement('div');
    modal.id = 'sizePickerModal';
    modal.className = 'hidden fixed inset-0 bg-black/60 z-[100] items-center justify-center px-4 backdrop-blur-sm';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div class="flex items-start justify-between">
                <h3 class="text-xl font-bold text-gray-900">Chọn size giày</h3>
                <button onclick="closeSizePicker()" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <p id="sizePickerName" class="text-sm text-gray-500 mt-1 mb-6"></p>
            <div id="sizeOptions" class="grid grid-cols-3 gap-3 mb-6"></div>
            <div class="flex gap-3">
                <button onclick="closeSizePicker()" class="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition">Hủy</button>
                <button onclick="confirmAddToCart()" class="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition">Thêm vào giỏ</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function openSizePicker(id, name, price, image) {
    if (!window.authUtils?.requireLogin?.('Vui lòng đăng nhập để thêm vào giỏ hàng.')) return;
    
    pendingCartProduct = { id, name, price, image, selectedSize: null };
    document.getElementById('sizePickerName').textContent = name;
    const optionsGrid = document.getElementById('sizeOptions');
    optionsGrid.innerHTML = AVAILABLE_SIZES.map(s => `
        <button onclick="selectSize(this, '${s}')" class="size-btn py-2 border-2 border-gray-100 rounded-lg font-bold text-gray-600 hover:border-blue-200 transition">${s}</button>
    `).join('');
    
    document.getElementById('sizePickerModal').classList.remove('hidden');
    document.getElementById('sizePickerModal').classList.add('flex');
}

function selectSize(btn, size) {
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('border-blue-600', 'text-blue-600', 'bg-blue-50', 'border-gray-100'));
    btn.classList.add('border-blue-600', 'text-blue-600', 'bg-blue-50');
    pendingCartProduct.selectedSize = size;
}

function closeSizePicker() {
    document.getElementById('sizePickerModal').classList.add('hidden');
    document.getElementById('sizePickerModal').classList.remove('flex');
}

function confirmAddToCart() {
    if (!pendingCartProduct.selectedSize) {
        alert('Vui lòng chọn size!');
        return;
    }
    const cart = window.cartUtils?.getCartItems?.() || [];
    cart.push({
        id: pendingCartProduct.id,
        name: pendingCartProduct.name,
        price: pendingCartProduct.price,
        image: pendingCartProduct.image,
        size: pendingCartProduct.selectedSize,
        quantity: 1
    });
    window.cartUtils?.saveCartItems?.(cart);
    window.cartUtils?.updateCartBadge?.();
    alert(`Đã thêm ${pendingCartProduct.name} (Size ${pendingCartProduct.selectedSize}) vào giỏ hàng!`);
    closeSizePicker();
}
