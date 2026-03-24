# 🚀 Hướng dẫn Cài đặt Shoe Store - Frontend + Backend (FastAPI)

## 📋 Yêu cầu

### Backend (FastAPI)
- **Python** (v3.8+): https://www.python.org/
- **pip** (đi kèm với Python)

### Frontend
- **Browser**: Chrome, Firefox, Safari, Edge

---

## 🎯 Bước 1: Cài đặt Backend (FastAPI)

### 1.1 Di chuyển vào thư mục backend
```bash
cd e:\Kien_HK2_Nam3\ai_shop_app\shoe-store-backend
```

### 1.2 Cài đặt Python dependencies
```bash
pip install -r requirements.txt
```

**Kiểm tra Python:**
```bash
python --version
```

Nếu không nhận diện, thử `python3 --version`

### 1.3 Kiểm tra file `.env`
File `.env` đã được cấu hình sẵn. Nếu cần thay đổi:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=604800
DATABASE_URL=sqlite:///./db/shoestore.db
FRONTEND_URL=http://localhost:3000
```

### 1.4 Khởi động backend
```bash
python main.py
```

**Hoặc sử dụng uvicorn:**
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 5000
```

✅ **Backend chạy tại:** `http://localhost:5000`

**Output mong đợi:**
```
✅ Database initialized
🚀 Server running on port 5000
INFO:     Uvicorn running on http://0.0.0.0:5000
```

**API Documentation (Bonus):**
- Swagger UI: http://localhost:5000/docs
- ReDoc: http://localhost:5000/redoc

---

## 🎨 Bước 2: Cài đặt Frontend

Frontend là các file HTML tĩnh, bạn có 2 cách để chạy:

### Cách 1: Dùng Live Server (VSCode) - ⭐ Recommended

1. **Cài Live Server Extension:**
   - Mở VSCode
   - Vào Extensions (Ctrl+Shift+X)
   - Tìm "Live Server"
   - Cài đặt từ tác giả Ritwick Dey

2. **Chạy Live Server:**
   - Mở file `index.html`
   - Chuột phải → "Open with Live Server"
   - Browser sẽ mở tại `http://localhost:3000` (hoặc port khác)

### Cách 2: Dùng Python SimpleHTTPServer

```bash
cd e:\Kien_HK2_Nam3\shoe-store-frontend
python -m http.server 3000
```

URL: `http://localhost:3000`

### Cách 3: Dùng Node.js

```bash
# Cài http-server global
npm install -g http-server

# Chạy server
cd e:\Kien_HK2_Nam3\shoe-store-frontend
http-server -p 3000
```

---

## ✅ Kiểm tra Cài đặt

### Terminal 1: Backend (FastAPI)
```bash
cd e:\Kien_HK2_Nam3\ai_shop_app\shoe-store-backend
python main.py
```

Output:
```
✅ Database initialized
🚀 Server running on port 5000
INFO:     Uvicorn running on http://0.0.0.0:5000 (Press CTRL+C to quit)
```

### Terminal 2: Frontend
Mở `http://localhost:3000` (hoặc port khác nếu dùng Live Server) trong browser

### Test API
1. Mở browser F12 (DevTools)
2. Vào tab Console
3. Chạy lệnh test:
```javascript
// Test Signup
fetch('http://localhost:5000/api/auth/signup', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    fullname: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    confirmPassword: 'password123'
  })
}).then(r => r.json()).then(d => console.log(d))
```

**Hoặc xem API Documentation:**
- Truy cập http://localhost:5000/docs (Swagger UI)
- Hoặc http://localhost:5000/redoc (ReDoc)

---

## 📱 Sử dụng Ứng dụng

### 1. **Đăng Ký (Signup)**
- Vào trang `signup.html` hoặc click "Đăng ký"
- Nhập Họ & Tên, Email, Mật khẩu
- Click "Đăng Ký"
- Token sẽ được lưu tự động

### 2. **Đăng Nhập (Login)**
- Vào trang `login.html` hoặc click "Đăng nhập"
- Nhập Email, Mật khẩu
- Click "Đăng Nhập"
- Token sẽ được lưu tự động

### 3. **Xem Thông Tin User**
- Khi đã login, click vào icon user
- Sẽ hiển thị tên người dùng và nút "Đăng xuất"

### 4. **Đăng Xuất (Logout)**
- Click "Đăng xuất"
- Dữ liệu sẽ được xóa, quay về trang home

---

## 💾 Database

Database SQLite được tạo tự động tại:
```
e:\Kien_HK2_Nam3\shoe-store-backend\db\shoestore.db
```

### Xem dữ liệu Database

**Option 1: DB Browser for SQLite** ⭐ Dễ nhất
- Download: https://sqlitebrowser.org/
- Mở file `db/shoestore.db`
- Xem bảng `users`

**Option 2: Command Line**
```bash
# Cài SQLite (Windows)
choco install sqlite

# Hoặc dùng npm
npm install -g sqlite3

# Mở database
sqlite3 db/shoestore.db

# Xem users
SELECT * FROM users;

# Thoát
.quit
```

---

## 🔐 Bảo Mật

⚠️ **Quan trọng trước khi Deploy:**

1. **Thay JWT_SECRET trong `.env`:**
   ```env
   JWT_SECRET=your-super-secret-key-here-change-this
   ```

2. **Thay FRONTEND_URL:**
   ```env
   FRONTEND_URL=https://your-domain.com
   ```

3. **Thay NODE_ENV:**
   ```env
   NODE_ENV=production
   ```

---

## 🧪 API Endpoints

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| POST | `/api/auth/signup` | ❌ | Đăng ký |
| POST | `/api/auth/login` | ❌ | Đăng nhập |
| GET | `/api/auth/me` | ✅ | Lấy info user |
| PUT | `/api/auth/update` | ✅ | Cập nhật profile |
| POST | `/api/auth/logout` | ✅ | Đăng xuất |

---

## 🐛 Xử lý Lỗi

### Lỗi: "ModuleNotFoundError" hoặc "pip: command not found"
**Nguyên nhân:** Python hoặc dependencies chưa install

**Cách fix:**
```bash
# Kiểm tra Python
python --version

# Cài lại dependencies
pip install -r requirements.txt
```

### Lỗi: "Cannot GET /api/auth/..."
**Nguyên nhân:** Backend không chạy

**Cách fix:**
```bash
cd e:\Kien_HK2_Nam3\ai_shop_app\shoe-store-backend
python main.py
```

### Lỗi: "Port 5000 already in use"
**Nguyên nhân:** Có chương trình khác đang dùng port 5000

**Cách fix:**
```bash
# Option 1: Kill process
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Option 2: Thay port trong .env
# Đổi PORT=5000 thành PORT=5001
```

### Lỗi: "Email already exists"
**Nguyên nhân:** Email đã được đăng ký

**Cách fix:** Dùng email khác hoặc xóa database
```bash
# Xóa database (sẽ mất tất cả user)
rm db/shoestore.db

# Restart backend
python main.py
```

### Lỗi: "Invalid email or password"
**Nguyên nhân:** Mật khẩu không đúng

**Cách fix:** Kiểm tra mật khẩu hoặc đăng ký tài khoản mới

---

## 📁 Cấu trúc Dự Án (FastAPI Version)

```
Kien_HK2_Nam3/
├── shoe-store-frontend/
│   ├── index.html
│   ├── login.html
│   ├── signup.html
│   ├── nike.html
│   ├── adidas.html
│   ├── puma.html
│   ├── sale.html
│   ├── cart.html
│   ├── styles.css
│   └── js/
│       └── auth.js
│
└── shoe-store-backend/
    ├── main.py                    # FastAPI app (thay thế src/)
    ├── requirements.txt           # Python dependencies
    ├── .env                       # Configuration
    ├── .env.example               # Example config
    ├── db/
    │   └── shoestore.db          # SQLite database
    ├── FASTAPI_README.md         # API documentation
    ├── MIGRATION_GUIDE.md        # Migration từ Node.js
    └── src/                      # Old Node.js files (reference)
        ├── index.js
        ├── config/
        ├── models/
        ├── controllers/
        ├── routes/
        ├── middleware/
        └── utils/
```

**Ghi chú:** 
- `main.py` là FastAPI app chính (thay thế toàn bộ thư mục `src/`)
- Thư mục `src/` vẫn giữ lại để reference (không sử dụng)
- Database và API endpoints giữ nguyên như cũ

---

## 📚 Tài Liệu

- [FastAPI Backend README](shoe-store-backend/FASTAPI_README.md) - Chi tiết API endpoints
- [Migration Guide](shoe-store-backend/MIGRATION_GUIDE.md) - Hướng dẫn chuyển từ Node.js
- [FastAPI Documentation](https://fastapi.tiangolo.com) - Framework documentation

---

## 🔄 Chuyển từ Node.js sang FastAPI

**Backend đã được chuyển đổi từ Node.js + Express sang Python + FastAPI!**

### ✅ Những gì GIỮA NGUYÊN:
- Tất cả API endpoints (`/api/auth/...`)
- Request/Response format
- Database structure
- JWT authentication
- **Frontend không cần thay đổi**

### 📊 So sánh:

| Tiêu chí | Node.js | FastAPI |
|---------|---------|---------|
| **Framework** | Express | FastAPI |
| **Server** | Node.js | Python + Uvicorn |
| **Database** | SQLite + sqlite3 | SQLite + SQLAlchemy |
| **Password Hashing** | bcryptjs | passlib + bcrypt |
| **Performance** | ⚡ | ⚡⚡ (Nhanh hơn) |
| **Type Safety** | ❌ | ✅ Pydantic |
| **API Docs** | ❌ | ✅ Swagger UI + ReDoc |

### 🎯 Lợi ích:
- ✅ Hiệu suất cao hơn
- ✅ Type checking tự động
- ✅ API documentation tự động
- ✅ Code sạch và dễ maintain
- ✅ Cộng đồng Python rộng lớn

---

## ✨ Tiếp Theo

### Features có thể thêm:
- [ ] Shopping Cart
- [ ] Product Details
- [ ] Order Management
- [ ] Payment Integration
- [ ] User Dashboard
- [ ] Admin Panel
- [ ] Email Verification
- [ ] Password Reset
- [ ] Social Login (Google, GitHub)

---

## 💬 Support

Nếu có lỗi, kiểm tra:
1. ✅ Node.js đã install
2. ✅ Backend chạy tại port 5000
3. ✅ Frontend chạy tại port 3000
4. ✅ Database file tồn tại
5. ✅ Không có lỗi CORS
6. ✅ Token được lưu trong localStorage

🎉 **Xong! Bây giờ bạn có một ứng dụng Shoe Store hoàn chỉnh!**
