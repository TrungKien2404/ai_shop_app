# FastAPI Backend - Shoe Store API

This is a FastAPI backend for the Shoe Store application, providing authentication and user management endpoints.

## Features

- ✅ User Registration (Signup)
- ✅ User Login with JWT Authentication
- ✅ JWT Token Verification
- ✅ User Profile Management
- ✅ Password Hashing with bcryptjs
- ✅ SQLite Database
- ✅ CORS Support for Frontend
- ✅ Input Validation
- ✅ Error Handling

## Prerequisites

- Python 3.8+
- pip (Python package manager)

## Installation

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 2. Setup Environment Variables

The `.env` file is already configured with default values. You can modify it as needed:

```bash
# .env file
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=604800  # 7 days in seconds
DATABASE_URL=sqlite:///./db/shoestore.db
```

### 3. Database Setup

The database is automatically created when you start the server. SQLite will create `db/shoestore.db`.

## Running the Server

### Development Mode (with auto-reload)

```bash
# Using Python directly
python main.py

# Or using uvicorn with --reload for development
uvicorn main:app --reload --host 0.0.0.0 --port 5000
```

### Production Mode

```bash
uvicorn main:app --host 0.0.0.0 --port 5000
```

The server will start at `http://localhost:5000`

## API Endpoints

### Base URL
```
http://localhost:5000
```

### Authentication Routes

#### 1. **Signup (Register)**
```
POST /api/auth/signup
Content-Type: application/json

{
  "fullname": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}

Response (201):
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "fullname": "John Doe",
    "email": "john@example.com"
  }
}
```

#### 2. **Login**
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response (200):
{
  "success": true,
  "message": "Login successful",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "fullname": "John Doe",
    "email": "john@example.com"
  }
}
```

#### 3. **Get Current User**
```
GET /api/auth/me
Authorization: Bearer <token>

Response (200):
{
  "id": 1,
  "fullname": "John Doe",
  "email": "john@example.com",
  "phone": null,
  "address": null,
  "avatar": null
}
```

#### 4. **Update Profile**
```
PUT /api/auth/update
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullname": "John Doe Updated",
  "phone": "1234567890",
  "address": "123 Main St",
  "avatar": "avatar_url"
}

Response (200):
{
  "id": 1,
  "fullname": "John Doe Updated",
  "email": "john@example.com",
  "phone": "1234567890",
  "address": "123 Main St",
  "avatar": "avatar_url"
}
```

#### 5. **Logout**
```
POST /api/auth/logout
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Testing with Frontend

The frontend JavaScript code is already configured to communicate with this backend. Make sure:

1. The backend is running on `http://localhost:5000`
2. Open the frontend HTML files in a browser
3. Test signup/login functionality

## Validation Rules

### Signup Validation
- **Full Name**: Required, minimum 3 characters
- **Email**: Valid email format, unique in database
- **Password**: Minimum 6 characters
- **Confirm Password**: Must match password

### Login Validation
- **Email**: Valid email format
- **Password**: Required

## Response Format

All responses follow a consistent JSON format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* optional */ }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ /* optional validation errors */ ]
}
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fullname TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  avatar TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## Security Features

- ✅ **Password Hashing**: Uses bcrypt for secure password storage
- ✅ **JWT Authentication**: Stateless token-based authentication
- ✅ **CORS**: Configured to work with frontend
- ✅ **Input Validation**: Pydantic models for request validation
- ✅ **Token Expiration**: Tokens expire after 7 days

## Development Notes

### Adding New Endpoints

To add new endpoints to the API:

1. Create a Pydantic model for request/response data
2. Add the route handler to `main.py`
3. Use `Depends(get_db)` to get database sessions
4. Extract JWT token from `Authorization` header if needed

### Environment Variables

- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment mode (development/production)
- `JWT_SECRET`: Secret key for JWT signing (change in production!)
- `JWT_EXPIRE`: Token expiration time in seconds (default: 604800 = 7 days)
- `DATABASE_URL`: SQLite database connection string

## Troubleshooting

### Database Issues
- Delete `db/shoestore.db` and restart the server to reset the database

### Port Already in Use
- Change the `PORT` in `.env` file

### Token Validation Failed
- Make sure the `Authorization` header includes "Bearer " prefix
- Check that the token hasn't expired

### CORS Errors
- CORS is enabled for all origins. If you need to restrict it, modify the CORS middleware in `main.py`

## Converting from Node.js Express

This FastAPI backend replaces the original Node.js Express backend with the same API interface:

**Original Stack**: Node.js + Express + SQLite

**New Stack**: Python + FastAPI + SQLite

**Benefits**:
- ✅ Identical API endpoints
- ✅ Same database structure
- ✅ No frontend changes required
- ✅ Better performance
- ✅ Type safety with Pydantic
- ✅ Automatic API documentation at `/docs`

## API Documentation

FastAPI automatically generates interactive API documentation:

- **Swagger UI**: http://localhost:5000/docs
- **ReDoc**: http://localhost:5000/redoc

Visit these URLs to explore and test the API interactively!

## License

ISC
