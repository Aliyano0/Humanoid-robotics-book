"""
Better-Auth integration for FastAPI server
This file contains the authentication endpoints for the Humanoid Robotics textbook site.
"""
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.responses import JSONResponse, RedirectResponse
from typing import Optional
import os
import json
from datetime import datetime, timedelta
import secrets
import bcrypt
from pydantic import BaseModel
from functools import wraps


# Mock database for development
users_db = {}
sessions_db = {}

# Models
class User(BaseModel):
    id: str
    email: str
    name: str
    backgroundInfo: Optional[dict] = None
    createdAt: str
    updatedAt: str
    emailVerified: Optional[str] = None


class SignUpRequest(BaseModel):
    email: str
    password: str
    name: str
    backgroundInfo: Optional[dict] = None


class LoginRequest(BaseModel):
    email: str
    password: str


class BetterAuth:
    """
    A simplified Better-Auth implementation for the FastAPI server
    """
    def __init__(self):
        self.secret = os.getenv("AUTH_SECRET", "default-secret-key-change-in-production")

    def hash_password(self, password: str) -> str:
        """Hash a password using bcrypt"""
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    def verify_password(self, password: str, hashed: str) -> bool:
        """Verify a password against its hash"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

    def create_token(self, user_id: str) -> str:
        """Create a simple JWT-like token"""
        import time
        import jwt

        payload = {
            "user_id": user_id,
            "exp": datetime.utcnow() + timedelta(days=30),  # 30 days expiration
            "iat": int(time.time())
        }

        token = jwt.encode(payload, self.secret, algorithm="HS256")
        return token

    def verify_token(self, token: str) -> Optional[str]:
        """Verify a token and return the user_id if valid"""
        try:
            import jwt
            payload = jwt.decode(token, self.secret, algorithms=["HS256"])
            return payload.get("user_id")
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None

    def create_session(self, user_id: str) -> dict:
        """Create a new session for a user"""
        token = self.create_token(user_id)

        session_data = {
            "token": token,
            "user_id": user_id,
            "created_at": datetime.utcnow().isoformat(),
            "expires_at": (datetime.utcnow() + timedelta(days=30)).isoformat()
        }

        # Store in mock database
        sessions_db[token] = session_data

        return session_data

    def get_user_by_token(self, token: str) -> Optional[dict]:
        """Get user information based on session token"""
        session_data = sessions_db.get(token)
        if not session_data:
            return None

        user_id = session_data.get("user_id")
        return users_db.get(user_id)

    def authenticate_user(self, email: str, password: str) -> Optional[dict]:
        """Authenticate a user by email and password"""
        user = next((u for u in users_db.values() if u["email"] == email), None)
        if not user:
            return None

        if not self.verify_password(password, user["password_hash"]):
            return None

        # Remove password hash from returned user data
        user_copy = user.copy()
        del user_copy["password_hash"]
        return user_copy


# Initialize BetterAuth
auth = BetterAuth()


def require_auth(request: Request):
    """Dependency to require authentication"""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authorization header missing or invalid")

    token = auth_header[7:]  # Remove "Bearer " prefix
    user_id = auth.verify_token(token)

    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = users_db.get(user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user


def register_auth_routes(app: FastAPI):
    """Register authentication routes with the FastAPI app"""

    @app.post("/api/auth/signup")
    async def signup(request: SignUpRequest):
        """Register a new user"""
        try:
            # Check if user already exists
            existing_user = next((u for u in users_db.values() if u["email"] == request.email), None)
            if existing_user:
                raise HTTPException(status_code=409, detail="Email already registered")

            # Create new user
            user_id = f"user_{secrets.token_hex(8)}"
            user = {
                "id": user_id,
                "email": request.email,
                "name": request.name,
                "password_hash": auth.hash_password(request.password),
                "backgroundInfo": request.backgroundInfo,
                "createdAt": datetime.utcnow().isoformat(),
                "updatedAt": datetime.utcnow().isoformat(),
                "emailVerified": datetime.utcnow().isoformat() if os.getenv("EMAIL_VERIFICATION", "false").lower() == "false" else None
            }

            # Store in mock database
            users_db[user_id] = user

            # Create session
            session = auth.create_session(user_id)

            # Remove password hash from response
            user_response = user.copy()
            del user_response["password_hash"]

            return {
                "user": user_response,
                "session": session,
                "token": session["token"]
            }
        except HTTPException:
            raise
        except Exception as e:
            print(f"Signup error: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")

    @app.post("/api/auth/login")
    async def login(request: LoginRequest):
        """Login a user"""
        try:
            # Authenticate user
            user = auth.authenticate_user(request.email, request.password)
            if not user:
                raise HTTPException(status_code=401, detail="Invalid email or password")

            # Create session
            session = auth.create_session(user["id"])

            return {
                "user": user,
                "session": session,
                "token": session["token"]
            }
        except HTTPException:
            raise
        except Exception as e:
            print(f"Login error: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")

    @app.get("/api/auth/me")
    async def get_current_user(current_user: dict = Depends(require_auth)):
        """Get current user information"""
        return {"user": current_user}

    @app.post("/api/auth/logout")
    async def logout(request: Request):
        """Logout current user"""
        try:
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header[7:]
                # Remove session from database
                if token in sessions_db:
                    del sessions_db[token]

            return {"message": "Logged out successfully"}
        except Exception as e:
            print(f"Logout error: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")

    @app.get("/api/auth/oauth/google")
    async def google_oauth():
        """Google OAuth endpoint"""
        # In a real implementation, this would redirect to Google's OAuth
        # For now, we'll return a placeholder that would be handled by the frontend
        return RedirectResponse(url=f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/oauth/google/callback")

    @app.get("/api/auth/oauth/github")
    async def github_oauth():
        """GitHub OAuth endpoint"""
        # In a real implementation, this would redirect to GitHub's OAuth
        # For now, we'll return a placeholder that would be handled by the frontend
        return RedirectResponse(url=f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/oauth/github/callback")


# Example of how to use this in your main FastAPI app
if __name__ == "__main__":
    from fastapi.middleware.cors import CORSMiddleware

    app = FastAPI()

    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # In production, specify your frontend domain
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register auth routes
    register_auth_routes(app)

    @app.get("/")
    def read_root():
        return {"message": "Better-Auth FastAPI integration running"}

    # Run with uvicorn: uvicorn main:app --reload --port 8000