/**
 * shipper.js - Script xử lý logic cho trang Cổng Thông Tin Shipper
 */

const ORDER_API_URL = `${API_BASE}/orders`;

// Kênh giao tiếp với tab Admin (cùng origin)
const adminSyncChannel = new BroadcastChannel('shoe_store_sync');

let allOrders = [];
let currentTypeFilter = 'all';
let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search || '');
    const isSimulate = urlParams.get('simulate') === '1';

    // Check login
    const user = typeof authUtils !== 'undefined' ? authUtils.getUser() : JSON.parse(sessionStorage.getItem('user'));
    const isAdmin = Boolean(user && (user.role === 'admin' || user.isAdmin === true));
    const canAccess = Boolean(user && (user.role === 'shipper' || (isSimulate && isAdmin)));

    if (!canAccess) {
        alert('Vui lòng đăng nhập với tài khoản Shipper để tiếp tục.');
        window.location.href = 'login.html';
        return;
    }
    currentUser = user;
    
    // Update header info
    const userNameEl = document.getElementById('userName');
    if (userNameEl) userNameEl.textContent = user.name || user.email || 'Shipper';

    const userRoleEl = document.getElementById('userRole');
    if (userRoleEl) userRoleEl.textContent = user.assignedBrand ? `Shipper - ${user.assignedBrand}` : 'Đối tác giao hàng';

    const shipperBrandEl = document.getElementById('shipperBrand');
    const assignedType = getTypeKeyFromText(user.assignedBrand);
    if (assignedType) currentTypeFilter = assignedType;
    if (shipperBrandEl) {
        shipperBrandEl.textContent = assignedType ? `Loại hàng: ${typeKeyToLabel(assignedType)}` : 'Quản lí đơn hàng';
    }

    // Sync UI filter buttons (if present)
    setActiveTypeButton(currentTypeFilter);

    fetchOrders();
});

async function fetchOrders() {
    const container = document.getElementById('ordersContainer');
    if (!container) return;

    try {
        const response = await fetch(ORDER_API_URL);
        if (!response.ok) throw new Error('Không thể tải dữ liệu đơn hàng');

        const data = await response.json();
        const rawOrders = Array.isArray(data) ? data : (data.orders || []);
        allOrders = rawOrders;
        
        updateStats();
        renderOrders();
    } catch (error) {
        console.error('Fetch orders error:', error);
        container.innerHTML = `
            <div class="col-span-full py-20 text-center">
                <i class="fa-solid fa-triangle-exclamation text-4xl text-red-500 mb-4"></i>
                <p class="text-red-600 font-medium">Lỗi: ${error.message}</p>
                <button onclick="fetchOrders()" class="mt-4 text-blue-600 underline">Thử lại</button>
            </div>
        `;
    }
}

function normalizeText(value) {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function typeKeyToLabel(typeKey) {
    if (typeKey === 'sport') return 'Bóng đá';
    if (typeKey === 'running') return 'Chạy bộ';
    if (typeKey === 'casual') return 'Casual';
    return 'Khác';
}

function getTypeKeyFromText(text) {
    const t = normalizeText(text);
    if (!t) return null;
    if (t.includes('bong da') || t.includes('sport')) return 'sport';
    if (t.includes('chay bo') || t.includes('running') || t.includes('run')) return 'running';
    if (t.includes('casual')) return 'casual';
    return null;
}

function classifyItemType(item) {
    const categoryKey = getTypeKeyFromText(item?.category);
    if (categoryKey) return categoryKey;

    const name = normalizeText(item?.name);
    if (!name) return 'other';

    const sportKeywords = [
        'bong da', 'tf', 'fg', 'ag', 'academy', 'predator', 'f50', 'phantom', 'mercurial', 'alpha',
        'morelia', 'gate sky', 'club'
    ];
    if (sportKeywords.some(k => name.includes(k))) return 'sport';

    const runningKeywords = [
        'chay bo', 'running', 'run', 'nitro', 'pureboost', 'galaxy', 'duramo', 'ultrarun', 'performance',
        'speed', 'deviate', 'velocity', 'darter', 'reflect', 'fast', 'vomero', 'quest', 'downshifter',
        'revolution', 'invincible', 'metcon', 'wave mujin'
    ];
    if (runningKeywords.some(k => name.includes(k))) return 'running';

    if (name.includes('casual')) return 'casual';
    return 'casual';
}

function getOrderTypeKeys(order) {
    if (order && Array.isArray(order.__typeKeys)) return order.__typeKeys;

    const keys = new Set();
    (order?.orderItems || []).forEach(item => {
        keys.add(classifyItemType(item));
    });

    const result = keys.size ? Array.from(keys) : ['other'];
    if (order) order.__typeKeys = result;
    return result;
}

function getOrderTypeLabel(order) {
    const keys = getOrderTypeKeys(order);
    if (keys.length === 1) return typeKeyToLabel(keys[0]);
    return 'Nhiều loại';
}

function setActiveTypeButton(typeKey) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        const btnKey = btn.getAttribute('data-type');
        const isActive = btnKey === typeKey || (typeKey === 'all' && btnKey === 'all');

        btn.classList.remove('active', 'bg-blue-600', 'text-white');
        btn.classList.add('bg-white', 'text-gray-600');

        if (isActive) {
            btn.classList.add('active', 'bg-blue-600', 'text-white');
            btn.classList.remove('bg-white', 'text-gray-600');
        }
    });
}

function filterByType(typeKey) {
    currentTypeFilter = typeKey || 'all';
    setActiveTypeButton(currentTypeFilter);
    renderOrders();
}

function updateStats() {
    const setStat = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    };

    setStat('stat-total', allOrders.length);
    setStat('stat-processing', allOrders.filter(o => o.status === 'Chờ xử lý').length);
    setStat('stat-shipping', allOrders.filter(o => o.status === 'Đang giao' || o.status === 'Đang giao hàng').length);
    setStat('stat-delivered', allOrders.filter(o => o.status === 'Đã giao' || o.status === 'Đã hoàn thành').length);
}

function getStatusClass(status) {
    const s = status?.toLowerCase() || '';
    if (s.includes('cho xu ly')) return 'status-processing';
    if (s.includes('dang giao')) return 'status-shipping';
    if (s.includes('da giao') || s.includes('hoan thanh')) return 'status-delivered';
    if (s.includes('da huy')) return 'status-cancelled';
    return '';
}

function getBadgeClass(status) {
    const s = status?.toLowerCase() || '';
    if (s.includes('cho xu ly')) return 'badge-processing';
    if (s.includes('dang giao')) return 'badge-shipping';
    if (s.includes('da giao') || s.includes('hoan thanh')) return 'badge-delivered';
    if (s.includes('da huy')) return 'badge-cancelled';
    return 'bg-gray-100 text-gray-600';
}

function renderOrders() {
    const container = document.getElementById('ordersContainer');
    if (!container) return;

    let filtered = allOrders;
    if (currentTypeFilter !== 'all') {
        filtered = allOrders.filter(o => getOrderTypeKeys(o).includes(currentTypeFilter));
    }

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="col-span-full py-20 text-center">
                <i class="fa-solid fa-box-open text-4xl text-gray-300 mb-4"></i>
                <p class="text-gray-700 font-bold">Chưa có đơn hàng phù hợp.</p>
                <p class="text-gray-500 mt-2">Hãy tạo đơn từ trang thanh toán (checkout) rồi quay lại trang này.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(order => {
        const code = order.orderCode || (order._id ? order._id.substring(order._id.length - 8).toUpperCase() : 'UNKNOWN');
        const date = order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : '---';
        const total = (order.totalPrice || 0).toLocaleString('vi-VN') + ' đ';
        const typeLabel = getOrderTypeLabel(order);
        
        return `
            <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 shipper-card ${getStatusClass(order.status)}">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h4 class="font-bold text-gray-900 text-lg">#${code}</h4>
                        <p class="text-xs text-gray-400">${date}</p>
                        <p class="text-xs text-gray-400 mt-1">Loại hàng: <span class="font-bold text-gray-700">${typeLabel}</span></p>
                    </div>
                    <span class="status-badge ${getBadgeClass(order.status)}">${order.status || 'Chờ xử lý'}</span>
                </div>
                
                <div class="space-y-3 mb-6">
                    <div class="flex items-center gap-3 text-sm text-gray-600">
                        <i class="fa-solid fa-user w-4 text-gray-400"></i>
                        <span class="font-medium">${order.buyerName || 'Khách'}</span>
                    </div>
                    <div class="flex items-center gap-3 text-sm text-gray-600">
                        <i class="fa-solid fa-phone w-4 text-gray-400"></i>
                        <span>${order.buyerPhone || '---'}</span>
                    </div>
                    <div class="flex items-start gap-3 text-sm text-gray-600">
                        <i class="fa-solid fa-location-dot w-4 mt-1 text-gray-400"></i>
                        <span class="line-clamp-2">${order.buyerAddress || '---'}</span>
                    </div>
                </div>

                <div class="flex justify-between items-center pt-4 border-t border-gray-50">
                    <span class="font-bold text-blue-600">${total}</span>
                    <div class="flex gap-2">
                        <button onclick="viewDetail('${order._id}')" class="p-2 text-gray-400 hover:text-blue-600 transition" title="Chi tiết">
                            <i class="fa-solid fa-eye"></i>
                        </button>
                        <select onchange="updateStatus('${order._id}', this.value)" class="text-xs font-bold border rounded-lg px-2 py-1 bg-gray-50 cursor-pointer focus:ring-2 focus:ring-blue-400 outline-none">
                            <option value="">Cập nhật</option>
                            <option value="Chờ xử lý">Chờ xử lý</option>
                            <option value="Đang giao">Đang giao</option>
                            <option value="Đã giao">Đã giao</option>
                            <option value="Đã hủy">Đã hủy</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

async function updateStatus(orderId, newStatus) {
    if (!newStatus) return;

    // Tìm select element đang được thao tác để disable trong lúc chờ
    const allSelects = document.querySelectorAll(`select[onchange*="${orderId}"]`);
    allSelects.forEach(s => { s.disabled = true; s.style.opacity = '0.5'; });

    try {
        const response = await fetch(`${ORDER_API_URL}/${orderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || `Lỗi server: ${response.status}`);
        }

        const updatedOrder = await response.json();
        
        // Cập nhật mảng local
        const index = allOrders.findIndex(o => String(o._id) === String(orderId));
        if (index !== -1) {
            allOrders[index] = updatedOrder;
        }

        updateStats();

        // Cập nhật badge trực tiếp trên DOM (không re-render toàn trang)
        const card = allSelects[0]?.closest('.shipper-card');
        if (card) {
            // Cập nhật badge status
            const badge = card.querySelector('.status-badge');
            if (badge) {
                badge.className = `status-badge ${getBadgeClass(newStatus)}`;
                badge.textContent = newStatus;
            }
            // Cập nhật class card
            card.className = `bg-white rounded-2xl p-6 shadow-sm border border-gray-100 shipper-card ${getStatusClass(newStatus)}`;
        }

        // Nếu modal đang mở, cập nhật luôn
        if (!document.getElementById('orderModal').classList.contains('hidden')) {
            viewDetail(orderId);
        }

        // Toast thành công
        showShipperToast(`✅ Đã cập nhật: ${newStatus}`, 'success');

        // Thông báo sang tab Admin nếu đang mở
        adminSyncChannel.postMessage({
            type: 'ORDER_STATUS_UPDATED',
            orderId,
            status: newStatus
        });
    } catch (error) {
        console.error('Update status error:', error);
        showShipperToast(`❌ ${error.message}`, 'error');
    } finally {
        // Re-enable select
        allSelects.forEach(s => { s.disabled = false; s.style.opacity = '1'; });
    }
}

function showShipperToast(message, type = 'success') {
    const existing = document.getElementById('shipperToast');
    if (existing) existing.remove();

    const colors = { success: '#16a34a', error: '#dc2626', info: '#2563eb' };
    const toast = document.createElement('div');
    toast.id = 'shipperToast';
    toast.style.cssText = `
        position: fixed; bottom: 24px; right: 24px; z-index: 9999;
        background: ${colors[type] || colors.success}; color: white;
        padding: 12px 20px; border-radius: 12px; font-size: 14px; font-weight: 600;
        box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        transform: translateY(20px); opacity: 0;
        transition: all 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
    });
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function viewDetail(id) {
    const order = allOrders.find(o => o._id === id);
    if (!order) return;

    const modal = document.getElementById('orderModal');
    const code = order.orderCode || (order._id ? order._id.substring(order._id.length - 8).toUpperCase() : 'UNKNOWN');
    
    document.getElementById('modalOrderCode').textContent = `Chi tiết đơn hàng #${code}`;
    
    const itemsHtml = (order.orderItems || []).map(item => `
        <div class="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
            <img src="${item.image || 'https://via.placeholder.com/60'}" class="w-16 h-16 object-cover rounded-xl border border-gray-100 shadow-sm">
            <div class="flex-1">
                <p class="font-bold text-gray-800 text-sm">${item.name}</p>
                <div class="flex gap-4 mt-1">
                    <span class="text-xs text-gray-500">Size: <span class="font-bold text-gray-700">${item.size || '-'}</span></span>
                    <span class="text-xs text-gray-500">SL: <span class="font-bold text-gray-700">${item.quantity}</span></span>
                </div>
            </div>
            <p class="font-bold text-blue-600 text-sm">${(item.price * item.quantity).toLocaleString('vi-VN')} đ</p>
        </div>
    `).join('');

    document.getElementById('modalBody').innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div class="bg-gray-50 p-4 rounded-2xl">
                <h5 class="text-xs uppercase font-bold text-gray-400 mb-3 tracking-wider">Thông tin giao hàng</h5>
                <p class="font-bold text-gray-800">${order.buyerName || '---'}</p>
                <p class="text-sm text-gray-600 mt-1">${order.buyerPhone || '---'}</p>
                <p class="text-sm text-gray-600 mt-2 leading-relaxed">${order.buyerAddress || '---'}</p>
            </div>
            <div class="bg-gray-50 p-4 rounded-2xl">
                <h5 class="text-xs uppercase font-bold text-gray-400 mb-3 tracking-wider">Thanh toán & Vận chuyển</h5>
                <div class="space-y-2">
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-500">PT Thanh toán:</span>
                        <span class="font-bold text-gray-700">${order.paymentMethod || 'COD'}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-500">PT Vận chuyển:</span>
                        <span class="font-bold text-gray-700">${order.shippingMethod || 'Tiêu chuẩn'}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-500">Trạng thái:</span>
                        <span class="status-badge ${getBadgeClass(order.status)}">${order.status || 'Chờ xử lý'}</span>
                    </div>
                </div>
            </div>
        </div>

        <div>
            <h5 class="text-xs uppercase font-bold text-gray-400 mb-4 tracking-wider">Danh sách sản phẩm</h5>
            <div class="bg-white border border-gray-100 rounded-2xl px-4">
                ${itemsHtml || '<p class="py-4 text-center text-gray-400 text-sm italic">Không có dữ liệu sản phẩm</p>'}
            </div>
        </div>

        <div class="mt-8 bg-blue-600 p-4 rounded-2xl flex justify-between items-center text-white">
            <div>
                <p class="text-xs opacity-70">Tổng tiền thanh toán</p>
                <p class="text-lg font-bold">Thanh toán khi nhận hàng</p>
            </div>
            <p class="text-2xl font-black">${(order.totalPrice || 0).toLocaleString('vi-VN')} đ</p>
        </div>
    `;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('orderModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

window.addEventListener('click', (e) => {
    if (e.target.id === 'orderModal') closeModal();
});

// ================== ĐỔI MẬT KHẨU ================== //

function openChangePasswordModal() {
    // Reset form
    document.getElementById('cpwCurrent').value = '';
    document.getElementById('cpwNew').value = '';
    document.getElementById('cpwConfirm').value = '';
    document.getElementById('cpwError').classList.add('hidden');

    const modal = document.getElementById('changePasswordModal');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeChangePasswordModal() {
    document.getElementById('changePasswordModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function toggleCpwVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    const icon = btn.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}

function showCpwError(message) {
    const box = document.getElementById('cpwError');
    document.getElementById('cpwErrorText').textContent = message;
    box.classList.remove('hidden');
}

async function submitChangePassword() {
    const currentPw  = document.getElementById('cpwCurrent').value.trim();
    const newPw      = document.getElementById('cpwNew').value.trim();
    const confirmPw  = document.getElementById('cpwConfirm').value.trim();

    document.getElementById('cpwError').classList.add('hidden');

    // Validate client-side
    if (!currentPw || !newPw || !confirmPw) {
        return showCpwError('Vui lòng điền đầy đủ tất cả các trường.');
    }
    if (newPw.length < 6) {
        return showCpwError('Mật khẩu mới phải có ít nhất 6 ký tự.');
    }
    if (newPw !== confirmPw) {
        return showCpwError('Xác nhận mật khẩu không khớp.');
    }
    if (newPw === currentPw) {
        return showCpwError('Mật khẩu mới phải khác mật khẩu hiện tại.');
    }

    const btn = document.getElementById('cpwSubmitBtn');
    const oriContent = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
    btn.disabled = true;

    try {
        const token = sessionStorage.getItem('token');
        const res = await fetch(`${API_BASE}/auth/change-password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw })
        });

        const data = await res.json();

        if (res.ok) {
            closeChangePasswordModal();
            showShipperToast('✅ Đổi mật khẩu thành công!', 'success');
        } else {
            showCpwError(data.message || 'Đổi mật khẩu thất bại. Vui lòng thử lại.');
        }
    } catch (err) {
        console.error('Change password error:', err);
        showCpwError('Lỗi kết nối máy chủ. Vui lòng thử lại.');
    } finally {
        btn.innerHTML = oriContent;
        btn.disabled = false;
    }
}
