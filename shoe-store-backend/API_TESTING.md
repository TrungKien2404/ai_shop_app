# 🧪 Backend API Testing Guide

## Chuẩn bị

1. **Khởi động Backend:**
```bash
cd e:\Kien_HK2_Nam3\shoe-store-backend
npm install
npm run dev
```

Server sẽ chạy tại: `http://localhost:5000`

2. **Database:** SQLite database sẽ được tạo tự động tại `db/shoestore.db`

---

## 📝 Test API Endpoints

Bạn có thể dùng:
- **Postman** (GUI)
- **cURL** (Terminal)
- **Thunder Client** (VSCode Extension)
- **Browser DevTools Console**

---

## 1️⃣ ĐĂNG KÝ (Sign Up)

**Method:** `POST`  
**URL:** `http://localhost:5000/api/auth/signup`  
**Content-Type:** `application/json`

### Request Body:
```json
{
  "fullname": "Nguyễn Văn A",
  "email": "nguyenvana@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

### Sample cURL:
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "Nguyễn Văn A",
    "email": "nguyenvana@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

### Expected Response (201 Created):
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "fullname": "Nguyễn Văn A",
    "email": "nguyenvana@example.com"
  }
}
```

### Error Cases:
- **400** - Email đã tồn tại, password không match, validation error
- **500** - Server error

---

## 2️⃣ ĐĂNG NHẬP (Login)

**Method:** `POST`  
**URL:** `http://localhost:5000/api/auth/login`  
**Content-Type:** `application/json`

### Request Body:
```json
{
  "email": "nguyenvana@example.com",
  "password": "password123"
}
```

### Sample cURL:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nguyenvana@example.com",
    "password": "password123"
  }'
```

### Expected Response (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "fullname": "Nguyễn Văn A",
    "email": "nguyenvana@example.com",
    "phone": null,
    "address": null
  }
}
```

### ⚠️ Lưu Token:
Lấy token từ response và lưu nó để sử dụng trong các request tiếp theo:
```javascript
const token = response.data.token;
localStorage.setItem('token', token);
```

---

## 3️⃣ LẤY THÔNG TIN USER HIỆN TẠI (Get Me)

**Method:** `GET`  
**URL:** `http://localhost:5000/api/auth/me`  
**Authorization Header:** `Bearer <token>`  

### Request Headers:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Sample cURL:
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Expected Response (200 OK):
```json
{
  "success": true,
  "user": {
    "id": 1,
    "fullname": "Nguyễn Văn A",
    "email": "nguyenvana@example.com",
    "phone": null,
    "address": null,
    "avatar": null,
    "createdAt": "2024-03-23 15:30:45",
    "updatedAt": "2024-03-23 15:30:45"
  }
}
```

### Error Cases:
- **401** - Token không có hoặc invalid
- **404** - User không tìm thấy
- **500** - Server error

---

## 4️⃣ CẬP NHẬT THÔNG TIN USER (Update Profile)

**Method:** `PUT`  
**URL:** `http://localhost:5000/api/auth/update`  
**Authorization Header:** `Bearer <token>`  
**Content-Type:** `application/json`

### Request Body:
```json
{
  "fullname": "Nguyễn Văn A Updated",
  "phone": "0123456789",
  "address": "123 Đường ABC, Quận 1, TP.HCM"
}
```

### Sample cURL:
```bash
curl -X PUT http://localhost:5000/api/auth/update \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "Nguyễn Văn A Updated",
    "phone": "0123456789",
    "address": "123 Đường ABC, Quận 1, TP.HCM"
  }'
```

### Expected Response (200 OK):
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "fullname": "Nguyễn Văn A Updated",
    "email": "nguyenvana@example.com",
    "phone": "0123456789",
    "address": "123 Đường ABC, Quận 1, TP.HCM",
    "avatar": null,
    "createdAt": "2024-03-23 15:30:45",
    "updatedAt": "2024-03-23 15:35:22"
  }
}
```

---

## 5️⃣ ĐĂNG XUẤT (Logout)

**Method:** `POST`  
**URL:** `http://localhost:5000/api/auth/logout`  
**Authorization Header:** `Bearer <token>`  

### Sample cURL:
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Expected Response (200 OK):
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## 🔍 Kiểm tra Database

Database SQLite được lưu tại: `db/shoestore.db`

### Dùng SQLite Browser:
Bạn có thể download **DB Browser for SQLite** để xem dữ liệu:
- Download: https://sqlitebrowser.org/

### Hoặc dùng command line:
```bash
# Install sqlite3 globally (nếu chưa có)
npm install -g sqlite3

# Mở database
sqlite3 db/shoestore.db

# Xem tất cả users
SELECT * FROM users;

# Thoát
.quit
```

---

## 🔗 Kết nối Frontend

```javascript
// Hàm Signup
async function signup() {
  const response = await fetch('http://localhost:5000/api/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      fullname: 'Nguyễn Văn A',
      email: 'nguyenvana@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    })
  });
  
  const data = await response.json();
  if (data.success) {
    localStorage.setItem('token', data.token);
    console.log('Signup success:', data.user);
  }
}

// Hàm Login
async function login() {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'nguyenvana@example.com',
      password: 'password123'
    })
  });
  
  const data = await response.json();
  if (data.success) {
    localStorage.setItem('token', data.token);
    console.log('Login success:', data.user);
  }
}

// Hàm Get User Info
async function getUserInfo() {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5000/api/auth/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  if (data.success) {
    console.log('User info:', data.user);
  }
}
```

---

## ⚠️ Lỗi Thường Gặp

| Lỗi | Nguyên nhân | Cách fix |
|-----|-----------|---------|
| `CORS error` | Frontend và backend domain khác | Kiểm tra CORS config trong index.js |
| `401 Unauthorized` | Token hết hạn hoặc invalid | Đăng nhập lại để lấy token mới |
| `404 Not Found` | Route sai | Kiểm tra URL endpoint |
| `500 Internal Server Error` | Backend error | Kiểm tra console server |

---

## ✅ Checklist

- [ ] NPM dependencies đã install (`npm install`)
- [ ] `.env` file đã được tạo
- [ ] Server đã khởi động (`npm run dev`)
- [ ] Database file đã được tạo (`db/shoestore.db`)
- [ ] Có thể gọi `/api/auth/signup` thành công
- [ ] Có thể gọi `/api/auth/login` thành công
- [ ] Token được lưu đúng
- [ ] Có thể gọi protected routes với token

🎉 **Backend Ready!**
