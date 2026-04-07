// src/js/auth.js - Frontend Authentication Handler

const API_BASE_URL = 'http://localhost:8000/api/auth';

// ================== SIGNUP ==================
async function handleSignup(event) {
  event.preventDefault();

  const fullname = document.querySelector('input[placeholder="Nhập tên của bạn"]').value;
  const email = document.querySelector('input[type="email"]').value;
  const password = document.querySelectorAll('input[type="password"]')[0].value;
  const confirmPassword = document.querySelectorAll('input[type="password"]')[1].value;

  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: fullname,
        email,
        password,
        confirmPassword
      })
    });

    const data = await response.json();

    if (response.ok) {
      // Lưu token vào sessionStorage (tự xóa khi đóng trình duyệt)
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('user', JSON.stringify(data));

      alert('Đăng ký thành công!');
      window.location.href = 'home.html';
    } else {
      alert('Đăng ký thất bại: ' + (data.errors?.[0] || data.message));
    }
  } catch (error) {
    alert('Lỗi kết nối: ' + error.message);
  }
}

// ================== LOGIN ==================
async function handleLogin(event) {
  event.preventDefault();

  const email = document.querySelector('input[type="email"]').value;
  const password = document.querySelector('input[type="password"]').value;

  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    const data = await response.json();

    if (response.ok) {
      // Lưu token vào sessionStorage (tự xóa khi đóng trình duyệt)
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('user', JSON.stringify(data));

      alert('Đăng nhập thành công!');
      window.location.href = 'home.html';
    } else {
      alert('Đăng nhập thất bại: ' + data.message);
    }
  } catch (error) {
    alert('Lỗi kết nối: ' + error.message);
  }
}

// ================== GET TOKEN ==================
function getToken() {
  return sessionStorage.getItem('token');
}

// ================== GET USER ==================
function getUser() {
  const user = sessionStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

// ================== LOGOUT ==================
async function handleLogout() {
  const token = getToken();

  if (!token) {
    sessionStorage.removeItem('user');
    window.location.href = 'home.html';
    return;
  }

  try {
    await fetch(`${API_BASE_URL}/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error('Logout error:', error);
  }

  // Clear session storage
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
  window.location.href = 'home.html';
}

// ================== CHECK IF LOGGED IN ==================
function isLoggedIn() {
  return !!getToken();
}

// ================== UPDATE HEADER BASED ON LOGIN STATE ==================
function updateUserMenu() {
  const userMenu = document.getElementById('userMenu');

  if (userMenu && isLoggedIn()) {
    const user = getUser();
    const displayName = user.name || user.fullname || 'Người dùng';
    
    // Nếu là admin, hiển thị thêm link tới trang quản trị
    const adminLink = (user.role === 'admin' || user.isAdmin === true) 
      ? `<a href="admin.html" class="block px-4 py-2 text-blue-600 font-bold hover:bg-gray-100">🚀 Trang Quản Trị</a>` 
      : '';

    userMenu.innerHTML = `
      <a href="profile.html" class="block px-4 py-2 hover:bg-gray-100">👤 ${displayName}</a>
      ${adminLink}
      <a href="javascript:handleLogout()" class="block px-4 py-2 text-red-600 hover:bg-gray-100">🚪 Đăng xuất</a>
    `;
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', updateUserMenu);

// ================== ATTACH FORM HANDLERS ==================
// For signup.html
const signupForm = document.querySelector('form');
if (signupForm && window.location.pathname.includes('signup.html')) {
  signupForm.addEventListener('submit', handleSignup);
}

// For login.html
const loginForm = document.querySelector('form');
if (loginForm && window.location.pathname.includes('login.html')) {
  loginForm.addEventListener('submit', handleLogin);
}

// ================== CHAT WIDGET INJECTION ==================
function injectChatWidget() {
  const currentPath = window.location.pathname;
  if (currentPath.includes('login.html') || currentPath.includes('signup.html')) {
    return;
  }

  // Pre-check if already injected
  if (document.getElementById('chatbox')) return;

  const chatContainer = document.createElement('div');
  chatContainer.innerHTML = `
    <!-- Chatbot Button -->
    <div class="fixed bottom-5 right-5 z-[100]">
      <button onclick="toggleChat()" class="bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 hover:bg-blue-700 transition">
        <i class="fa-solid fa-comment-dots"></i> Chat
      </button>
    </div>

    <!-- Chatbox -->
    <div id="chatbox" class="hidden fixed bottom-20 right-5 w-80 bg-white rounded-xl shadow-2xl flex flex-col chatbox z-[100] border border-gray-200">
      <div class="bg-blue-600 text-white p-3 rounded-t-xl flex justify-between items-center">
        <span class="font-bold flex items-center gap-2"><i class="fa-solid fa-robot"></i> Trợ lý MyShoes</span>
        <button onclick="toggleChat()" class="hover:text-gray-200 text-lg">&times;</button>
      </div>

      <div id="messages" class="p-4 h-72 overflow-y-auto text-sm scrollbar bg-gray-50 flex flex-col gap-3">
         <div class='text-left text-gray-800 bg-white border p-2 rounded-lg rounded-tl-none self-start shadow-sm'>
            Bot: Xin chào! Tôi có thể giúp gì cho bạn?
         </div>
      </div>

      <div class="flex border-t bg-white p-2 rounded-b-xl">
        <input id="chatInput" type="text" placeholder="Nhập tin nhắn..." class="flex-1 p-2 outline-none border rounded-l-lg bg-gray-50" onkeypress="handleChatKeyPress(event)">
        <button onclick="sendMessage()" class="bg-blue-600 text-white px-4 rounded-r-lg hover:bg-blue-700 transition"><i class="fa-solid fa-paper-plane"></i></button>
      </div>
    </div>
  `;
  document.body.appendChild(chatContainer);
}

window.toggleChat = function () {
  const chatbox = document.getElementById('chatbox');
  if (chatbox) chatbox.classList.toggle('hidden');
}

window.sendMessage = function () {
  const input = document.getElementById('chatInput');
  const messages = document.getElementById('messages');

  if (!input || !messages || input.value.trim() === '') return;

  messages.innerHTML += `
    <div class='text-right text-white bg-blue-600 p-2 rounded-lg rounded-tr-none self-end shadow-sm'>
      Bạn: ${input.value}
    </div>
  `;
  messages.innerHTML += `
    <div class='text-left text-gray-800 bg-white border p-2 rounded-lg rounded-tl-none self-start shadow-sm mt-1'>
      Bot: Xin lỗi, tôi chỉ là chatbot được thiết lập sẵn. Vui lòng liên hệ hotline để được hỗ trợ tốt nhất!
    </div>
  `;

  input.value = '';
  messages.scrollTo({ top: messages.scrollHeight, behavior: 'smooth' });
}

window.handleChatKeyPress = function (event) {
  if (event.key === 'Enter') {
    window.sendMessage();
  }
}

// Inject chat when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectChatWidget);
} else {
  injectChatWidget();
}
