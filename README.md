# AI Shop App

Project web ban giay duoc tach thanh 2 phan:

- Frontend: `shoe-store-frontend/`
- Backend: `shoe-store-backend/`
- Database: PostgreSQL chay bang Docker service `db`

Project da duoc chuan hoa de nguoi cham chi can chay mot lenh sau khi clone repo.

## 1. Cau truc va file quan trong

- `docker-compose.yml`: khoi dong dong thoi PostgreSQL, backend Node.js va frontend Nginx.
- `shoe-store-backend/package.json`: dependencies va lenh `npm start`.
- `shoe-store-backend/Dockerfile`: build image backend, tu dong chay script seed truoc khi start server.
- `shoe-store-backend/docker-entrypoint.sh`: goi `check-and-seed.js` roi moi chay backend.
- `shoe-store-backend/config/db.js`: cau hinh Sequelize ket noi PostgreSQL.
- `shoe-store-frontend/Dockerfile`: build image frontend static bang Nginx.
- `shoe-store-frontend/nginx.conf`: phuc vu file frontend va proxy `/api` sang backend.
- `.env.example`: bien moi truong mac dinh de chay local.
- `setup.bat`: script chay nhanh tren Windows.
- `setup.sh`: script chay nhanh tren macOS/Linux.

## 2. Cach chay cho nguoi cham

Windows:

```bat
setup.bat
```

macOS/Linux:

```bash
chmod +x setup.sh
./setup.sh
```

Sau khi script chay xong:

- Frontend: `http://localhost:3000`
- Backend/API: `http://localhost:8000`
- Database: `postgresql://postgres:password123@localhost:5432/shoe_shop`

## 3. Tai khoan test

Admin:

- Email: `admin@gmail.com`
- Password: `123456`

User:

- Email: `user@gmail.com`
- Password: `123456`

Ngoai ra he thong con tao san cac tai khoan shipper phuc vu demo.

## 4. Script da lam gi

Ca `setup.bat` va `setup.sh` deu tu dong:

- Kiem tra Docker da cai chua
- Kiem tra Docker Compose co san hay khong
- Tao `.env` tu `.env.example` neu file `.env` chua ton tai
- Dung cac container cu cua project neu dang ton tai
- Build lai image
- Chay lai toan bo project bang Docker Compose
- In ra link frontend, backend, database va tai khoan test

## 5. Database va seed data

Project dung PostgreSQL trong Docker, khong can cai PostgreSQL tren may nguoi cham.

Du lieu duoc khoi tao tu:

- `shoe-store-backend/seed_data.json`: danh sach san pham
- `shoe-store-backend/seed-users.json`: tai khoan admin va user
- `shoe-store-backend/check-and-seed.js`: dam bao du lieu test luon ton tai moi lan container backend khoi dong

Neu database rong, backend se tu dong seed san pham va tai khoan.
Neu database da ton tai, backend van kiem tra lai de bo sung/cap nhat tai khoan test neu bi thieu.

## 6. Moi file dung de lam gi

- `docker-compose.yml`: file trung tam de chay 3 service `db`, `backend`, `frontend` tu thu muc goc.
- `shoe-store-backend/Dockerfile`: tao image Node.js cho API.
- `shoe-store-frontend/Dockerfile`: tao image Nginx de phuc vu frontend static.
- `setup.bat`: lenh chay nhanh cho Windows.
- `setup.sh`: lenh chay nhanh cho macOS/Linux.
- `.env.example`: gia tri mac dinh de project chay duoc ngay sau khi clone.
- `README.md`: huong dan nop bai, cai dat va xu ly loi thong dung.

## 7. Loi thuong gap va cach sua

- Docker khong mo duoc:
  Hay mo Docker Desktop truoc, doi den khi Docker daemon san sang roi chay lai script.

- Loi port `3000`, `8000` hoac `5432` da duoc su dung:
  Sua file `.env` de doi `FRONTEND_PORT`, `BACKEND_PORT`, `DB_PORT_FORWARD`, sau do chay lai `setup.bat` hoac `./setup.sh`.

- Frontend len nhung khong goi duoc API:
  Chay `docker compose ps` de kiem tra service `backend` co dang `Up` hay khong.

- Muon reset database ve trang thai seed ban dau:

```bash
docker compose down -v
docker compose up --build -d
```

## 8. Ghi chu nop bai

- Khong can cai Node.js tren may nguoi cham neu dung Docker.
- Khong phu thuoc vao file `.env` rieng chua duoc commit.
- `docker compose up --build` chay duoc tu thu muc goc project.
- Frontend proxy API dung service name `backend`, tranh loi proxy sai ten container.
