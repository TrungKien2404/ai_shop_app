# ✅ Verification Checklist - FastAPI Backend

Use this checklist to verify the FastAPI backend is working correctly.

---

## 📋 Pre-Installation Checklist

Nothing to do before installation! Just verify:

- [ ] **Python 3.8+** is installed
  ```bash
  python --version
  # Should show: Python 3.8.x or higher
  ```

- [ ] **pip** is available
  ```bash
  pip --version
  # Should show version
  ```

- [ ] Open file explorer to: `e:\Kien_HK2_Nam3\ai_shop_app\shoe-store-backend\`

---

## 🔧 Installation Checklist

- [ ] Navigate to backend folder in terminal:
  ```bash
  cd e:\Kien_HK2_Nam3\ai_shop_app\shoe-store-backend
  ```

- [ ] Install dependencies:
  ```bash
  pip install -r requirements.txt
  ```
  ✅ Should complete without errors

- [ ] Verify requirements installed:
  ```bash
  pip list | findstr fastapi
  # Should show: fastapi and other packages
  ```

---

## 🚀 Startup Checklist

- [ ] Start the backend:
  ```bash
  python main.py
  ```

- [ ] Verify output shows:
  - [ ] `✅ Database initialized`
  - [ ] `🚀 Server running on port 5000`
  - [ ] `INFO:     Uvicorn running...`

- [ ] **Server running status**: ✅ Running = Success ❌ Errors = Check logs

---

## 🌐 Endpoint Verification

### Check if backend is responding:

- [ ] Test main endpoint in browser:
  - Open: http://localhost:5000/
  - Should see: JSON with `"message": "Welcome to Shoe Store Backend API"`

- [ ] Check API documentation:
  - [ ] Swagger UI: http://localhost:5000/docs
  - [ ] ReDoc: http://localhost:5000/redoc
  - Both should show interactive API documentation

---

## 🧪 API Testing Checklist

### Test Signup Endpoint:

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "Test User",
    "email": "test123@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

- [ ] Response status: 201 (Created)
- [ ] Response includes: `success: true`
- [ ] Response includes: `token` (JWT token)
- [ ] Response includes: `user` with id, fullname, email

### Test Login Endpoint:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test123@example.com",
    "password": "password123"
  }'
```

- [ ] Response status: 200 (OK)
- [ ] Response includes: `success: true`
- [ ] Response includes: `token` (JWT token)

### Test Get Me Endpoint:

```bash
# Replace YOUR_TOKEN with the token from login response
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

- [ ] Response status: 200 (OK)
- [ ] Response includes user info: id, fullname, email

---

## 📱 Frontend Integration Check

### Test with Frontend:

- [ ] Open `e:\Kien_HK2_Nam3\ai_shop_app\shoe-store-frontend\index.html` in browser

- [ ] Try **Signup**:
  - [ ] Fill in name, email, password
  - [ ] Click signup button
  - [ ] Should succeed with alert "Đăng ký thành công!"
  - [ ] Should redirect to home page

- [ ] Try **Login**:
  - [ ] Use same email and password
  - [ ] Click login button
  - [ ] Should succeed with alert "Đăng nhập thành công!"
  - [ ] Should see user menu at top

- [ ] Check **Developer Tools** (F12):
  - [ ] Go to Console tab
  - [ ] Look for any red errors
  - [ ] Should see no JavaScript errors

---

## 💾 Database Verification

### Check Database:

- [ ] Verify database file exists:
  ```bash
  # File should exist at:
  e:\Kien_HK2_Nam3\ai_shop_app\shoe-store-backend\db\shoestore.db
  ```

- [ ] Install DB Browser (optional):
  - Download: https://sqlitebrowser.org/
  - Open the `shoestore.db` file
  - Look for `users` table with test data

- [ ] Or use command line:
  ```bash
  sqlite3 db/shoestore.db
  SELECT * FROM users;
  .quit
  ```

---

## ⚙️ Configuration Verification

### Check Environment:

- [ ] `.env` file exists and has correct values:
  ```bash
  PORT=5000
  NODE_ENV=development
  JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
  JWT_EXPIRE=604800
  DATABASE_URL=sqlite:///./db/shoestore.db
  ```

- [ ] `.env.example` exists (reference file)

---

## 🐛 Troubleshooting Checklist

If something fails, check these:

### Backend won't start:
- [ ] Is Python installed? `python --version`
- [ ] Are dependencies installed? `pip install -r requirements.txt`
- [ ] Is port 5000 already in use? Change `PORT` in `.env`
- [ ] Any error messages? Check the terminal output

### Frontend can't connect:
- [ ] Is backend running? Check `http://localhost:5000/`
- [ ] Check browser console (F12) for errors
- [ ] Check that frontend is on correct port
- [ ] Try hard refresh (Ctrl+F5)

### Database errors:
- [ ] Delete `db/shoestore.db`
- [ ] Restart backend with `python main.py`
- [ ] Database will be recreated automatically

### Port 5000 already in use:
```bash
# Windows - find and kill process
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change port in .env
PORT=5001
```

---

## ✨ Advanced Verification

### Test all endpoints:

- [ ] `GET /` - Welcome message
- [ ] `POST /api/auth/signup` - Create new user
- [ ] `POST /api/auth/login` - Login user
- [ ] `GET /api/auth/me` - Get current user (with token)
- [ ] `PUT /api/auth/update` - Update profile (with token)
- [ ] `POST /api/auth/logout` - Logout (with token)

### Monitor performance:

- [ ] Response time is fast (< 100ms)
- [ ] Can handle multiple requests
- [ ] No memory leaks
- [ ] No error messages

---

## 📊 Final Status

| Component | Status | Notes |
|-----------|--------|-------|
| Python installed | ✅ | |
| Dependencies installed | ✅ | |
| Backend running | ✅ | |
| API responding | ✅ | |
| Frontend connected | ✅ | |
| Database working | ✅ | |
| Signup working | ✅ | |
| Login working | ✅ | |
| No errors | ✅ | |

---

## 🎉 Success!

If all checkboxes are marked ✅, your FastAPI backend is **fully operational**!

### Next Steps:

1. ✅ Keep backend running while developing
2. ✅ Test all features on frontend
3. ✅ Add new features as needed
4. ✅ Document any changes
5. ✅ Deploy to production when ready

---

## 📞 Quick Reference

| Task | Command |
|------|---------|
| Install | `pip install -r requirements.txt` |
| Start | `python main.py` |
| Dev mode | `uvicorn main:app --reload` |
| Test signup | See [API Testing Checklist](#-api-testing-checklist) |
| View docs | http://localhost:5000/docs |
| Reset DB | `rm db/shoestore.db` |
| Check logs | Look at terminal output |

---

**Congratulations! Your FastAPI backend is ready to go! 🚀**
