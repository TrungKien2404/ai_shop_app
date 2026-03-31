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
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fullname,
        email,
        password,
        confirmPassword
      })
    });

    const data = await response.json();

    if (data.success) {
      // Lưu token
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
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

    if (data.success) {
      // Lưu token
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
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
  return localStorage.getItem('token');
}

// ================== GET USER ==================
function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

// ================== LOGOUT ==================
async function handleLogout() {
  const token = getToken();
  
  if (!token) {
    localStorage.removeItem('user');
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

  // Clear local storage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'home.html';
}

// ================== CHECK IF LOGGED IN ==================
function isLoggedIn() {
  return !!getToken();
}

// ================== UPDATE HEADER BASED ON LOGIN STATE ==================
function updateUserMenu() {
  const userMenu = document.getElementById('userMenu');
  
  if (isLoggedIn()) {
    const user = getUser();
    userMenu.innerHTML = `
      <a href="javascript:void(0)" class="block px-4 py-2 hover:bg-gray-100">👤 ${user.fullname}</a>
     
      <hr>
      <a href="javascript:handleLogout()" class="block px-4 py-2 hover:bg-gray-100">🚪 Đăng xuất</a>
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
