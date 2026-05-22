# Hướng Dẫn Sử Dụng Docker Để Chạy Dự Án MyShoes

Dự án này đã được đóng gói hoàn toàn bằng Docker. Bạn có thể sao chép toàn bộ dự án sang bất kỳ máy tính nào khác có cài đặt Docker và chạy ngay lập tức mà không cần cài đặt Node.js hay PostgreSQL cục bộ. Dữ liệu mẫu (sản phẩm, người dùng và các tài khoản shipper) sẽ tự động được thêm vào cơ sở dữ liệu khi hệ thống chạy lần đầu tiên.

---

## 🛠️ 1. Yêu cầu hệ thống
Máy chạy cần cài đặt sẵn:
- **Docker Desktop** (hoặc Docker Engine & Docker Compose).

---

## 🚀 2. Các bước khởi chạy dự án

### Bước 1: Mở Terminal tại thư mục gốc của dự án
(Nơi chứa file `docker-compose.yml`)

### Bước 2: Khởi chạy các container
Chạy lệnh sau để build và khởi động tất cả dịch vụ (Database, Backend, Frontend):
```bash
docker compose up --build -d
```
*Lưu ý: Thêm `-d` để chạy ẩn (background).*

### Bước 3: Truy cập ứng dụng
- **Giao diện người dùng (Frontend)**: Truy cập qua trình duyệt tại địa chỉ `http://localhost:3000`
- **Địa chỉ API (Backend)**: Hoạt động nội bộ thông qua Proxy Nginx tại `http://localhost:3000/api` (hoặc truy cập trực tiếp tại `http://localhost:8000`).

---

## 🌐 3. Đồng bộ với Cloud Database (Render / Supabase)
Nếu bạn muốn container chạy local kết nối và đồng bộ dữ liệu trực tiếp với cơ sở dữ liệu trên Render/Supabase:

1. Đổi tên file `.env.example` ở thư mục gốc thành `.env`.
2. Mở file `.env` và nhập link database của bạn vào biến `DB_URL`:
   ```env
   DB_URL=postgresql://[user]:[password]@[host]/[database-name]?sslmode=require
   ```
3. Khởi chạy lại Docker Compose để nhận cấu hình mới:
   ```bash
   docker compose down
   docker compose up -d
   ```
> [!NOTE]
> Để tránh làm ảnh hưởng đến dữ liệu cũ trên Cloud database của bạn, hệ thống Docker sẽ **tự động bỏ qua (skip)** việc seed dữ liệu mẫu khi phát hiện có cấu hình `DB_URL`.


---

## 🔐 4. Tài khoản thử nghiệm mặc định
Hệ thống tự động seed các tài khoản sau vào cơ sở dữ liệu PostgreSQL ở lần khởi chạy đầu tiên:

| Vai trò | Email | Mật khẩu | Chi tiết |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@gmail.com` | `123456` | Quản lý sản phẩm, đơn hàng và thống kê |

---

## 🐳 5. Lệnh quản lý thường gặp

### Xem trạng thái các container đang chạy:
```bash
docker compose ps
```

### Xem logs của hệ thống (ví dụ kiểm tra backend hay database):
```bash
docker compose logs -f backend
```

### Dừng toàn bộ hệ thống:
```bash
docker compose down
```

### Xóa toàn bộ hệ thống và reset lại dữ liệu về trạng thái ban đầu:
```bash
docker compose down -v
```
*(Lệnh này sẽ xóa ổ đĩa ảo lưu trữ dữ liệu PostgreSQL `pgdata`. Khi khởi động lại bằng `docker compose up --build`, hệ thống sẽ tự động thực hiện lại quá trình seed dữ liệu ban đầu).*
