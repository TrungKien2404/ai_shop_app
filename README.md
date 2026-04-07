# AI Shop App

Hướng dẫn chi tiết để chạy toàn bộ project `ai_shop_app` trên máy mới.

Project gồm 2 phần:

- `shoe-store-backend`: Node.js + Express + MongoDB
- `shoe-store-frontend`: HTML/CSS/JS thuần

## 1. Yêu cầu trước khi chạy

Bạn cần cài sẵn:

- Node.js 18+ hoặc mới hơn
- npm
- MongoDB Community Server
- VS Code + Live Server extension là tốt nhất để mở frontend

Kiểm tra nhanh:

```powershell
node -v
npm -v
```

## 2. Cấu trúc project

```text
ai_shop_app/
├─ shoe-store-backend/
│  ├─ server.js
│  ├─ .env
│  ├─ .env.example
│  ├─ seed_users.js
│  ├─ backup_users.js
│  ├─ restore_users_backup.js
│  ├─ seed-users.json
│  └─ users-backup.json
└─ shoe-store-frontend/
   ├─ home.html
   ├─ profile.html
   ├─ cart.html
   ├─ checkout.html
   ├─ search.html
   └─ js/
```

## 3. Cài đặt backend

Mở terminal tại thư mục gốc project:

```powershell
cd e:\Kien_HK2_Nam3\ai_shop_app\shoe-store-backend
npm install
```

Nếu `node_modules` đã có sẵn thì vẫn nên chạy lại `npm install` trên máy mới.

## 4. Cấu hình file .env

Trong thư mục `shoe-store-backend`, tạo file `.env`.

Bạn có thể copy từ file mẫu `.env.example`.

Nội dung mẫu:

```env
MONGO_URI=mongodb://127.0.0.1:27017/shoe_shop
JWT_SECRET=your_jwt_secret_here
PORT=8000
```

Giải thích:

- `MONGO_URI`: địa chỉ MongoDB
- `JWT_SECRET`: khóa tạo token đăng nhập
- `PORT`: cổng chạy backend

## 5. Khởi động MongoDB

Bạn phải chắc chắn MongoDB đang chạy trước khi start backend.

Nếu bạn cài MongoDB như service trên Windows, thường chỉ cần mở Services và start MongoDB.

Nếu chạy thủ công, có thể dùng:

```powershell
mongod
```

Nếu MongoDB đã chạy rồi thì bỏ qua bước này.

## 6. Khôi phục user/admin cũ từ backup

Quan trọng:

- Dữ liệu MongoDB không tự đi theo khi `git push`
- Để mang user cũ sang máy mới, project đã có file `users-backup.json`
- Máy mới clone về cần chạy lệnh restore để nhập lại user vào MongoDB

Trong thư mục `shoe-store-backend`, chạy:

```powershell
npm run restore:users
```

hoặc:

```powershell
node restore_users_backup.js
```

Lệnh này sẽ:

- đọc file `users-backup.json`
- kết nối MongoDB
- tạo mới hoặc cập nhật lại user
- giữ nguyên mật khẩu đã hash trong database cũ

## 7. Tạo user mẫu nếu không muốn restore backup

Nếu bạn không muốn dùng user cũ mà chỉ muốn có tài khoản mẫu để test:

```powershell
npm run seed:users
```

hoặc:

```powershell
node seed_users.js
```

Script này đọc file `seed-users.json`.

Tài khoản mẫu mặc định:

- Admin: `admin@gmail.com` / `123456`
- User: `user@gmail.com` / `123456`

## 8. Chạy backend

Trong thư mục `shoe-store-backend`:

```powershell
npm start
```

Hoặc chạy chế độ dev:

```powershell
npm run dev
```

Khi chạy thành công, backend sẽ mở ở:

```text
http://localhost:8000
```

Test nhanh:

```text
http://localhost:8000/
```

Nếu thấy JSON trả về như `Shoe shop API` là backend đã chạy đúng.

## 9. Chạy frontend

Frontend là HTML/CSS/JS thuần, không cần `npm install`.

### Cách khuyến nghị: dùng VS Code Live Server

1. Mở thư mục `shoe-store-frontend` bằng VS Code
2. Click phải vào `home.html`
3. Chọn `Open with Live Server`

Frontend sẽ chạy ở dạng:

```text
http://127.0.0.1:5500/home.html
```

hoặc cổng tương tự.

### Cách đơn giản khác

Bạn cũng có thể mở trực tiếp file:

```text
shoe-store-frontend/home.html
```

Nhưng cách dùng Live Server vẫn ổn định hơn khi test navigation và fetch.

## 10. Thứ tự chạy đầy đủ trên máy mới

Đây là quy trình khuyến nghị từ đầu đến cuối:

1. Clone repo về máy
2. Mở terminal tại `shoe-store-backend`
3. Chạy `npm install`
4. Tạo `.env` từ `.env.example`
5. Bật MongoDB
6. Chạy `npm run restore:users`
7. Chạy `npm start`
8. Mở `shoe-store-frontend/home.html` bằng Live Server

## 11. Các lệnh quan trọng

### Backend

```powershell
cd shoe-store-backend
npm install
npm start
npm run dev
```

### User / admin

```powershell
npm run seed:users
npm run backup:users
npm run restore:users
```

### Chạy trực tiếp bằng node

```powershell
node seed_users.js
node backup_users.js
node restore_users_backup.js
```

## 12. Ý nghĩa các script user

### `seed_users.js`

Dùng để tạo tài khoản mẫu từ file `seed-users.json`.

### `backup_users.js`

Dùng để xuất user hiện có trong MongoDB ra file `users-backup.json`.

Khi bạn vừa tạo thêm tài khoản mới và muốn push lên GitHub để máy khác restore được, hãy chạy:

```powershell
npm run backup:users
```

Sau đó commit luôn file:

```text
shoe-store-backend/users-backup.json
```

### `restore_users_backup.js`

Dùng để nhập lại user từ `users-backup.json` vào MongoDB trên máy mới.

## 13. Khi nào cần chạy backup user

Bạn nên chạy backup trong các trường hợp sau:

- vừa đăng ký thêm tài khoản mới
- vừa đổi mật khẩu cho user/admin
- vừa chỉnh quyền `isAdmin`
- sắp push project lên GitHub và muốn máy khác lấy về có thể restore lại đúng user hiện tại

Lệnh:

```powershell
cd shoe-store-backend
npm run backup:users
```

## 14. Test nhanh sau khi chạy

Sau khi backend và frontend đã chạy:

1. Mở `home.html`
2. Đăng nhập bằng tài khoản admin hoặc user
3. Thử tìm kiếm sản phẩm
4. Thêm sản phẩm vào giỏ
5. Vào giỏ hàng
6. Thanh toán
7. Vào trang cá nhân
8. Thử đổi mật khẩu

## 15. Một số URL quan trọng

### Frontend

- `home.html`
- `login.html`
- `signup.html`
- `cart.html`
- `checkout.html`
- `profile.html`
- `search.html`

### Backend API

- `GET http://localhost:8000/`
- `POST http://localhost:8000/api/auth/register`
- `POST http://localhost:8000/api/auth/login`
- `PUT http://localhost:8000/api/auth/change-password`
- `GET http://localhost:8000/api/products`
- `POST http://localhost:8000/api/orders`

## 16. Lỗi thường gặp

### Không đăng nhập được

Kiểm tra:

- backend đã chạy chưa
- MongoDB đã chạy chưa
- đã restore user chưa
- email/password nhập đúng chưa

### Không thấy user cũ trên máy mới

Bạn phải:

1. chạy `npm run backup:users` trên máy cũ
2. commit file `users-backup.json`
3. pull/clone trên máy mới
4. chạy `npm run restore:users`

Nếu chỉ `git push` mà không backup user ra file JSON thì MongoDB của máy khác sẽ không có các tài khoản cũ.

### Frontend mở được nhưng không tải dữ liệu

Kiểm tra:

- backend đang chạy ở `http://localhost:8000`
- file `.env` đúng
- MongoDB có dữ liệu

## 17. Gợi ý quy trình làm việc an toàn

Khi bạn thay đổi dữ liệu user thật trong quá trình dev:

1. Chạy app
2. Tạo user mới hoặc đổi mật khẩu
3. Chạy `npm run backup:users`
4. Commit code + `users-backup.json`
5. Push GitHub

Máy khác lấy về:

1. `npm install`
2. bật MongoDB
3. `npm run restore:users`
4. `npm start`

## 18. Ghi chú quan trọng

- `register` đã tự lưu user mới vào MongoDB
- `login` chỉ kiểm tra user trong MongoDB
- `change-password` đã lưu mật khẩu mới xuống MongoDB
- `users-backup.json` là cầu nối để mang dữ liệu user từ máy này sang máy khác qua Git

## 19. Lệnh chạy nhanh nhất

Nếu mọi thứ đã cài sẵn, đây là bộ lệnh ngắn nhất:

```powershell
cd e:\Kien_HK2_Nam3\ai_shop_app\shoe-store-backend
npm install
npm run restore:users
npm start
```

Sau đó mở:

```text
shoe-store-frontend/home.html
```

bằng Live Server.
