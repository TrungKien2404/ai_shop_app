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
- `index.html`: Trang chủ hiển thị sản phẩm theo brand/category.
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

## ⚡ 4. Hướng Dẫn Khởi Chạy Nhanh Bằng Kịch Bản Tự Động (`setup.bat`)

Dự án đã được tối ưu hóa hoàn chỉnh bằng Docker. Bạn chỉ cần khởi động **Docker Desktop** trên máy trước khi chạy script:

### 🔹 Trên Windows (PowerShell hoặc Command Prompt)

1. Mở thư mục dự án `ai_shop_app` trong cửa sổ dòng lệnh.
2. Gõ lệnh sau để khởi chạy:
   * **Trong PowerShell (Khuyên dùng):**
     ```powershell
     .\setup.bat
     ```
     > 💡 *Lưu ý quan trọng:* Trong Windows PowerShell, theo mặc định bảo mật, bạn bắt buộc phải thêm dấu chấm gạch chéo `.\` phía trước tên file script để hệ thống nhận diện và chạy được.
   * **Trong Command Prompt (cmd.exe):**
     ```cmd
     setup.bat
     ```

### 🔹 Trên macOS / Linux
Mở terminal tại thư mục dự án và chạy:
```bash
chmod +x setup.sh
./setup.sh
```

---

## 🔑 6. Danh Sách Tài Khoản Kiểm Thử (Test Accounts)

Hệ thống sau khi khởi động sẽ tự động seed sẵn dữ liệu các tài khoản mẫu dưới đây để phục vụ cho việc chấm bài và demo tính năng:

| Vai trò (Role) | Email | Mật khẩu | Tính năng chính |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@gmail.com` | `123456` | Quản lý sản phẩm, đơn hàng, người dùng, chat hỗ trợ, xem dashboard doanh thu |
| **Khách mua hàng (User)** | `user@gmail.com` | `123456` | Xem sản phẩm, giỏ hàng, đặt hàng, cập nhật thông tin cá nhân, chat với Admin |
| **Shipper** | `shipper@gmail.com` | `123456` | Nhận và giao đơn hàng |

---
