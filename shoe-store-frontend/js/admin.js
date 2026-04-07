/**
 * admin.js - Script xử lý logic riêng cho trang Dashboard Admin
 */

const API_BASE = 'http://localhost:8000/api';
// Kiểm tra quyền truy cập ngay khi load script
checkAdminAuth();

let products = [];
let orders = [];
let users = [];

document.addEventListener('DOMContentLoaded', () => {
    // Render Admin Info
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (user) {
        document.getElementById('adminName').textContent = user.name || user.fullname || 'Admin';
        document.getElementById('adminAvatar').textContent = ((user.name || user.fullname)?.charAt(0) || 'A').toUpperCase();
    }

    // Gắn sự kiện submit form Product
    document.getElementById('productForm').addEventListener('submit', handleProductSubmit);

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
        // Tạm thời gọi API lấy danh sách để đếm số lượng do không có API thống kê riêng
        const resP = await fetch(`${API_BASE}/products`);
        if (resP.ok) {
            const dataP = await resP.json();
            document.getElementById('stat-products').textContent = dataP.length || 0;
        }

        const resO = await fetch(`${API_BASE}/orders`, { headers: getAuthHeaders() });
        if (resO.ok) {
            const dataO = await resO.json();
            document.getElementById('stat-orders').textContent = dataO.length || 0;
        }
        
        // Tải số lượng khách hàng
        const resU = await fetch(`${API_BASE}/auth/users`);
        if (resU.ok) {
            const dataU = await resU.json();
            document.getElementById('stat-users').textContent = dataU.length || 0;
        }

    } catch (err) {
        console.error("Lỗi khi load thống kê:", err);
    }
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

function renderProducts() {
    const tbody = document.getElementById('productsTableBody');
    tbody.innerHTML = '';

    if (products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-gray-500">Chưa có sản phẩm nào trong kho.</td></tr>`;
        return;
    }

    products.forEach((p, index) => {
        const priceFmt = p.price ? p.price.toLocaleString('vi-VN') + ' đ' : 'Liên hệ';
        const img = p.image || 'https://via.placeholder.com/50';
        
        tbody.innerHTML += `
            <tr class="hover:bg-gray-50/50 transition">
                <td class="p-4 text-gray-500">#${index+1}</td>
                <td class="p-4">
                    <div class="flex items-center gap-3">
                        <img src="${img}" alt="${p.name}" class="w-12 h-12 object-cover rounded-lg border">
                        <span class="font-medium text-gray-800">${p.name}</span>
                    </div>
                </td>
                <td class="p-4 font-semibold text-blue-600">${priceFmt}</td>
                <td class="p-4"><span class="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">${p.category || 'Khác'}</span></td>
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
}

// Mở Modal Thêm/Sửa
function openProductModal() {
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('modalTitle').textContent = 'Thêm Sản Phẩm Mới';
    document.getElementById('productModal').classList.remove('hidden');
    document.getElementById('productModal').classList.add('flex');
}

function closeProductModal() {
    document.getElementById('productModal').classList.add('hidden');
    document.getElementById('productModal').classList.remove('flex');
}

// Đẩy dữ liệu vào Modal để Sửa
function editProduct(id) {
    const p = products.find(prod => String(prod._id) === String(id));
    if (!p) return;

    document.getElementById('productId').value = p._id;
    document.getElementById('pName').value = p.name || '';
    document.getElementById('pPrice').value = p.price || '';
    document.getElementById('pCategory').value = p.category || 'Nike';
    document.getElementById('pImage').value = p.image || '';
    document.getElementById('pDescription').value = p.description || '';

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
    
    // Gán dữ liệu payload
    const payload = {
        name: document.getElementById('pName').value,
        price: Number(document.getElementById('pPrice').value),
        category: document.getElementById('pCategory').value,
        image: document.getElementById('pImage').value,
        description: document.getElementById('pDescription').value
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
        tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-red-500">Lỗi kết nối máy chủ hoặc chưa được cấp quyền!</td></tr>`;
        console.error("Fetch orders error", err);
    }
}

function renderOrders() {
    const tbody = document.getElementById('ordersTableBody');
    tbody.innerHTML = '';

    if (orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-gray-500">Chưa có đơn hàng nào trong hệ thống.</td></tr>`;
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
        // Remove style span, make it a select
        const statusOptions = ['Chờ xử lý', 'Đang giao', 'Đã giao', 'Đã huỷ']
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
            </tr>
        `;
    });
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
            </tr>
        `;
    });
}
