# Shoe Store Backend API

Backend cho ứng dụng Shoe Store bán giày trực tuyến. **Sử dụng SQLite** - không cần cài MongoDB.

## 📁 Cấu trúc thư mục

```
src/
├── controllers/       # Xử lý logic nghiệp vụ (authentication)
│   └── authController.js
├── routes/           # Định nghĩa API routes
│   └── authRoutes.js
├── models/           # Database operations
│   └── User.js
├── middleware/       # Middleware xác thực JWT
│   └── authMiddleware.js
├── config/           # Database configuration
│   └── database.js
├── utils/            # Hàm tiện ích (validation)
│   └── validator.js
└── index.js          # Server chính

db/
└── shoestore.db      # SQLite database (tạo tự động)
```

## 🚀 Cài đặt và chạy

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Tạo file `.env`
```bash
cp .env.example .env
```

Nội dung `.env`:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

### 3. Chạy server
```bash
# Development mode (với auto-reload)
npm run dev

# Production mode
npm start
```

Server sẽ chạy trên `http://localhost:5000`

Database SQLite sẽ được tạo tự động tại `db/shoestore.db`

## 📡 API Endpoints

### Authentication (Public Routes)

#### 1. Đăng ký - Sign Up
```
POST /api/auth/signup
Content-Type: application/json

Body:
{
  "fullname": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}

Response (201):
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "fullname": "John Doe",
    "email": "john@example.com"
  }
}
```

#### 2. Đăng nhập - Login
```
POST /api/auth/login
Content-Type: application/json

Body:
{
  "email": "john@example.com",
  "password": "password123"
}

Response (200):
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "fullname": "John Doe",
    "email": "john@example.com",
    "phone": null,
    "address": null
  }
}
```

### User Profile (Private Routes - Cần JWT Token)

#### 3. Lấy thông tin người dùng hiện tại
```
GET /api/auth/me
Authorization: Bearer <JWT_TOKEN>

Response (200):
{
  "success": true,
  "user": {
    "id": 1,
    "fullname": "John Doe",
    "email": "john@example.com",
    "phone": null,
    "address": null,
    "avatar": null,
    "createdAt": "2024-03-23 12:30:45",
    "updatedAt": "2024-03-23 12:30:45"
  }
}
```

#### 4. Cập nhật thông tin người dùng
```
PUT /api/auth/update
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Body:
{
  "fullname": "John Updated",
  "phone": "0123456789",
  "address": "123 Main St, City"
}

Response (200):
{
  "success": true,
  "message": "Profile updated successfully",
  "user": { ... }
}
```

#### 5. Đăng xuất - Logout
```
POST /api/auth/logout
Authorization: Bearer <JWT_TOKEN>

Response (200):
{
  "success": true,
  "message": "Logout successful"
}
```

## 🔒 Bảo mật

✅ Password được hash bằng bcryptjs  
✅ JWT authentication  
✅ Email validation  
✅ CORS cấu hình  
✅ SQLite database  
✅ Error handling hoàn chỉnh  

## 💾 Database Schema

**Users Table:**
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fullname TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  avatar TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

Database sẽ được tạo tự động khi server khởi động.

## 🤝 Tích hợp Frontend

### 1. Đăng ký
```javascript
const response = await fetch('http://localhost:5000/api/auth/signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fullname: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    confirmPassword: 'password123'
  })
});

const data = await response.json();
localStorage.setItem('token', data.token);
```

### 2. Đăng nhập
```javascript
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'password123'
  })
});

const data = await response.json();
localStorage.setItem('token', data.token);
```

### 3. Gửi request với JWT token
```javascript
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:5000/api/auth/me', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## 📝 Ghi chú

- SQLite database file sẽ được tạo tự động tại `db/shoestore.db`
- JWT secret cần được thay đổi trước khi deploy lên production
- Tất cả password được hash trước khi lưu vào database
- Token hết hạn sau 7 ngày (có thể cấu hình qua JWT_EXPIRE)

## 🧪 Test API

Sử dụng Postman hoặc cURL để test:

```bash
# Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```
