# 👟 MyShoes - AI Shop App 

<div align="center">

**A modern full-stack e-commerce platform for premium shoe retail**

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green)](https://nodejs.org)
[![Express.js](https://img.shields.io/badge/Express.js-v4.18-gray)](https://expressjs.com)
[![Sequelize](https://img.shields.io/badge/Sequelize-v6.37-blue)](https://sequelize.org)
[![SQLite](https://img.shields.io/badge/SQLite-v3-003B57)](https://www.sqlite.org)

</div>

---

## 📋 Tổng Quan Dự Án

**MyShoes** là một hệ thống quản lý và bán giày trực tuyến hoàn chỉnh. Dự án được thiết kế theo kiến trúc **Full-stack**, sử dụng **SQLite** làm cơ sở dữ liệu để đảm bảo tính gọn nhẹ, di động và cực kỳ dễ triển khai trên bất kỳ máy mới nào. 

Ứng dụng cung cấp các chức năng bán lẻ trực tuyến hoàn thiện kết hợp trang quản trị chuyên nghiệp, hỗ trợ phân quyền người dùng và quy trình giao hàng của Shipper.

---

## 🏗️ Kiến Trúc Dự Án

```
ai_shop_app/
├── shoe-store-backend/          # Backend (Node.js + Express)
│   ├── config/                  # Cấu hình Sequelize & Cơ sở dữ liệu
│   │   └── db.js
│   ├── controllers/             # Logic nghiệp vụ (auth, product, order, chat)
│   │   ├── authController.js
│   │   ├── chatController.js
│   │   ├── orderController.js
│   │   └── productController.js
│   ├── middleware/              # Middlewares tùy chỉnh (authMiddleware)
│   │   └── authMiddleware.js
│   ├── models/                  # Định nghĩa cấu trúc bảng Database
│   │   ├── Order.js
│   │   ├── OrderItem.js
│   │   ├── Product.js
│   │   └── User.js
│   ├── routes/                  # Định nghĩa endpoints API
│   │   ├── authRoutes.js
│   │   ├── chatRoutes.js
│   │   ├── orderRoutes.js
│   │   └── productRoutes.js
│   ├── server.js                # Server entry point
│   ├── database.sqlite          # Cơ sở dữ liệu SQLite di động
│   └── package.json
│
├── shoe-store-frontend/         # Frontend (HTML + Nginx)
│   ├── js/                      # Các script xử lý phía client
│   │   ├── admin.js             # Logic thống kê, biểu đồ & CRUD
│   │   ├── auth.js              # Quản lý JWT token & bảo mật route
│   │   ├── constants.js         # Lưu cấu hình API_BASE URL
│   │   ├── products-enhanced.js # Xử lý danh sách & phân trang sản phẩm
│   │   └── shipper.js           # Logic đơn hàng dành cho shipper
│   ├── pages/                   # Giao diện HTML của trang web
│   │   ├── index.html           # Trang chủ
│   │   ├── admin.html           # Dashboard quản trị Admin
│   │   ├── login.html           # Đăng nhập
│   │   ├── signup.html          # Đăng ký
│   │   ├── cart.html            # Chi tiết giỏ hàng
│   │   ├── checkout.html        # Trang thanh toán
│   │   ├── profile.html         # Trang thông tin cá nhân
│   │   ├── shipper.html         # Giao diện tài xế giao hàng
│   │   └── [brand].html         # Các trang thương hiệu (nike, adidas...)
│   ├── styles.css               # CSS styling chính cho giao diện
│   └── Dockerfile               # Build image Nginx phục vụ frontend static
│
├── docker-compose.yml           # File docker-compose trung tâm
├── setup.bat                    # Script cài đặt nhanh trên Windows
├── setup.sh                     # Script cài đặt nhanh trên macOS/Linux
└── README.md                    # Tài liệu hướng dẫn dự án
```

---

## 🛠️ Tech Stack

### Backend
| Công nghệ | Phiên bản | Vai trò |
| :--- | :--- | :--- |
| **Node.js** | ^18.x / ^20.x | Môi trường runtime chạy code |
| **Express.js** | ^4.18.2 | Web framework xây dựng RESTful API |
| **PostgreSQL** | ^6.0.1 | Hệ quản trị CSDL quan hệ |
| **Sequelize** | ^6.37.8 | ORM ánh xạ dữ liệu và đồng bộ database |
| **JWT** | ^9.0.3 | Quản lý phiên làm việc & xác thực token |
| **Bcryptjs** | ^2.4.3 | Mã hóa mật khẩu bảo vệ tài khoản |
| **CORS** | ^2.8.5 | Quản lý quyền chia sẻ tài nguyên nguồn chéo |

### Frontend
| Công nghệ | Phiên bản | Vai trò |
| :--- | :--- | :--- |
| **HTML5 / CSS3** | Tiêu chuẩn | Cấu trúc trang và tùy biến giao diện cơ bản |
| **Vanilla JS** | ES6+ | Logic tương tác Client-side không dùng framework cồng kềnh |
| **Tailwind CSS** | CDN | Hệ thống CSS utility thiết kế giao diện Glassmorphism |
| **FontAwesome** | CDN | Thư viện biểu tượng & Icon giao diện |
| **Chart.js** | CDN | Thiết lập biểu đồ trực quan hóa dữ liệu thống kê doanh số |

---

## ✨ Chức Năng Chính

### 👤 Dành Cho Khách Hàng (User)
- **Modern UI:** Giao diện tối giản thiết kế theo phong cách Glassmorphism với Dark mode đồng nhất.
- **Smart Shopping:** Phân loại sản phẩm linh hoạt theo thương hiệu (Nike, Adidas, Puma, Biti's...) và mục đích (Running, Sport, Casual...).
- **Shopping Cart:** Giỏ hàng thông minh lưu trữ theo từng tài khoản cá nhân thông qua `localStorage`.
- **Order Tracking:** Khách hàng có thể kiểm tra danh sách đơn hàng đã đặt, theo dõi tiến trình giao hàng trực tiếp.
- **AI Consultation:** Tích hợp sẵn khung Chatbot UI hỗ trợ tư vấn giày thông minh.

### 🛠️ Dành Cho Quản Trị Viên (Admin)
- **Dashboard Thống kê:**
  - Tổng doanh thu thực tế (đã lọc loại bỏ các đơn hàng bị hủy bỏ).
  - Biểu đồ biến động doanh thu 7 ngày qua & Tỷ lệ trạng thái đơn hàng (sử dụng **Chart.js**).
- **Quản lý Sản phẩm (CRUD):** Thêm mới, cập nhật thông tin (tên, hãng, giá, mô tả, ảnh) hoặc xóa giày khỏi kho.
- **Quản lý Đơn hàng:** Xem danh sách, cập nhật trạng thái đơn, gán đơn hàng cho shipper chuyên biệt.
- **Quản lý Người dùng:** Xem danh sách thành viên, quản lý phân quyền và xóa tài khoản vi phạm (Cascade dữ liệu liên quan).
### 🚚 Dành Cho Người Dùng
- Tạo và quản lý tài khoản của mình.
- Đăng ký tài khoản, đăng nhập và quản lý thông tin cá nhân.

### 🚚 Dành Cho Người Giao Hàng (Shipper)
- Giao diện quản lý đơn hàng riêng biệt.
- Nhận đơn hàng, theo dõi thông tin người mua, cập nhật trạng thái (Đang giao, Giao thành công, Hủy đơn).

### 🔐 Xác Thực & Bảo Mật
- Đăng ký và Đăng nhập bằng mã hóa một chiều Bcryptjs bảo vệ mật khẩu.
- Xác thực phiên bằng JWT Token lưu trữ ở Client.
- Auth Middleware phân quyền chặt chẽ giữa Khách hàng, Shipper và Quản trị viên.

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy Nhanh

Hệ thống đã được đóng gói hoàn chỉnh trong container Docker, giúp bạn dễ dàng chạy dự án trên máy mới chưa có bất kỳ cài đặt nào khác.

### Yêu Cầu Tiên Quyết
* Đã cài đặt và đang bật **Docker Desktop** trên máy.

### 1️⃣ Khởi Chạy Trên Windows (Sử dụng PowerShell hoặc cmd)

1. Mở thư mục dự án `ai_shop_app`.
2. Chạy lệnh:
   * **Trong PowerShell (Khuyên dùng):**
     ```powershell
     .\setup.bat
     ```
   * **Trong Command Prompt (cmd.exe):**
     ```cmd
     setup.bat
     ```

### 2️⃣ Khởi Chạy Trên macOS / Linux
Mở terminal tại thư mục dự án và chạy:
```bash
chmod +x setup.sh
./setup.sh
```

Sau khi hoàn tất, hệ thống sẽ tự động in ra các đường dẫn truy cập cục bộ:
* **Frontend:** `http://localhost:3000`
* **Backend API:** `http://localhost:8000`

---

## 🔑 5. Danh Sách Tài Khoản Kiểm Thử (Test Accounts)

Sau khi cài đặt thành công, hệ thống tự động khởi tạo dữ liệu seed mẫu của các tài khoản sau để phục vụ cho việc chấm bài và demo tính năng nhanh:

| Vai trò (Role) | Email | Mật khẩu | Tính năng chính |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@gmail.com` | `123456` | Toàn quyền kiểm soát, xem dashboard Chart.js doanh số, CRUD sản phẩm, phân đơn |
| **Khách mua hàng (User)** | `user@gmail.com` | `123456` | Đăng nhập mua hàng, thêm giỏ hàng, đặt hàng, quản lý đơn cá nhân, chat tư vấn |
| **Người giao hàng (Shipper)** | `shipper@gmail.com` | `123456` | Giao diện nhận đơn hàng, thay đổi trạng thái giao hàng thực tế |

---


---

<div align="center">

**Made with ❤️ by the 2PKN Team**

</div>
