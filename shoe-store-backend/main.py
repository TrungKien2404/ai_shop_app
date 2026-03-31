"""
FastAPI Backend for Shoe Store Application
"""
import os
from datetime import datetime, timedelta
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, field_validator
import jwt
from passlib.context import CryptContext
from sqlalchemy import Column, Integer, String, DateTime, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# ==================== Configuration ====================
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./db/shoestore.db")
JWT_SECRET = os.getenv("JWT_SECRET", "your_super_secret_jwt_key")
JWT_EXPIRE = int(os.getenv("JWT_EXPIRE", "604800"))  # 7 days in seconds
PORT = int(os.getenv("PORT", 5000))
NODE_ENV = os.getenv("NODE_ENV", "development")

# ==================== Database Setup ====================
os.makedirs("./db", exist_ok=True)

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ==================== Models (SQLAlchemy) ====================
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    fullname = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    avatar = Column(String, nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# Create tables
Base.metadata.create_all(bind=engine)
print("✅ Database initialized")

# ==================== Pydantic Models (Request/Response) ====================
class UserBase(BaseModel):
    fullname: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    avatar: Optional[str] = None


class UserCreate(BaseModel):
    fullname: str
    email: EmailStr
    password: str
    confirmPassword: str

    @field_validator("fullname")
    @classmethod
    def validate_fullname(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError("Full name is required")
        if len(v) < 3:
            raise ValueError("Full name must be at least 3 characters")
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        if not v or len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v

    @field_validator("confirmPassword")
    @classmethod
    def validate_confirm_password(cls, v, info):
        if "password" in info.data and v != info.data["password"]:
            raise ValueError("Passwords do not match")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    fullname: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    avatar: Optional[str] = None

    class Config:
        from_attributes = True


class SignupResponse(BaseModel):
    success: bool
    message: str
    token: str
    user: UserResponse


class LoginResponse(BaseModel):
    success: bool
    message: str
    token: str
    user: UserResponse


class ErrorResponse(BaseModel):
    success: bool
    message: str
    errors: Optional[list] = None


# ==================== Password Hashing ====================
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


# ==================== JWT Token ====================
def create_token(user_id: int) -> str:
    """Generate JWT token"""
    payload = {
        "userId": user_id,
        "exp": datetime.utcnow() + timedelta(seconds=JWT_EXPIRE),
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def verify_token(token: str) -> dict:
    """Verify JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired. Please login again"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )


# ==================== Database Dependency ====================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ==================== Authentication Dependency ====================
def get_current_user(db: Session = Depends(get_db)) -> User:
    """Extract and verify user from Authorization header"""
    from fastapi import Request
    # This will be handled in routes
    pass


# ==================== FastAPI App ====================
app = FastAPI(
    title="Shoe Store Backend API",
    description="Backend API for Shoe Store application",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== Routes ====================

@app.get("/")
def read_root():
    """Welcome endpoint"""
    return {
        "message": "Welcome to Shoe Store Backend API",
        "version": "1.0.0",
        "database": "SQLite"
    }


@app.post("/api/auth/signup", response_model=SignupResponse)
def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User already exists with this email"
            )

        # Create new user
        new_user = User(
            fullname=user_data.fullname,
            email=user_data.email,
            password=hash_password(user_data.password)
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # Generate token
        token = create_token(new_user.id)

        return SignupResponse(
            success=True,
            message="User registered successfully",
            token=token,
            user=UserResponse.model_validate(new_user)
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Signup error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Signup failed"
        )


@app.post("/api/auth/login", response_model=LoginResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login user"""
    try:
        # Find user by email
        user = db.query(User).filter(User.email == credentials.email).first()
        if not user or not verify_password(credentials.password, user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        # Generate token
        token = create_token(user.id)

        return LoginResponse(
            success=True,
            message="Login successful",
            token=token,
            user=UserResponse.model_validate(user)
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )


@app.get("/api/auth/me", response_model=UserResponse)
def get_me(request: Request, db: Session = Depends(get_db)):
    """Get current user info"""
    try:
        # Extract token from Authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No token provided. Please login first"
            )

        token = auth_header.split(" ")[1]
        payload = verify_token(token)
        user_id = payload.get("userId")

        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )

        return UserResponse.model_validate(user)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Get user error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user info"
        )


@app.put("/api/auth/update", response_model=UserResponse)
def update_profile(
    updates: UserBase,
    request: Request,
    db: Session = Depends(get_db)
):
    """Update user profile"""
    try:
        # Extract token from Authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No token provided. Please login first"
            )

        token = auth_header.split(" ")[1]
        payload = verify_token(token)
        user_id = payload.get("userId")

        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )

        # Update fields
        if updates.fullname:
            user.fullname = updates.fullname
        if updates.phone:
            user.phone = updates.phone
        if updates.address:
            user.address = updates.address
        if updates.avatar:
            user.avatar = updates.avatar

        user.updatedAt = datetime.utcnow()
        db.commit()
        db.refresh(user)

        return UserResponse.model_validate(user)
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Update profile error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )


@app.post("/api/auth/logout")
def logout(request: Request):
    """Logout user (token validation only)"""
    try:
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No token provided"
            )

        token = auth_header.split(" ")[1]
        verify_token(token)

        return {
            "success": True,
            "message": "Logged out successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Logout error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout failed"
        )


# ==================== Error Handlers ====================
@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle general exceptions"""
    print(f"Error: {str(exc)}")
    return {
        "success": False,
        "message": str(exc) if NODE_ENV == "development" else "Something went wrong!",
        "error": str(exc) if NODE_ENV == "development" else None
    }


if __name__ == "__main__":
    import uvicorn
    print(f"🚀 Server running on port {PORT}")
    uvicorn.run("main:app", host="127.0.0.1", port=5000, reload=True)
