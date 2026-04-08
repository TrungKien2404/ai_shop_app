# AI Shop App

Project web ban giay gom:

- `shoe-store-frontend`: giao dien HTML/CSS/JavaScript thuan
- `shoe-store-backend`: API Node.js + Express + MongoDB

README nay duoc viet lai theo dung trang thai code hien tai cua project.

## 1. Tong quan

Ung dung co cac chuc nang chinh:

- Dang ky, dang nhap, doi mat khau
- Hien thi danh sach san pham
- Tim kiem san pham
- Them vao gio hang
- Thanh toan va tao don hang
- Trang quan tri co ban cho admin

Luong chay thuc te:

1. Frontend chay bang Live Server hoac mot static server
2. Frontend goi API toi backend o `http://localhost:8000`
3. Backend ket noi MongoDB local mac dinh o `mongodb://127.0.0.1:27017/shoe_shop`

## 2. Cong nghe su dung

### Frontend

- HTML
- CSS
- JavaScript thuan
- Tailwind CDN
- Font Awesome CDN

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- bcryptjs
- cors
- dotenv

## 3. Cau truc thu muc

```text
ai_shop_app/
|- README.md
|- shoe-store-frontend/
|  |- home.html
|  |- login.html
|  |- signup.html
|  |- cart.html
|  |- checkout.html
|  |- order.html
|  |- admin.html
|  |- search.html
|  |- styles.css
|  |- images/
|  '- js/
|     |- auth.js
|     |- products.js
|     |- products-enhanced.js
|     |- admin.js
|     '- theme.js
'- shoe-store-backend/
   |- server.js
   |- package.json
   |- .env.example
   |- config/
   |  |- db.js
   |  '- env.js
   |- controllers/
   |- middleware/
   |- models/
   |- routes/
   |- seed_users.js
   |- backup_users.js
   |- restore_users_backup.js
   |- seed-users.json
   |- users-backup.json
   '- database/
```

## 4. Giai thich nhanh cac phan code chinh

### Frontend

- `js/auth.js`
  Xu ly dang ky, dang nhap, dang xuat, token, user hien tai, gio hang theo tung tai khoan, va chan hanh dong khi chua dang nhap.

- `js/products.js`
  Dung cho cac trang danh sach san pham thong thuong nhu brand/category/bestseller/trending.

- `js/products-enhanced.js`
  Dung cho trang tim kiem va popup chon size truoc khi them vao gio hang.

- `cart.html`
  Hien thi gio hang hien tai, cho phep xoa item, chuyen sang thanh toan.

- `order.html`
  Trang chi tiet dat mua nhanh mot san pham, co chon size va so luong.

- `checkout.html`
  Thu thap thong tin nguoi mua, phuong thuc giao hang, phuong thuc thanh toan, roi gui don hang len backend.

- `admin.html` + `js/admin.js`
  Giao dien quan tri san pham, don hang, nguoi dung.

### Backend

- `server.js`
  Diem khoi dong backend, tao app Express, ket noi MongoDB, mount routes, mo cong server.

- `config/env.js`
  Doc `.env` neu co, va tu fallback sang cau hinh mac dinh neu khong co `.env`.

- `config/db.js`
  Tao ket noi MongoDB bang Mongoose.

- `models/User.js`
  Model user, co hash password bang `bcryptjs` truoc khi luu.

- `models/Product.js`
  Model san pham.

- `models/Order.js`
  Model don hang.

- `controllers/authController.js`
  Xu ly dang ky, dang nhap, lay danh sach user, doi mat khau.

- `controllers/productController.js`
  Xu ly lay, them, sua, xoa san pham.

- `controllers/orderController.js`
  Xu ly tao don hang, lay danh sach don hang, cap nhat trang thai don.

- `middleware/authMiddleware.js`
  Xac thuc JWT va kiem tra quyen admin.

- `routes/*.js`
  Khai bao endpoint cho auth, products, orders.

## 5. Yeu cau truoc khi chay

Ban can cai san:

- Node.js 18 tro len
- npm
- MongoDB Community Server

Kiem tra nhanh:

```powershell
node -v
npm -v
```

## 6. Cau hinh mac dinh hien tai

Backend hien da duoc chinh de may khac clone ve khong bat buoc phai tu tao `.env`.

Neu khong co `.env`, backend se tu dung:

```env
MONGO_URI=mongodb://127.0.0.1:27017/shoe_shop
JWT_SECRET=shoe-shop-dev-secret
PORT=8000
```

File cau hinh hien tai nam o:

- `shoe-store-backend/config/env.js`

### Khi nao nen dung `.env`

Ban chi can tao `.env` neu muon doi:

- cong chay backend
- chuoi ket noi MongoDB
- JWT secret

Vi du `.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/shoe_shop
JWT_SECRET=my_custom_secret
PORT=8000
```

## 7. Cach chay backend

Mo terminal:

```powershell
cd e:\Kien_HK2_Nam3\ai_shop_app\shoe-store-backend
npm install
npm start
```

Hoac chay che do dev:

```powershell
cd e:\Kien_HK2_Nam3\ai_shop_app\shoe-store-backend
npm install
npm run dev
```

Khi chay thanh cong:

```text
http://localhost:8000
```

Test nhanh:

```text
http://localhost:8000/
```

Neu thay JSON tra ve thi backend da chay dung.

## 8. Cach chay frontend

Frontend la HTML/CSS/JS thuan, khong can `npm install`.

Khuyen nghi dung VS Code + Live Server:

1. Mo thu muc `shoe-store-frontend`
2. Click phai vao `home.html`
3. Chon `Open with Live Server`

Thong thuong frontend se chay o dang:

```text
http://127.0.0.1:5500/shoe-store-frontend/home.html
```

Luu y:

- Backend phai chay truoc
- Frontend hien dang goi API co dinh toi `http://localhost:8000`

## 9. Cach chay day du tu dau tren may moi

### Buoc 1: clone project

```powershell
git clone <repo-url>
cd ai_shop_app
```

### Buoc 2: cai backend

```powershell
cd shoe-store-backend
npm install
```

### Buoc 3: bat MongoDB

Neu MongoDB dang chay dang Windows Service thi chi can dam bao service da start.

Ban khong can mo MongoDB Compass va bam `Connect` de backend chay.

Compass chi la phan mem xem du lieu, khong phai dieu kien bat buoc de app hoat dong.

### Buoc 4: chay backend

```powershell
npm start
```

### Buoc 5: mo frontend

Mo `shoe-store-frontend/home.html` bang Live Server.

## 10. Du lieu MongoDB co di theo GitHub khong

Khong.

`git push` chi day:

- source code
- file JSON / anh / HTML / JS / CSS
- moi file da duoc commit

`git push` khong day:

- MongoDB dang chay tren may ban
- collection trong local database
- du lieu trong Compass

Noi ngan gon:

- Code di theo GitHub
- Database local khong di theo GitHub

## 11. Project hien co san du lieu gi khi pull ve

### Co the di theo repo

- `seed-users.json`
- `users-backup.json`
- source code frontend/backend

### Khong tu di theo repo

- collection MongoDB hien tai tren may ban
- du lieu san pham trong Mongo neu ban chi nhap thu cong
- du lieu don hang da tao trong Mongo

## 12. Cach mang du lieu user sang may khac

Project hien co 2 cach:

### Cach 1: restore user tu backup

File:

- `shoe-store-backend/users-backup.json`

Chay:

```powershell
cd e:\Kien_HK2_Nam3\ai_shop_app\shoe-store-backend
npm run restore:users
```

Script nay se:

- doc `users-backup.json`
- ket noi MongoDB
- tao moi hoac cap nhat user

### Cach 2: tao user mau

File:

- `shoe-store-backend/seed-users.json`

Chay:

```powershell
cd e:\Kien_HK2_Nam3\ai_shop_app\shoe-store-backend
npm run seed:users
```

Tai khoan mau mac dinh:

- Admin: `admin@gmail.com` / `123456`
- User: `user@gmail.com` / `123456`

## 13. Backup user truoc khi push GitHub

Neu ban vua:

- dang ky them user
- doi mat khau
- doi quyen admin

thi nen backup user truoc khi push:

```powershell
cd e:\Kien_HK2_Nam3\ai_shop_app\shoe-store-backend
npm run backup:users
```

Sau do commit luon file:

```text
shoe-store-backend/users-backup.json
```

## 14. Cac lenh quan trong

### Backend

```powershell
cd shoe-store-backend
npm install
npm start
npm run dev
```

### User scripts

```powershell
npm run seed:users
npm run backup:users
npm run restore:users
```

### Chay truc tiep bang Node

```powershell
node seed_users.js
node backup_users.js
node restore_users_backup.js
```

## 15. API chinh

### Goc API

- `GET /`

### Auth

- `GET /api/auth`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `PUT /api/auth/change-password`
- `GET /api/auth/users`

### Products

- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`

Luu y:

- `POST`, `PUT`, `DELETE` san pham yeu cau token admin

### Orders

- `GET /api/orders`
- `GET /api/orders/myorders/:userId`
- `POST /api/orders`
- `PUT /api/orders/:id`

Luu y:

- Theo code hien tai, route order chua gan middleware `protect`, nhung frontend van gui token khi thanh toan

## 16. Luong du lieu chinh trong app

### Dang ky / dang nhap

1. Frontend gui request toi `api/auth/register` hoac `api/auth/login`
2. Backend tao hoac kiem tra user trong MongoDB
3. Backend tra ve token JWT
4. Frontend luu `token` va `user` vao `sessionStorage`

### Gio hang

1. Frontend luu gio hang trong `localStorage`
2. Gio hang duoc tach theo tung user dang nhap
3. Khi chua dang nhap, cac nut them gio hang va thanh toan da duoc chan o frontend

### Thanh toan

1. Frontend gom item tu gio hang
2. Nguoi dung nhap thong tin mua hang o `checkout.html`
3. Frontend gui `POST /api/orders`
4. Backend luu don hang vao MongoDB

## 17. File frontend quan trong de sua tinh nang

Neu ban muon chinh giao dien hoac hanh vi, day la cac file nen xem truoc:

- `shoe-store-frontend/js/auth.js`
- `shoe-store-frontend/js/products.js`
- `shoe-store-frontend/js/products-enhanced.js`
- `shoe-store-frontend/js/admin.js`
- `shoe-store-frontend/cart.html`
- `shoe-store-frontend/order.html`
- `shoe-store-frontend/checkout.html`
- `shoe-store-frontend/search.html`

## 18. File backend quan trong de sua tinh nang

- `shoe-store-backend/server.js`
- `shoe-store-backend/config/env.js`
- `shoe-store-backend/config/db.js`
- `shoe-store-backend/controllers/authController.js`
- `shoe-store-backend/controllers/productController.js`
- `shoe-store-backend/controllers/orderController.js`
- `shoe-store-backend/middleware/authMiddleware.js`
- `shoe-store-backend/models/User.js`
- `shoe-store-backend/models/Product.js`
- `shoe-store-backend/models/Order.js`

## 19. Loi thuong gap

### Loi `EADDRINUSE: address already in use :::8000`

Nguyen nhan:

- cong `8000` dang bi mot tien trinh khac chiem

Cach xu ly nhanh tren Windows:

```powershell
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

Sau do chay lai:

```powershell
npm start
```

### Frontend mo duoc nhung khong co du lieu

Kiem tra:

- backend da chay chua
- MongoDB da chay chua
- collection san pham co du lieu chua

### Dang nhap khong duoc

Kiem tra:

- backend co dang chay khong
- MongoDB co dang chay khong
- da `restore` hoac `seed` user chua
- email/password dung chua

### Ban pull code ve nhung khong thay user cu

Nguyen nhan:

- du lieu MongoDB local khong di theo Git

Cach xu ly:

1. O may cu chay `npm run backup:users`
2. Commit file `users-backup.json`
3. O may moi pull code
4. Chay `npm run restore:users`

## 20. Goi y quy trinh lam viec an toan

### Khi ban phat trien tren may chinh

1. Chay app
2. Tao hoac sua user/admin
3. Chay `npm run backup:users`
4. Commit code + `users-backup.json`
5. Push GitHub

### Khi may khac pull ve

1. `npm install` trong `shoe-store-backend`
2. Bat MongoDB
3. `npm run restore:users`
4. `npm start`
5. Mo frontend bang Live Server

## 21. Chay nhanh nhat

Neu may da cai san Node.js va MongoDB:

```powershell
cd e:\Kien_HK2_Nam3\ai_shop_app\shoe-store-backend
npm install
npm run restore:users
npm start
```

Sau do mo:

```text
shoe-store-frontend/home.html
```

bang Live Server.

## 22. Ghi chu cuoi

- Backend hien co the chay ngay ca khi khong co `.env`
- MongoDB phai dang chay, nhung khong can mo Compass de bam `Connect`
- User co the backup/restore qua file JSON
- Database local khong tu di theo GitHub
