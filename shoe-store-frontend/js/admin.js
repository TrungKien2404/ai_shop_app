/**
 * admin.js - Script xử lý logic riêng cho trang Dashboard Admin
 */
// Phần này dành cho local
// const API_BASE = 'http://localhost:8000/api';
// Phần này dành cho deploy render
const API_BASE = 'https://ai-shop-app-backend.onrender.com/';
// Kiểm tra quyền truy cập ngay khi load script
checkAdminAuth();

let products = [];
let orders = [];
let users = [];

// Charts
let revenueChart = null;
let statusChart = null;

document.addEventListener('DOMContentLoaded', () => {
    // Render Admin Info
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (user) {
        document.getElementById('adminName').textContent = user.name || user.fullname || 'Admin';
        document.getElementById('adminAvatar').textContent = ((user.name || user.fullname)?.charAt(0) || 'A').toUpperCase();
    }

    // Gắn sự kiện submit form Product
    document.getElementById('productForm').addEventListener('submit', handleProductSubmit);

    // Gắn sự kiện submit form User
    const userForm = document.getElementById('userForm');
    if (userForm) {
        userForm.addEventListener('submit', handleUserSubmit);
    }

    // Gắn sự kiện tìm kiếm sản phẩm
    const searchInput = document.getElementById('searchProduct');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const keyword = e.target.value.toLowerCase().trim();
            const filtered = products.filter(p =>
                (p.name || '').toLowerCase().includes(keyword) ||
                (p.brand || '').toLowerCase().includes(keyword)
            );
            renderProducts(filtered);
        });
    }

    // Load dữ liệu tab mặc định (Dashboard)
    switchTab('dashboard');
});

// ================== AUTH & LOGOUT ================== //

function checkAdminAuth() {
    const token = sessionStorage.getItem('token');
    const userStr = sessionStorage.getItem('user');

    if (!token || !userStr) {
        alert('Vui lòng đăng nhập để truy cập trang này.');
        window.location.href = 'login.html';
        return;
    }

    try {
        const user = JSON.parse(userStr);
        // Kiểm tra xem role có phải admin không (tuỳ thuộc vào cấu trúc backend trả về, 
        // thông thường là user.role === 'admin' hoặc user.isAdmin === true)
        if (user.role !== 'admin' && user.isAdmin !== true) {
            alert('Bạn không có quyền quản trị để truy cập trang này.');
            window.location.href = 'home.html';
        }
    } catch (e) {
        window.location.href = 'login.html';
    }
}

function handleAdminLogout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    window.location.href = 'login.html';
}

function getAuthHeaders() {
    const token = sessionStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}


// ================== TAB NAVIGATION ================== //

function switchTab(tabId) {
    // Ẩn tất cả nội dung
    document.querySelectorAll('.tab-content').forEach(el => {
        el.classList.add('hidden');
        el.classList.remove('block');
    });
    // Bỏ active tất cả tab link
    document.querySelectorAll('.tab-link').forEach(el => {
        el.classList.remove('active', 'bg-gray-800', 'text-blue-400');
    });

    // Hiện nội dung tab được chọn
    const targetContent = document.getElementById(`tab-${tabId}`);
    if (targetContent) {
        targetContent.classList.remove('hidden');
        targetContent.classList.add('block');
    }

    // Active tab link được chọn
    const activeLink = document.querySelector(`.tab-link[data-tab="${tabId}"]`);
    if (activeLink) {
        activeLink.classList.add('active', 'bg-gray-800', 'text-blue-400');
    }

    // Đổi tiêu đề và gọi data tương ứng
    const titleEl = document.getElementById('pageTitle');
    if (tabId === 'dashboard') {
        titleEl.textContent = 'Tổng quan hệ thống';
        loadDashboardStats();
    } else if (tabId === 'products') {
        titleEl.textContent = 'Quản lý Kho giày ảo';
        fetchProducts();
    } else if (tabId === 'orders') {
        titleEl.textContent = 'Quản lý Đơn hàng';
        fetchOrders();
    } else if (tabId === 'users') {
        titleEl.textContent = 'Quản lý Khách hàng';
        fetchUsers();
    }
}


// ================== LOAD THỐNG KÊ DASHBOARD ================== //

async function loadDashboardStats() {
    try {
        // 1. Tải Sản phẩm
        const resP = await fetch(`${API_BASE}/products`);
        if (resP.ok) {
            const dataP = await resP.json();
            products = dataP; // Lưu trữ để thống kê
            document.getElementById('stat-products').textContent = dataP.length || 0;
        }

        // 2. Tải Khách hàng
        const resU = await fetch(`${API_BASE}/auth/users`);
        if (resU.ok) {
            const dataU = await resU.json();
            users = dataU;
            document.getElementById('stat-users').textContent = dataU.length || 0;
        }

        // 3. Tải Đơn hàng và Tính toán nâng cao
        const resO = await fetch(`${API_BASE}/orders`, { headers: getAuthHeaders() });
        if (resO.ok) {
            const dataO = await resO.json();
            orders = dataO;
            document.getElementById('stat-orders').textContent = dataO.length || 0;

            // --- TÍNH TOÁN DOANH THU ---
            // Tính tất cả trừ đơn đã hủy
            const totalRevenue = orders
                .filter(o => o.status !== 'Đã hủy' && o.status !== 'Đã huỷ')
                .reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);
            document.getElementById('stat-revenue').textContent = totalRevenue.toLocaleString('vi-VN') + ' đ';

            // --- BIỂU ĐỒ VÀ TOP SẢN PHẨM ---
            initCharts(orders);
            renderTopProducts(orders);
            renderRecentActivity(orders, users, products);
        }

    } catch (err) {
        console.error("Lỗi khi load thống kê:", err);
    }
}

// ================== LOGIC THỐNG KÊ CHI TIẾT ================== //

function initCharts(ordersData) {
    // --- 1. BIỂU ĐỒ DOANH THU 7 NGÀY ---
    const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toLocaleDateString('vi-VN');
    }).reverse();

    const revenueByDay = last7Days.map(label => {
        return ordersData
            .filter(o => {
                const orderDate = new Date(o.createdAt).toLocaleDateString('vi-VN');
                const isFinished = (o.status === 'Đã hoàn thành' || o.status === 'Đã giao');
                return orderDate === label && isFinished;
            })
            .reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);
    });

    const ctxRevenue = document.getElementById('revenueChart').getContext('2d');
    if (revenueChart) revenueChart.destroy();
    revenueChart = new Chart(ctxRevenue, {
        type: 'line',
        data: {
            labels: last7Days,
            datasets: [{
                label: 'Doanh thu (VNĐ)',
                data: revenueByDay,
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    });

    // --- 2. BIỂU ĐỒ TRẠNG THÁI ---
    const statusCounts = {
        'Chờ xử lý': 0,
        'Đang giao': 0,
        'Đã giao': 0,
        'Đã hủy': 0
    };
    ordersData.forEach(o => {
        let s = o.status || 'Chờ xử lý';
        if (s === 'Đang giao hàng') s = 'Đang giao';
        if (s === 'Đã hoàn thành') s = 'Đã giao';
        if (s === 'Đã huỷ') s = 'Đã hủy';

        if (statusCounts.hasOwnProperty(s)) statusCounts[s]++;
        else statusCounts['Chờ xử lý']++;
    });

    const ctxStatus = document.getElementById('statusChart').getContext('2d');
    if (statusChart) statusChart.destroy();
    statusChart = new Chart(ctxStatus, {
        type: 'doughnut',
        data: {
            labels: Object.keys(statusCounts),
            datasets: [{
                data: Object.values(statusCounts),
                backgroundColor: ['#fbbf24', '#3b82f6', '#10b981', '#ef4444']
            }]
        },
        options: {
            plugins: { legend: { position: 'bottom' } }
        }
    });
}

function renderTopProducts(ordersData) {
    const productStats = {};

    ordersData.forEach(o => {
        if (o.status === 'Đã huỷ') return;
        if (o.orderItems) {
            o.orderItems.forEach(item => {
                if (!productStats[item.name]) {
                    productStats[item.name] = {
                        name: item.name,
                        image: item.image,
                        sold: 0,
                        revenue: 0
                    };
                }
                productStats[item.name].sold += (Number(item.quantity) || 0);
                productStats[item.name].revenue += (Number(item.price) * Number(item.quantity) || 0);
            });
        }
    });

    const sortedProducts = Object.values(productStats)
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 5);

    const tbody = document.getElementById('topProductsTableBody');
    tbody.innerHTML = '';

    if (sortedProducts.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="p-4 text-center text-gray-500">Chưa có dữ liệu giao dịch</td></tr>`;
        return;
    }

    sortedProducts.forEach(p => {
        tbody.innerHTML += `
            <tr class="hover:bg-gray-50 transition">
                <td class="p-3">
                    <div class="flex items-center gap-2">
                        <img src="${p.image || 'https://via.placeholder.com/32'}" class="w-8 h-8 object-cover rounded shadow-sm">
                        <span class="text-sm font-medium text-gray-700 truncate max-w-[150px]">${p.name}</span>
                    </div>
                </td>
                <td class="p-3 text-center font-bold text-gray-800">${p.sold}</td>
                <td class="p-3 text-right text-blue-600 font-semibold">${p.revenue.toLocaleString('vi-VN')} đ</td>
            </tr>
        `;
    });
}

function renderRecentActivity(ordersData, usersData, productsData) {
    const container = document.getElementById('recentActivity');
    container.innerHTML = '';

    let activities = [];

    // 1. Thu thập Đơn hàng
    ordersData.forEach(o => {
        activities.push({
            icon: 'fa-shopping-bag',
            color: 'text-green-500',
            bg: 'bg-green-50',
            text: `Đơn hàng mới <b>#${o.orderCode || o._id.substring(o._id.length - 6).toUpperCase()}</b> từ ${o.buyerName || 'Khách'}`,
            time: o.createdAt || new Date()
        });
    });

    // 2. Thu thập Người dùng mới
    usersData.forEach(u => {
        // Không hiện Admin trong hoạt động gần đây để tránh loãng
        if (u.role === 'admin') return;
        activities.push({
            icon: 'fa-user-plus',
            color: 'text-purple-500',
            bg: 'bg-purple-50',
            text: `Người dùng <b>${u.name}</b> vừa đăng ký`,
            time: u.createdAt || new Date()
        });
    });

    // 3. Thu thập Sản phẩm mới thêm
    if (productsData) {
        productsData.forEach(p => {
            activities.push({
                icon: 'fa-box',
                color: 'text-blue-500',
                bg: 'bg-blue-50',
                text: `Sản phẩm mới <b>${p.name}</b> vừa được thêm`,
                time: p.createdAt || new Date()
            });
        });
    }

    // --- SẮP XẾP TOÀN BỘ THEO THỜI GIAN MỚI NHẤT ---
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));

    // Chỉ lấy 5 hoạt động mới nhất của toàn hệ thống
    const recentOnes = activities.slice(0, 5);

    if (recentOnes.length === 0) {
        container.innerHTML = `<p class="text-gray-500 text-sm italic text-center py-4">Chưa có hoạt động nào.</p>`;
        return;
    }

    recentOnes.forEach(act => {
        const d = new Date(act.time);
        const timeStr = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const dateStr = d.toLocaleDateString('vi-VN');

        container.innerHTML += `
            <div class="flex gap-3 items-start p-2 rounded-lg hover:bg-gray-50 transition">
                <div class="w-8 h-8 rounded-full ${act.bg} ${act.color} flex items-center justify-center flex-shrink-0">
                    <i class="fa-solid ${act.icon} text-xs"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm text-gray-700 leading-snug truncate">${act.text}</p>
                    <p class="text-[10px] text-gray-400 mt-0.5">${timeStr} - ${dateStr}</p>
                </div>
            </div>
        `;
    });
}


// ================== QUẢN LÝ SẢN PHẨM ================== //

async function fetchProducts() {
    const tbody = document.getElementById('productsTableBody');
    tbody.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-gray-500"><i class="fas fa-spinner fa-spin mr-2"></i>Đang tải dữ liệu sản phẩm...</td></tr>`;

    try {
        const response = await fetch(`${API_BASE}/products`);
        const data = await response.json();
        products = Array.isArray(data) ? data : (data.products || []);
        renderProducts();
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-red-500">Lỗi kết nối đến máy chủ!</td></tr>`;
        console.error("Fetch products error", err);
    }
}

function renderProducts(dataToRender = null) {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

    const list = dataToRender || products;

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-gray-500">Không tìm thấy sản phẩm nào.</td></tr>`;
        return;
    }

    let html = '';
    list.forEach((p, index) => {
        const priceFmt = p.price ? p.price.toLocaleString('vi-VN') + ' đ' : 'Liên hệ';
        const imgRaw = p.image || 'https://via.placeholder.com/50';
        const img = encodeURI(imgRaw);

        html += `
            <tr class="hover:bg-gray-50/50 transition">
                <td class="p-4 text-gray-500">#${index + 1}</td>
                <td class="p-4">
                    <div class="flex items-center gap-3">
                        <img src="${img}" alt="${p.name}" class="w-12 h-12 object-cover rounded-lg border">
                        <div>
                            <span class="font-medium text-gray-800 block">${p.name}</span>
                            <span class="text-[10px] text-gray-400 uppercase tracking-tighter">${p.brand || 'Khác'}</span>
                        </div>
                    </div>
                </td>
                <td class="p-4 font-semibold text-blue-600">${priceFmt}</td>
                <td class="p-4">
                    <div class="flex flex-col gap-1">
                        <span class="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] w-fit font-bold">${p.category || 'Khác'}</span>
                        ${p.tag ? `<span class="px-2 py-0.5 bg-orange-50 text-orange-600 rounded text-[10px] w-fit font-bold">${p.tag}</span>` : ''}
                    </div>
                </td>
                <td class="p-4 text-center">
                    <div class="flex items-center justify-center gap-2">
                        <button onclick="editProduct('${p._id}')" class="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition flex items-center justify-center" title="Sửa">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button onclick="deleteProduct('${p._id}')" class="w-8 h-8 rounded-lg bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition flex items-center justify-center" title="Xóa">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

// Mở Modal Thêm/Sửa
function openProductModal() {
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('modalTitle').textContent = 'Thêm Sản Phẩm Mới';
    document.getElementById('productModal').classList.remove('hidden');
    document.getElementById('productModal').classList.add('flex');
    // Reset ô chọn phụ
    document.getElementById('categorySubSelect').classList.add('hidden');
}

function closeProductModal() {
    document.getElementById('productModal').classList.add('hidden');
    document.getElementById('productModal').classList.remove('flex');
}

// Logic ẩn hiện ô chọn Category phụ
function toggleCategorySelect(val) {
    const sub = document.getElementById('categorySubSelect');
    const oriGroup = document.getElementById('originalPriceGroup');

    // Hiện category phụ nếu chọn 'Category'
    if (val === 'Category') {
        sub.classList.remove('hidden');
    } else {
        sub.classList.add('hidden');
    }

    // Hiện giá gốc nếu chọn 'Sale'
    if (val === 'Sale') {
        oriGroup.classList.remove('hidden');
    } else {
        oriGroup.classList.add('hidden');
    }
}

// Đẩy dữ liệu vào Modal để Sửa
function editProduct(id) {
    const p = products.find(prod => String(prod._id) === String(id));
    if (!p) return;

    document.getElementById('productId').value = p._id;
    document.getElementById('pName').value = p.name || '';
    document.getElementById('pPrice').value = p.price || '';
    document.getElementById('pBrand').value = p.brand || 'Nike';

    const sectionSelect = document.getElementById('pSection');
    if (p.tag === 'Độc quyền' || p.tag === 'Trending' || p.tag === 'Bestseller') {
        sectionSelect.value = p.tag;
        toggleCategorySelect('');
    } else if (p.category) {
        sectionSelect.value = 'Category';
        document.getElementById('pCategory').value = p.category;
        toggleCategorySelect('Category');
    } else {
        sectionSelect.value = '';
        toggleCategorySelect('');
    }
    document.getElementById('pImage').value = p.image || '';
    document.getElementById('pDescription').value = p.description || '';
    document.getElementById('pOriginalPrice').value = p.originalPrice || '';

    document.getElementById('modalTitle').textContent = 'Cập nhật Sản Phẩm';
    document.getElementById('productModal').classList.remove('hidden');
    document.getElementById('productModal').classList.add('flex');
}

// Xử lý Submit Form (Create / Update)
async function handleProductSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('btnSubmitProduct');
    const oriText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Đang lưu...';
    btn.disabled = true;

    const id = document.getElementById('productId').value;

    const sectionValue = document.getElementById('pSection').value;
    let finalTag = "";
    let finalCategory = "";

    if (sectionValue === 'Category') {
        finalCategory = document.getElementById('pCategory').value;
    } else {
        finalTag = sectionValue;
    }

    const payload = {
        name: document.getElementById('pName').value,
        price: Number(document.getElementById('pPrice').value),
        brand: document.getElementById('pBrand').value,
        category: finalCategory,
        tag: finalTag,
        image: document.getElementById('pImage').value,
        description: document.getElementById('pDescription').value,
        originalPrice: Number(document.getElementById('pOriginalPrice').value) || 0
    };

    try {
        let res;
        if (id) {
            // PUT: Update
            res = await fetch(`${API_BASE}/products/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });
        } else {
            // POST: Create
            res = await fetch(`${API_BASE}/products`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });
        }

        const data = await res.json();
        if (res.ok || data.success) {
            alert(id ? 'Cập nhật thành công!' : 'Thêm sản phẩm thành công!');
            closeProductModal();
            fetchProducts(); // Tải lại bảng
        } else {
            alert('Lỗi: ' + (data.message || 'Không thể lưu sản phẩm.'));
        }
    } catch (err) {
        console.error("Submit product err:", err);
        alert('Lỗi kết nối máy chủ!');
    } finally {
        btn.innerHTML = oriText;
        btn.disabled = false;
    }
}

// Xử lý Xóa
async function deleteProduct(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này không? Hành động không thể hoàn tác!')) return;

    try {
        const res = await fetch(`${API_BASE}/products/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (res.ok) {
            alert('Đã xóa thành công!');
            fetchProducts();
        } else {
            const row = await res.json();
            alert('Không thể xóa: ' + (row.message || 'Lỗi server'));
        }
    } catch (err) {
        console.error("Delete err:", err);
        alert('Lỗi kết nối đến máy chủ!');
    }
}


// ================== QUẢN LÝ ĐƠN HÀNG (READ-ONLY) ================== //

async function fetchOrders() {
    const tbody = document.getElementById('ordersTableBody');
    tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-gray-500"><i class="fas fa-spinner fa-spin mr-2"></i>Đang tải dữ liệu đơn hàng...</td></tr>`;

    try {
        const response = await fetch(`${API_BASE}/orders`, {
            headers: getAuthHeaders()
        });

        let data = await response.json();
        // Có thể backend trả về format {success: true, orders: [...]} hoặc [...]
        orders = Array.isArray(data) ? data : (data.orders || []);
        renderOrders();
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-red-500">Lỗi kết nối máy chủ hoặc chưa được cấp quyền!</td></tr>`;
        console.error("Fetch orders error", err);
    }
}

function renderOrders() {
    const tbody = document.getElementById('ordersTableBody');
    tbody.innerHTML = '';

    if (orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-gray-500">Chưa có đơn hàng nào trong hệ thống.</td></tr>`;
        return;
    }

    orders.forEach((o) => {
        // Lấy mã đơn, mặc định xài orderCode mới, nếu không có cắt từ _id
        const code = o.orderCode || (o._id ? o._id.substring(o._id.length - 8).toUpperCase() : 'UNKNOWN');

        let customer = o.buyerName || 'Khách viếng thăm';
        if (o.user) {
            if (typeof o.user === 'object' && o.user.name) customer = o.user.name;
            else if (typeof o.user === 'string' && !o.buyerName) customer = o.user;
        }

        const itemsCount = o.orderItems ? o.orderItems.length : 0;
        const total = o.totalPrice ? o.totalPrice.toLocaleString('vi-VN') + ' đ' : '0 đ';

        const date = o.createdAt ? new Date(o.createdAt).toLocaleDateString('vi-VN') : 'N/A';

        const stt = o.status || 'Chờ xử lý';
        const statusOptions = ['Chờ xử lý', 'Đang giao', 'Đã giao', 'Đã hủy']
            .map(opt => `<option value="${opt}" ${opt === stt ? 'selected' : ''}>${opt}</option>`)
            .join('');

        tbody.innerHTML += `
            <tr class="hover:bg-gray-50/50 transition">
                <td class="p-4 font-mono text-gray-500">#${code}</td>
                <td class="p-4 font-medium text-gray-800">${customer}</td>
                <td class="p-4 text-gray-600">${itemsCount} món</td>
                <td class="p-4 font-bold text-blue-600">${total}</td>
                <td class="p-4 text-gray-500">${date}</td>
                <td class="p-4">
                    <select onchange="changeOrderStatus('${o._id}', this.value)" class="border rounded px-2 py-1 outline-none focus:ring-2 focus:ring-blue-400 bg-white cursor-pointer text-sm font-semibold text-gray-700 w-full max-w-[130px]">
                        ${statusOptions}
                    </select>
                </td>
                <td class="p-4 text-center">
                    <button onclick="viewOrderDetail('${o._id}')" class="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition flex items-center justify-center mx-auto" title="Xem chi tiết">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}

function viewOrderDetail(id) {
    const o = orders.find(order => String(order._id) === String(id));
    if (!o) return;

    const code = o.orderCode || (o._id ? o._id.substring(o._id.length - 8).toUpperCase() : 'UNKNOWN');
    document.getElementById('viewOrderCode').textContent = `#${code}`;
    document.getElementById('viewBuyerName').textContent = o.buyerName || 'Khách viếng thăm';
    document.getElementById('viewBuyerPhone').textContent = o.buyerPhone || 'Chưa cập nhật';
    document.getElementById('viewBuyerAddress').textContent = o.buyerAddress || 'Chưa cập nhật';

    const itemsTbody = document.getElementById('viewOrderItemsList');
    itemsTbody.innerHTML = '';

    if (o.orderItems && o.orderItems.length > 0) {
        o.orderItems.forEach(item => {
            const price = Number(item.price) || 0;
            const qty = Number(item.quantity) || 0;
            const sub = price * qty;

            itemsTbody.innerHTML += `
                <tr class="hover:bg-gray-50/50">
                    <td class="p-3">
                        <div class="flex items-center gap-3">
                            <img src="${item.image || 'https://via.placeholder.com/40'}" class="w-10 h-10 object-cover rounded border">
                            <span class="font-medium text-gray-700">${item.name}</span>
                        </div>
                    </td>
                    <td class="p-3 text-center text-gray-600">${item.size || '-'}</td>
                    <td class="p-3 text-center text-gray-600">${qty}</td>
                    <td class="p-3 text-right text-gray-600">${price.toLocaleString('vi-VN')} đ</td>
                    <td class="p-3 text-right font-semibold text-gray-800">${sub.toLocaleString('vi-VN')} đ</td>
                </tr>
            `;
        });
    } else {
        itemsTbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-gray-500">Không có dữ liệu sản phẩm</td></tr>`;
    }

    document.getElementById('viewSubtotal').textContent = (o.itemsSubtotal || 0).toLocaleString('vi-VN') + ' đ';
    document.getElementById('viewShippingFee').textContent = (o.shippingFee || 0).toLocaleString('vi-VN') + ' đ';
    document.getElementById('viewTotalPrice').textContent = (o.totalPrice || 0).toLocaleString('vi-VN') + ' đ';

    document.getElementById('orderDetailModal').classList.remove('hidden');
    document.getElementById('orderDetailModal').classList.add('flex');
}

function closeOrderDetailModal() {
    document.getElementById('orderDetailModal').classList.add('hidden');
    document.getElementById('orderDetailModal').classList.remove('flex');
}

async function changeOrderStatus(orderId, newStatus) {
    try {
        const res = await fetch(`${API_BASE}/orders/${orderId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status: newStatus })
        });
        const data = await res.json();
        if (res.ok) {
            // alert('Đã cập nhật trạng thái đơn hàng!');
            // Không cần alert hoặc fetch lại nguyên băng để tránh nhảy trang khó chịu, UI select đã tự update item.
        } else {
            alert('Lỗi cập nhật: ' + (data.message || 'Lỗi hệ thống'));
            fetchOrders(); // Reset data
        }
    } catch (err) {
        console.error('Update status err:', err);
        alert('Lỗi kết nối máy chủ!');
        fetchOrders(); // Reset data
    }
}

// ================== QUẢN LÝ KHÁCH HÀNG (READ-ONLY) ================== //

async function fetchUsers() {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-gray-500"><i class="fas fa-spinner fa-spin mr-2"></i>Đang tải dữ liệu khách hàng...</td></tr>`;

    try {
        const response = await fetch(`${API_BASE}/auth/users`, {
            headers: getAuthHeaders()
        });

        const data = await response.json();
        users = Array.isArray(data) ? data : [];
        renderUsers();
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-red-500">Lỗi kết nối máy chủ!</td></tr>`;
        console.error("Fetch users error", err);
    }
}

function renderUsers() {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';

    if (users.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-gray-500">Chưa có khách hàng nào đăng ký.</td></tr>`;
        return;
    }

    users.forEach((u, index) => {
        const role = u.isAdmin ? 'Quản trị viên' : 'Khách hàng';
        const roleClass = u.isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600';
        const date = u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : 'Mới đây';

        tbody.innerHTML += `
            <tr class="hover:bg-gray-50/50 transition">
                <td class="p-4 text-gray-500 text-center">${index + 1}</td>
                <td class="p-4 font-medium text-gray-800">${u.name || 'Người dùng ẩn danh'}</td>
                <td class="p-4 text-gray-600">${u.email || 'N/A'}</td>
                <td class="p-4">
                    <span class="px-3 py-1 ${roleClass} rounded-full text-xs font-semibold">${role}</span>
                </td>
                <td class="p-4 text-gray-500">${date}</td>
                <td class="p-4 text-center">
                    ${!u.isAdmin ? `
                    <div class="flex items-center justify-center gap-2">
                        <button onclick="deleteUser('${u._id}')" class="w-8 h-8 rounded-lg bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition flex items-center justify-center" title="Xóa">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>` : ''}
                </td>
            </tr>
        `;
    });
}

// Mở Modal Thêm User
function openUserModal() {
    document.getElementById('userForm').reset();
    document.getElementById('userModal').classList.remove('hidden');
    document.getElementById('userModal').classList.add('flex');
}

function closeUserModal() {
    document.getElementById('userModal').classList.add('hidden');
    document.getElementById('userModal').classList.remove('flex');
}

// Xử lý Submit Form User (Create)
async function handleUserSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('btnSubmitUser');
    const oriText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Đang lưu...';
    btn.disabled = true;

    const payload = {
        name: document.getElementById('uName').value,
        email: document.getElementById('uEmail').value,
        password: document.getElementById('uPassword').value,
        isAdmin: document.getElementById('uIsAdmin').checked
    };

    try {
        const res = await fetch(`${API_BASE}/auth/users`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (res.ok || data.success) {
            alert('Thêm khách hàng thành công!');
            closeUserModal();
            fetchUsers();
        } else {
            alert('Lỗi: ' + (data.message || 'Không thể tạo tài khoản.'));
        }
    } catch (err) {
        console.error("Submit user err:", err);
        alert('Lỗi kết nối máy chủ!');
    } finally {
        btn.innerHTML = oriText;
        btn.disabled = false;
    }
}

// Xử lý Xóa User
async function deleteUser(id) {
    if (!confirm('Hành động này sẽ Xóa cả tài khoản và TOÀN BỘ Đơn hàng của khách hàng này.\nBạn có chắc chắn muốn xóa không?')) return;

    try {
        const res = await fetch(`${API_BASE}/auth/users/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (res.ok) {
            alert('Đã xóa thành công!');
            fetchUsers();
            loadDashboardStats(); // Cập nhật lại số liệu nếu xoá đơn hàng
        } else {
            const row = await res.json();
            alert('Không thể xóa: ' + (row.message || 'Lỗi server'));
        }
    } catch (err) {
        console.error("Delete user err:", err);
        alert('Lỗi kết nối đến máy chủ!');
    }
}

