# 🚀 Quick Start - FastAPI Backend

## Installation (First Time Only)

```bash
# 1. Navigate to backend folder
cd shoe-store-backend

# 2. Install Python dependencies
pip install -r requirements.txt

# 3. Start the server
python main.py
```

## Running the Server

### Once installed, just run:

```bash
cd shoe-store-backend
python main.py
```

### Server will start at:
- **API Base**: http://localhost:5000
- **Swagger UI (API Docs)**: http://localhost:5000/docs
- **ReDoc (API Docs)**: http://localhost:5000/redoc

## For Development (auto-reload)

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 5000
```

## Test Endpoints

### Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

## Frontend Connection

The frontend at `shoe-store-frontend/` already calls the API at `http://localhost:5000/api/auth`

Just open the frontend in a browser and test!

## Database

SQLite database is automatically created at: `db/shoestore.db`

To reset:
```bash
rm db/shoestore.db
python main.py
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `ModuleNotFoundError` | Run `pip install -r requirements.txt` |
| `Port 5000 in use` | Change PORT in .env or kill process on port 5000 |
| `Database error` | Delete `db/shoestore.db` and restart |

## Documentation

- Full API docs: [FASTAPI_README.md](./FASTAPI_README.md)
- Migration guide: [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
