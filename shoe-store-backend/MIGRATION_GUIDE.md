# Migration from Node.js Express to FastAPI

This guide explains how to migrate from the Node.js Express backend to the new FastAPI backend.

## Overview

The Shoe Store backend has been converted from Node.js + Express to **Python + FastAPI** while maintaining **100% API compatibility**. This means:

✅ **No frontend changes required**  
✅ **Same endpoints and response format**  
✅ **Same database structure**  
✅ **Same JWT authentication**

## What Changed

| Aspect | Before (Node.js) | After (FastAPI) |
|--------|------------------|-----------------|
| **Framework** | Express.js | FastAPI |
| **Language** | JavaScript | Python |
| **Server** | Node.js + Express | Uvicorn |
| **Database** | SQLite + sqlite3 | SQLite + SQLAlchemy |
| **Password Hashing** | bcryptjs | passlib + bcrypt |
| **JWT** | jsonwebtoken | PyJWT |
| **Validation** | validator.js | Pydantic |
| **Async** | Callbacks/Promises | async/await |

## What Stayed the Same

### ✅ API Endpoints
All endpoints remain identical:
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PUT /api/auth/update`
- `POST /api/auth/logout`

### ✅ Request/Response Format
```javascript
// Signup Request (JavaScript)
fetch('http://localhost:5000/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fullname: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    confirmPassword: 'password123'
  })
});

// Response remains the same
{
  "success": true,
  "message": "User registered successfully",
  "token": "...",
  "user": { "id": 1, "fullname": "John Doe", "email": "john@example.com" }
}
```

### ✅ Authentication
JWT tokens work the same way:
```javascript
// Authorization header remains unchanged
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

### ✅ Database
The SQLite database structure is identical:
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  fullname TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  avatar TEXT,
  createdAt DATETIME,
  updatedAt DATETIME
)
```

## Installation Steps

### 1. Stop the Old Node.js Server

If the Node.js server is running:
```bash
# Press Ctrl+C in the terminal running Node.js server
```

### 2. Install Python Dependencies

```bash
cd shoe-store-backend
pip install -r requirements.txt
```

**Note**: Python 3.8+ is required. Check your Python version:
```bash
python --version
```

### 3. Start the FastAPI Server

```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 5000
```

The server will output:
```
✅ Database initialized
🚀 Server running on port 5000
```

### 4. Test the Connection

**Option A**: Test with frontend
- Open `shoe-store-frontend/index.html` in a browser
- Try signup/login - should work exactly as before!

**Option B**: Test with curl
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Option C**: Interactive API Docs
- Visit http://localhost:5000/docs (Swagger UI)
- Visit http://localhost:5000/redoc (ReDoc)

## File Structure Changes

### Old Node.js Structure
```
shoe-store-backend/
├── package.json
├── src/
│   ├── index.js              (Express app)
│   ├── config/
│   │   └── database.js       (SQLite connection)
│   ├── controllers/
│   │   └── authController.js
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   └── authRoutes.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   └── utils/
│       └── validator.js
└── db/
    └── shoestore.db
```

### New FastAPI Structure
```
shoe-store-backend/
├── main.py                   (FastAPI app - all-in-one)
├── requirements.txt          (Python dependencies)
├── .env                      (Configuration)
├── old/                      (Original Node.js files - keep for reference)
│   ├── package.json
│   ├── src/
│   └── ...
└── db/
    └── shoestore.db
```

## Running Both Versions

You can keep the Node.js code for reference but not run it simultaneously:

```bash
# Option 1: Run only FastAPI
python main.py

# Option 2: Run Node.js (if needed)
cd shoe-store-backend
npm install
npm start
```

## environment Configuration

The `.env` file has been updated for FastAPI:

```bash
# Old (Node.js)
JWT_EXPIRE=7d

# New (FastAPI)
JWT_EXPIRE=604800  # 7 days in seconds
```

Other variables remain compatible:
```bash
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
DATABASE_URL=sqlite:///./db/shoestore.db
```

## Troubleshooting Migration

### ❌ "Python not found"
**Solution**: Install Python 3.8+ from python.org

### ❌ "ModuleNotFoundError"
**Solution**: Make sure dependencies are installed
```bash
pip install -r requirements.txt
```

### ❌ "Port already in use"
**Solution**: Check if another server is running
```bash
# On Windows
netstat -ano | findstr :5000

# On Mac/Linux
lsof -i :5000

# Kill the process or change PORT in .env
```

### ❌ "Database errors"
**Solution**: Delete the old database and let FastAPI recreate it
```bash
rm db/shoestore.db
python main.py
```

### ❌ "Token validation fails"
**Solution**: Make sure the authorization header format is correct
```javascript
// Correct
headers: { 'Authorization': 'Bearer ' + token }

// Wrong (no "Bearer " prefix)
headers: { 'Authorization': token }
```

## Frontend Compatibility

**Good news**: The frontend needs **NO CHANGES**!

The existing JavaScript code in `shoe-store-frontend/js/auth.js` will work without modification because:

1. ✅ All endpoints have the same URL paths
2. ✅ All requests/responses have the same format
3. ✅ Authentication mechanism is identical

The frontend will automatically connect to the FastAPI backend as long as it's running on `http://localhost:5000`.

## Performance Improvements

FastAPI provides several improvements over Express:

- **Async Support**: Native async/await in Python
- **Type Hints**: Built-in input validation with Pydantic
- **Automatic Docs**: Interactive API documentation
- **Better Error Handling**: Structured exception handling
- **Higher Performance**: Generally faster request handling

## Database Data

Your existing user data in `db/shoestore.db` is **preserved**. The FastAPI backend uses the same SQLite database:

✅ All existing users can still login  
✅ All existing sessions/data remain  
✅ No data migration needed

## Reverting to Node.js (if needed)

If you need to go back to Node.js:

```bash
# Stop FastAPI server (Ctrl+C)

# Start Node.js server
npm install
npm start
```

The database remains compatible with both backends.

## Next Steps

1. ✅ Verify the backend is running: `http://localhost:5000`
2. ✅ Test frontend functionality: signup, login, profile
3. ✅ Check API documentation: `http://localhost:5000/docs`
4. ✅ Deploy to the cloud if ready

## Support & Troubleshooting

For more details, see:
- [FastAPI README](./FASTAPI_README.md) - API documentation
- [FastAPI Official Docs](https://fastapi.tiangolo.com) - Framework documentation
- [Pydantic Docs](https://docs.pydantic.dev) - Validation documentation

## Summary

| Task | Status |
|------|--------|
| Backend converted to FastAPI | ✅ Complete |
| All endpoints preserved | ✅ Complete |
| Database compatibility | ✅ Complete |
| Frontend compatibility | ✅ No changes needed |
| Installation guide | ✅ This document |
| Documentation | ✅ FASTAPI_README.md |

**You're all set!** The backend is now running on FastAPI. 🚀
