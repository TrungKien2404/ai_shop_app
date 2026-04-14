# Hướng Dẫn Chạy Database & Backend Trên Máy Tính Mới

Dự án này đã được nâng cấp database từ SQLite nội bộ sang **PostgreSQL** chuyên nghiệp. Vì vậy, khi sao chép toàn bộ mã nguồn sang một máy tính mới, học sinh/đồng nghiệp cần làm theo một trong hai cách dưới đây để Project có dữ liệu hoạt động.

---

## CÁCH 1: KẾT NỐI CHUNG ĐÁM MÂY (CLOUD DATABASE) - ĐỀ XUẤT 🌟
Nếu bạn (người gửi) đã đẩy dữ liệu lên một Cloud Platform (như Render, Supabase, Neon), người nhận source code sẽ **KHÔNG CẦN** phải cài đặt PostgreSQL rườm rà. Tất cả mọi máy dùng chung một luồng data thời gian thực.

**Các bước thực hiện ở máy tính mới:**
1. Tạo một file tên là `.env` nằm bên trong thư mục `shoe-store-backend` (có thể copy nội dung từ file `.env.example`).
2. Mở file `.env` và thêm chuỗi khóa URL do chủ dự án cấp:
   ```env
   DB_URL="postgresql://[user]:[password]@[host-cloud]/[database-name]"
   ```
3. Mở Terminal (ở thư mục backend) và chạy cài đặt thư viện:
   ```bash
   npm install
   ```
4. Chạy dự án:
   ```bash
   npm run dev
   ```
👉 *Xong! Không cần làm gì thêm, mọi dữ liệu tự động đồng bộ trên đám mây.*

---

## CÁCH 2: CHẠY ĐỘC LẬP HOÀN TOÀN TẠI MÁY MỚI (LOCAL)
Nếu muốn chạy một bản PostgreSQL cá nhân trên máy tính đó (không cần internet hoặc không có đường link Cloud).

### Bước 1: Cài đặt và chuẩn bị Database
1. Cài đặt **PostgreSQL** và phần mềm giao diện **pgAdmin 4** lên máy tính mới.
2. Mở **pgAdmin 4**. Nhập mật khẩu bạn vừa tạo lúc cài đặt.
3. Bấm chuột phải vào nhóm `Databases` -> Chọn `Create` -> `Database...`
4. Tại ô Database name, nhập chữ **`shoe_shop`** và bấm Save.

### Bước 2: Khai báo cấu hình
Tại thư mục gốc của Backend, tạo/mở file `.env` (Lưu ý: Không dùng khai báo gộp `DB_URL` như ở CÁCH 1). Khai báo các thông tin sau:
```env
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=mật_khẩu_cài_đặt_postgresql_ở_máy_này
DB_NAME=shoe_shop
```

### Bước 3: Cài đặt và Sinh dữ liệu
1. Mở Terminal và chạy lệnh cài đặt thư viện gốc:
   ```bash
   npm install
   ```
2. Khởi động server để hệ thống nhận diện và tự động nhào nặn ra các Bảng (Tables) trống:
   ```bash
   npm run dev
   ```
3. (Tùy chọn) Bơm lại dữ liệu mẫu vào các bảng đang bị trống đó (Bao gồm Sản phẩm, Admin, Đơn hàng demo...). Bằng cách mở thêm một Terminal mới và gõ lệnh sau:
   ```bash
   node seed_data_to_pg.js
   ```
   *(Đợi file xử lý xong và hiện thông báo tạo hàng loạt dữ liệu mới là thành công).*

---
Bây giờ thì bạn có thể quay lại Frontend để gọi API như bình thường rồi!
