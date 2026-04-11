# 👟 MyShoes - AI Shop App (Full-Stack SQLite Version)

**MyShoes** là một hệ thống quản lý và bán giày trực tuyến hoàn chỉnh. Dự án được thiết kế theo kiến trúc **Full-stack**, sử dụng **SQLite** làm cơ sở dữ liệu để đảm bảo tính gọn nhẹ, di động và cực kỳ dễ triển khai.

---

## 🌟 1. Tính năng nổi bật

### 👤 Dành cho Khách hàng
- **Modern UI**: Giao diện thiết kế theo phong cách Glassmorphism, đồng nhất Dark mode bằng Tailwind CSS.
- **Smart Shopping**: Phân loại giày theo thương hiệu (Nike, Adidas, Puma, Biti's...).
- **Shopping Cart**: Giỏ hàng lưu trữ theo từng tài khoản cá nhân thông qua `localStorage`.
- **Order Tracking**: Khách hàng có thể xem lại lịch sử và trạng thái đơn hàng của mình.
- **AI Consultation**: Tích hợp UI chatbot hỗ trợ tư vấn (Sẵn sàng để kết nối API AI).

### 🛠️ Dành cho Quản trị viên (Admin)
- **Dashboard Thống kê Nâng cao**:
    - Thống kê tổng doanh thu thực tế (đã loại bỏ đơn hàng bị hủy).
    - Biểu đồ **Chart.js** trực quan: Biến động doanh thu 7 ngày qua và Tỷ lệ trạng thái đơn hàng.
    - Danh sách **Top 5 Sản phẩm bán chạy nhất**.
- **Quản lý Kho hàng (CRUD)**: Toàn quyền Thêm/Sửa/Xóa sản phẩm kèm hình ảnh và mô tả.
- **Quản lý Đơn hàng**: Xem chi tiết từng món hàng trong đơn, cập nhật trạng thái giao hàng.
- **Quản lý Người dùng**: Tạo tài khoản admin/user, xóa người dùng và tự động xóa dữ liệu liên quan (Cascade).

---

## 💻 2. Công nghệ sử dụng

- **Frontend**: HTML5, Vanilla JavaScript (ES6+), FontAwesome, Tailwind CSS (CDN), **Chart.js** (Statistical visuals).
- **Backend**: Node.js, Express.js.
- **Database Layer**: **SQLite3** với **Sequelize ORM** (Giúp đồng bộ hóa bảng và quản lý quan hệ dữ liệu).
- **Security**: 
    - **JWT (JSON Web Token)**: Xác thực phiên làm việc.
    - **Bcryptjs**: Mã hóa mật khẩu một chiều trước khi lưu vào DB.
    - **Auth Middleware**: Phân quyền nghiêm ngặt giữa người dùng thường và quản trị viên.

---

## 📂 3. Cấu trúc thư mục & Giải thích File

### 🏠 Frontend (`shoe-store-frontend/`)
- `home.html`: Trang chủ hiển thị sản phẩm theo brand/category.
- `admin.html`: Dashboard quản trị (Yêu cầu quyền Admin).
- `login.html` / `signup.html`: Xử lý đăng ký & đăng nhập.
- `cart.html`: Giỏ hàng chi tiết.
- `checkout.html`: Form nhập thông tin thanh toán và tạo đơn hàng.
- `js/auth.js`: "Trái tim" của frontend, xử lý JWT, menu, login, logout và bảo mật route.
- `js/admin.js`: Toàn bộ logic thống kê, biểu đồ và CRUD trong trang quản trị.
- `js/products.js`: Xử lý hiển thị danh sách giày linh hoạt.

### ⚙️ Backend (`shoe-store-backend/`)
- `server.js`: Điểm khởi chạy API (Express server).
- `database.sqlite`: **File chứa toàn bộ dữ liệu** của ứng dụng.
- `models/`: Định nghĩa cấu trúc các bảng (User, Product, Order, OrderItem).
- `controllers/`: Nơi xử lý logic nghiệp vụ cho từng API.
- `routes/`: Định nghĩa các endpoint (đường dẫn) API.
- `config/db.js`: Cấu hình kết nối Sequelize tới SQLite.

---

## 🚀 4. Hướng dẫn chạy dự án (Plug & Play)

Dự án này sử dụng SQLite nên dữ liệu đi kèm file code, bạn chỉ cần thực hiện 2 bước:

### Bước 1: Khởi động Backend
```bash
cd shoe-store-backend
npm install
npm run dev
```
*Mặc định API sẽ chạy tại: `http://localhost:8000`*

### Bước 2: Chạy Frontend
Bạn chỉ cần mở các file HTML bằng trình duyệt hoặc dùng **Live Server** (VS Code).
- **Trang chủ**: `http://127.0.0.1:5500/home.html`

---

## 🔐 5. Tài khoản thử nghiệm

| Quyền | Email | Mật khẩu |
| :--- | :--- | :--- |
| **Admin** | `admin@gmail.com` | `123456` |
| **User** | `user@gmail.com` | `123456` |

---

## 📡 6. Danh mục API chính (Technical Reference)

### 🔑 Authentication (`/api/auth`)
- `POST /register`: Đăng ký tài khoản mới.
- `POST /login`: Đăng nhập & lấy Token JWT.
- `GET /users`: Lấy danh sách thành viên (Admin only).
- `POST /create-user-by-admin`: Trang admin tạo nhanh người dùng.
- `DELETE /delete-user/:id`: Xóa người dùng và các đơn hàng liên quan.

### 👟 Products (`/api/products`)
- `GET /`: Lấy toàn bộ danh sách giày.
- `GET /:id`: Xem chi tiết một sản phẩm.
- `POST /`: Thêm giày mới (Admin only).
- `PUT /:id`: Cập nhật thông tin giày (Admin only).
- `DELETE /:id`: Xóa giày khỏi kho (Admin only).

### 📦 Orders (`/api/orders`)
- `POST /`: Tạo đơn hàng mới từ giỏ hàng.
- `GET /`: Lấy toàn bộ đơn hàng (Admin dùng để quản lý).
- `GET /myorders/:userId`: Khách hàng xem lịch sử mua hàng của riêng mình.
- `PUT /:id`: Admin cập nhật trạng thái đơn (Chờ xử lý -> Đã giao).

---

## 🔄 7. Luồng dữ liệu chính (Data Flow)

1.  **Đăng nhập**: User gửi email/password -> Backend băm mật khẩu so sánh -> Nếu đúng trả về **JWT** -> Frontend lưu JWT vào `sessionStorage`.
2.  **Đặt hàng**: Frontend gom dữ liệu từ `localStorage` (giỏ hàng) + Thông tin thanh toán -> Gửi lên API `/orders` kèm JWT -> Backend lưu vào bảng `Orders` và `OrderItems`.
3.  **Thống kê Admin**: Admin mở dashboard -> `admin.js` gọi API lấy tất cả đơn hàng -> Duyệt mảng dữ liệu để tính tổng doanh thu và đếm số sản phẩm bán chạy -> Vẽ lên biểu đồ qua **Chart.js**.

---

## ⚠️ 8. Troubleshooting (Lỗi thường gặp)

- **Lỗi `ADDRINUSE` (Cổng 8000 đã bị chiếm)**: 
  *Cách sửa*: Mở Task Manager tắt các trình Node.js đang chạy ngầm hoặc dùng lệnh:
  `netstat -ano | findstr :8000` sau đó `taskkill /PID <số id> /F`.
- **Frontend không hiển thị dữ liệu**: Đảm bảo Backend đã được khởi chạy trước khi mở trình duyệt.
- **Lỗi `Not authorized`**: Do Token hết hạn hoặc chưa đăng nhập. Hãy đăng xuất và đăng nhập lại.

---
*Dự án được xây dựng với sự hỗ trợ của Antigravity AI Assistant.*
