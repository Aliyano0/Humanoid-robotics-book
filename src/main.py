import logging
import json
from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os
from typing import Dict, Any, Optional
from uuid import uuid4
import datetime
import secrets
import bcrypt
import jwt
from pydantic import BaseModel
from datetime import datetime as dt, timedelta

# Authentication models
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
        """Create a JWT token"""
        payload = {
            "user_id": user_id,
            "exp": dt.utcnow() + timedelta(days=30),  # 30 days expiration
            "iat": int(dt.utcnow().timestamp())
        }

        token = jwt.encode(payload, self.secret, algorithm="HS256")
        return token

    def verify_token(self, token: str) -> Optional[str]:
        """Verify a token and return the user_id if valid"""
        try:
            payload = jwt.decode(token, self.secret, algorithms=["HS256"])
            return payload.get("user_id")
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None

    def create_session(self, user_id: str) -> dict:
        """Create a new session for a user and store in database"""
        token = self.create_token(user_id)
        expires_at = dt.utcnow() + timedelta(days=30)

        session_data = {
            "token": token,
            "user_id": user_id,
            "created_at": dt.utcnow().isoformat(),
            "expires_at": expires_at.isoformat()
        }

        # Store in database
        try:
            with db.get_cursor() as cursor:
                cursor.execute("""
                    INSERT INTO auth_sessions (token, user_id, created_at, expires_at)
                    VALUES (%s, %s, NOW(), %s)
                """, (token, user_id, expires_at))
        except Exception as e:
            logger.error(f"Error creating session: {e}")

        return session_data

    def get_user_by_token(self, token: str) -> Optional[dict]:
        """Get user information based on session token"""
        try:
            with db.get_cursor() as cursor:
                # Check if session exists and is not expired
                cursor.execute("""
                    SELECT s.user_id, u.id, u.email, u.name, u.background_info,
                           u.created_at, u.updated_at, u.email_verified_at
                    FROM auth_sessions s
                    JOIN users u ON s.user_id = u.id
                    WHERE s.token = %s AND s.expires_at > NOW()
                """, (token,))
                result = cursor.fetchone()

                if not result:
                    return None

                return {
                    "id": result["id"],
                    "email": result["email"],
                    "name": result["name"],
                    "backgroundInfo": result["background_info"],
                    "createdAt": result["created_at"].isoformat() if result["created_at"] else None,
                    "updatedAt": result["updated_at"].isoformat() if result["updated_at"] else None,
                    "emailVerified": result["email_verified_at"].isoformat() if result["email_verified_at"] else None,
                }
        except Exception as e:
            logger.error(f"Error getting user by token: {e}")
            return None

    def authenticate_user(self, email: str, password: str) -> Optional[dict]:
        """Authenticate a user by email and password"""
        try:
            with db.get_cursor() as cursor:
                cursor.execute("""
                    SELECT id, email, name, password_hash, background_info,
                           created_at, updated_at, email_verified_at
                    FROM users
                    WHERE email = %s
                """, (email,))
                result = cursor.fetchone()

                if not result:
                    return None

                # Verify password
                if not self.verify_password(password, result["password_hash"]):
                    return None

                # Return user data without password hash
                return {
                    "id": result["id"],
                    "email": result["email"],
                    "name": result["name"],
                    "backgroundInfo": result["background_info"],
                    "createdAt": result["created_at"].isoformat() if result["created_at"] else None,
                    "updatedAt": result["updated_at"].isoformat() if result["updated_at"] else None,
                    "emailVerified": result["email_verified_at"].isoformat() if result["email_verified_at"] else None,
                }
        except Exception as e:
            logger.error(f"Error authenticating user: {e}")
            return None

    def create_user(self, email: str, password: str, name: str, background_info: Optional[dict] = None) -> Optional[dict]:
        """Create a new user in the database"""
        try:
            user_id = f"user_{secrets.token_hex(8)}"
            password_hash = self.hash_password(password)
            email_verified_at = dt.utcnow() if os.getenv("EMAIL_VERIFICATION", "false").lower() == "false" else None

            bg_json = json.dumps(background_info) if background_info else None
            logger.info(f"Creating user: {email}, user_id: {user_id}, bg_info: {bg_json}")

            with db.get_cursor() as cursor:
                cursor.execute("""
                    INSERT INTO users (id, email, name, password_hash, background_info,
                                      created_at, updated_at, email_verified_at)
                    VALUES (%s, %s, %s, %s, %s, NOW(), NOW(), %s)
                    RETURNING id, email, name, background_info, created_at, updated_at, email_verified_at
                """, (user_id, email, name, password_hash, bg_json, email_verified_at))
                result = cursor.fetchone()

                if result:
                    logger.info(f"User created successfully: {user_id}")
                    return {
                        "id": result["id"],
                        "email": result["email"],
                        "name": result["name"],
                        "backgroundInfo": result["background_info"],
                        "createdAt": result["created_at"].isoformat() if result["created_at"] else None,
                        "updatedAt": result["updated_at"].isoformat() if result["updated_at"] else None,
                        "emailVerified": result["email_verified_at"].isoformat() if result["email_verified_at"] else None,
                    }
                else:
                    logger.error(f"User creation returned no result for: {user_id}")
                    return None
        except Exception as e:
            import traceback
            logger.error(f"Error creating user: {e}\n{traceback.format_exc()}")
            return None

    def user_exists(self, email: str) -> bool:
        """Check if a user with the given email exists"""
        try:
            with db.get_cursor() as cursor:
                cursor.execute("SELECT 1 FROM users WHERE email = %s", (email,))
                return cursor.fetchone() is not None
        except Exception as e:
            logger.error(f"Error checking if user exists: {e}")
            return False

    def delete_session(self, token: str) -> bool:
        """Delete a session from the database"""
        try:
            with db.get_cursor() as cursor:
                cursor.execute("DELETE FROM auth_sessions WHERE token = %s", (token,))
                return True
        except Exception as e:
            logger.error(f"Error deleting session: {e}")
            return False

    def update_user(self, user_id: str, updates: dict) -> Optional[dict]:
        """Update user information in database"""
        try:
            with db.get_cursor() as cursor:
                # Build dynamic update query
                update_fields = []
                values = []

                if "name" in updates:
                    update_fields.append("name = %s")
                    values.append(updates["name"])

                if "background_info" in updates:
                    update_fields.append("background_info = %s")
                    values.append(json.dumps(updates["background_info"]))

                if "email" in updates:
                    update_fields.append("email = %s")
                    values.append(updates["email"])

                if update_fields:
                    update_fields.append("updated_at = NOW()")
                    values.append(user_id)

                    query = f"""
                        UPDATE users
                        SET {', '.join(update_fields)}
                        WHERE id = %s
                        RETURNING id, email, name, background_info, created_at, updated_at, email_verified_at
                    """

                    cursor.execute(query, values)
                    result = cursor.fetchone()

                    if result:
                        return {
                            "id": result["id"],
                            "email": result["email"],
                            "name": result["name"],
                            "backgroundInfo": result["background_info"],
                            "createdAt": result["created_at"].isoformat() if result["created_at"] else None,
                            "updatedAt": result["updated_at"].isoformat() if result["updated_at"] else None,
                            "emailVerified": result["email_verified_at"].isoformat() if result["email_verified_at"] else None,
                        }
        except Exception as e:
            logger.error(f"Error updating user: {e}")
            return None

# Initialize BetterAuth
auth_instance = BetterAuth()

def require_auth(request: Request):
    """Dependency to require authentication"""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authorization header missing or invalid")

    token = auth_header[7:]  # Remove "Bearer " prefix
    user = auth_instance.get_user_by_token(token)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return user

# Import our modules
from .config import config
from .rate_limiter import add_rate_limiting
from .qdrant_client import qdrant_manager
from .db import db
from .models.query import Query
from .models.response import Response as ResponseModel
from .services.session_service import session_service
from .retrieval import retrieval_service
from .agent import agent_service
from .utils import validate_query_text, validate_selected_text, count_tokens

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app with title from config
app = FastAPI(title=config.APP_TITLE)

# Add CORS middleware to allow requests from Docusaurus frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://aliyano0.github.io"],  # GitHub Pages origin (without path)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, OPTIONS, etc.)
    allow_headers=["*"],  # Allow all headers
    # Expose certain headers to browsers
    expose_headers=["Access-Control-Allow-Origin"]
)

# Add rate limiting
limiter = add_rate_limiting(app)

@app.get("/")
@limiter.limit(f"{config.RATE_LIMIT_REQUESTS}/minute")  # Apply rate limiting
def read_root(request: Request):
    return {"message": "RAG Chatbot API for Humanoid Robotics Book"}

@app.get("/health")
@limiter.limit(f"{config.RATE_LIMIT_REQUESTS}/minute")  # Apply rate limiting
def health_check(request: Request):
    """Health check endpoint to verify all services are accessible"""
    checks = {
        "qdrant_connection": False,
        "neon_connection": False,
        "openrouter_connection": False
    }

    # Check Qdrant connection
    try:
        collection_info = qdrant_manager.get_collection_info()
        checks["qdrant_connection"] = collection_info is not None
    except Exception:
        checks["qdrant_connection"] = False

    # Check Neon connection
    try:
        # Test database connection
        with db.get_cursor() as cursor:
            cursor.execute("SELECT 1")
        checks["neon_connection"] = True
    except Exception:
        checks["neon_connection"] = False

    # Check OpenRouter connection by verifying environment variables exist
    checks["openrouter_connection"] = bool(config.OPENROUTER_API_KEY and config.OPENROUTER_URL)

    # Overall status
    overall_status = "healthy" if all(checks.values()) else "degraded"

    return {
        "status": overall_status,
        "checks": checks,
        "timestamp": datetime.datetime.now().isoformat()
    }

@app.post("/api/v1/chat")
@limiter.limit(f"{config.RATE_LIMIT_REQUESTS}/minute")  # Apply rate limiting
async def chat_endpoint(request: Request):
    """
    Process user query and return AI-generated response based on book content
    Request body: {
      "query": "string, required - The user's question or query",
      "selected_text": "string, optional - Text selected by user on the page",
      "session_id": "string, optional - Existing session ID for conversation continuity"
    }
    """
    try:
        logger.info("Received chat request")

        # Parse the request body
        body = await request.json()
        query_text = body.get("query", "").strip()
        selected_text = body.get("selected_text", "")
        session_id = body.get("session_id")

        logger.info(f"Processing query: '{query_text[:50]}...' with session_id: {session_id}")

        # Validate inputs
        is_valid, error_msg = validate_query_text(query_text)
        if not is_valid:
            logger.warning(f"Invalid query text: {error_msg}")
            raise HTTPException(status_code=400, detail=error_msg)

        if selected_text:
            is_valid, error_msg = validate_selected_text(selected_text)
            if not is_valid:
                logger.warning(f"Invalid selected text: {error_msg}")
                raise HTTPException(status_code=400, detail=error_msg)

        # If no session_id provided, create a new session
        if not session_id:
            logger.info("No session_id provided, creating new session")
            session = await session_service.create_anonymous_session()
            session_id = session.session_id
        else:
            # Try to get existing session
            session = await session_service.get_session(session_id)
            if not session:
                # If session doesn't exist or is expired, create a new one
                logger.info(f"Session {session_id} not found or expired, creating new session")
                session = await session_service.create_anonymous_session()
                session_id = session.session_id

        # Get conversation history for multi-turn context
        conversation_history = await session_service.get_conversation_history(session_id)

        # Create query object
        query_obj = Query(
            text=query_text,
            selected_text=selected_text if selected_text else None,
            session_id=session_id
        )

        # Check if vector database is available
        vector_db_healthy = await retrieval_service.check_vector_database_health()
        if not vector_db_healthy:
            logger.warning("Vector database is unavailable, returning graceful error response")
            # If vector database is unavailable, return a graceful error response
            fallback_response = await agent_service.generate_fallback_response(
                "The system is currently experiencing issues retrieving content from the textbook. Please try again later."
            )

            response_obj = ResponseModel(
                content=fallback_response['content'],
                citations=[],
                query_id=query_obj.id,
                session_id=session_id,
                token_count=fallback_response['token_count'],
                retrieved_chunks=[]
            )

            # Add the interaction to the session history
            await session_service.add_interaction_to_session(session_id, query_obj, response_obj)

            logger.info(f"Returning fallback response for session {session_id}")
            return {
                "response": response_obj.content,
                "session_id": session_id,
                "citations": [],
                "query_id": query_obj.id,
                "response_id": response_obj.id,
                "token_count": response_obj.token_count,
                "retrieved_chunks": 0
            }

        # Retrieve relevant context
        logger.info(f"Retrieving relevant context for query in session {session_id}")
        retrieval_result = await retrieval_service.retrieve_and_enrich_context(
            query_text,
            selected_text
        )

        # If no relevant content found, return a fallback response
        if not retrieval_result['context'].strip():
            logger.info("No relevant content found, generating fallback response")
            agent_response = await agent_service.generate_fallback_response(query_text)
        else:
            logger.info(f"Found {len(retrieval_result['retrieved_chunks'])} relevant chunks, generating response")
            # Generate response using the agent with conversation history
            agent_response = await agent_service.generate_response(
                query=query_text,
                context=retrieval_result['context'],
                selected_text=selected_text,
                conversation_history=conversation_history
            )

        # Create response object
        response_obj = ResponseModel(
            content=agent_response['content'],
            citations=retrieval_result['citations'],
            query_id=query_obj.id,
            session_id=session_id,
            token_count=agent_response['token_count'],
            retrieved_chunks=[chunk['id'] for chunk in retrieval_result['retrieved_chunks']]
        )

        # Add the interaction to the session history
        await session_service.add_interaction_to_session(session_id, query_obj, response_obj)

        logger.info(f"Successfully processed chat request, response tokens: {response_obj.token_count}")

        # Return the response in the required format
        return {
            "response": response_obj.content,
            "session_id": session_id,
            "citations": [
                {
                    "file_path": citation.file_path,
                    "section": citation.section,
                    "relevance_score": citation.relevance_score
                }
                for citation in response_obj.citations
            ],
            "query_id": query_obj.id,
            "response_id": response_obj.id,
            "token_count": response_obj.token_count,
            "retrieved_chunks": len(response_obj.retrieved_chunks)
        }

    except HTTPException:
        # Re-raise HTTP exceptions
        logger.warning(f"HTTP exception in chat endpoint: {e}")
        raise
    except Exception as e:
        # Handle any other errors
        logger.error(f"Error in chat endpoint: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


@app.post("/api/v1/embed")
@limiter.limit(f"{config.RATE_LIMIT_REQUESTS}/minute")  # Apply rate limiting
async def embed_endpoint(request: Request):
    """
    (Internal endpoint) Embed book content and store in vector database
    Request body: {
      "file_path": "string - Path to the .md file to be embedded",
      "content": "string - Content of the file to be chunked and embedded"
    }
    """
    try:
        # Parse the request body
        body = await request.json()
        file_path = body.get("file_path", "").strip()
        content = body.get("content", "")

        if not file_path or not content:
            raise HTTPException(status_code=400, detail="file_path and content are required")

        # Import embed_book functionality
        from .embed_book import BookEmbedder

        # Create embedder instance
        embedder = BookEmbedder()

        # Create a document from the provided content
        doc = {
            'file_path': file_path,
            'content': content,
            'section_title': embedder._extract_title(content) or file_path,
            'position': 0
        }

        # Process the document into chunks
        chunks = embedder.process_documents([doc])

        if not chunks:
            return {
                "status": "error",
                "message": "No valid chunks created from content",
                "chunks_processed": 0,
                "embedding_ids": []
            }

        # Embed and store the chunks
        processed_count, embedding_ids = await embedder.embed_and_store_chunks(chunks)

        return {
            "status": "success" if processed_count > 0 else "partial",
            "chunks_processed": processed_count,
            "embedding_ids": embedding_ids,
            "total_chunks": len(chunks)
        }

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Handle any other errors
        print(f"Error in embed endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.post("/api/auth/signup")
@limiter.limit(f"{config.RATE_LIMIT_REQUESTS}/minute")  # Apply rate limiting
async def signup(request: Request):
    """Register a new user"""
    try:
        # Parse the request body
        body = await request.json()
        signup_request = SignUpRequest(**body)

        # Check if user already exists
        if auth_instance.user_exists(signup_request.email):
            raise HTTPException(status_code=409, detail="Email already registered")

        # Create new user in database
        user = auth_instance.create_user(
            email=signup_request.email,
            password=signup_request.password,
            name=signup_request.name,
            background_info=signup_request.backgroundInfo
        )

        if not user:
            raise HTTPException(status_code=500, detail="Failed to create user")

        # Create session
        session = auth_instance.create_session(user["id"])

        return {
            "user": user,
            "session": session,
            "token": session["token"]
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Signup error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.post("/api/auth/login")
@limiter.limit(f"{config.RATE_LIMIT_REQUESTS}/minute")  # Apply rate limiting
async def login(request: Request):
    """Login a user"""
    try:
        # Parse the request body
        body = await request.json()
        login_request = LoginRequest(**body)

        # Authenticate user
        user = auth_instance.authenticate_user(login_request.email, login_request.password)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        # Create session
        session = auth_instance.create_session(user["id"])

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
@limiter.limit(f"{config.RATE_LIMIT_REQUESTS}/minute")  # Apply rate limiting
async def logout(request: Request):
    """Logout current user"""
    try:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header[7:]
            # Remove session from database
            auth_instance.delete_session(token)

        return {"message": "Logged out successfully"}
    except Exception as e:
        print(f"Logout error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.patch("/api/auth/me")
async def update_current_user(request: Request, current_user: dict = Depends(require_auth)):
    """Update current user information including background info"""
    try:
        # Parse the request body
        body = await request.json()

        # Prepare updates dict
        updates = {}

        if "name" in body:
            updates["name"] = body["name"]
        if "backgroundInfo" in body:
            updates["background_info"] = body["backgroundInfo"]
        if "email" in body and body["email"] != current_user["email"]:
            # Check if new email is already taken
            if auth_instance.user_exists(body["email"]):
                raise HTTPException(status_code=409, detail="Email already registered")
            updates["email"] = body["email"]

        # Update user in database
        updated_user = auth_instance.update_user(current_user["id"], updates)

        if not updated_user:
            raise HTTPException(status_code=404, detail="User not found")

        return {"user": updated_user}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Update user error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/api/auth/oauth/google")
async def google_oauth():
    """Google OAuth endpoint"""
    # In a real implementation, this would redirect to Google's OAuth
    # For now, we'll return a placeholder that would be handled by the frontend
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url=f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/oauth/google/callback")


@app.get("/api/auth/oauth/github")
async def github_oauth():
    """GitHub OAuth endpoint"""
    # In a real implementation, this would redirect to GitHub's OAuth
    # For now, we'll return a placeholder that would be handled by the frontend
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url=f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/oauth/github/callback")


@app.post("/api/auth/forgot-password")
@limiter.limit(f"{config.RATE_LIMIT_REQUESTS}/minute")  # Apply rate limiting
async def forgot_password(request: Request):
    """Initiate password reset process"""
    try:
        # Parse the request body
        body = await request.json()
        email = body.get("email", "").strip()

        if not email:
            raise HTTPException(status_code=400, detail="Email is required")

        # Find the user by email
        user_exists = auth_instance.user_exists(email)
        if not user_exists:
            # Don't reveal if email exists or not for security
            return {"message": "If an account with that email exists, a password reset link has been sent"}

        # In a real implementation, we would:
        # 1. Generate a password reset token
        # 2. Store it temporarily (e.g., in Redis with expiration)
        # 3. Send an email with a reset link containing the token
        # For now, we'll just simulate the process

        # Generate a temporary reset token (in a real app, this would be more secure)
        reset_token = secrets.token_urlsafe(32)

        # In a real implementation, you would store this token with expiration
        # and send an email with the reset link
        print(f"Password reset initiated for email: {email}")
        print(f"Reset token (for demo purposes): {reset_token}")

        return {"message": "If an account with that email exists, a password reset link has been sent"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Forgot password error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.post("/api/auth/reset-password")
@limiter.limit(f"{config.RATE_LIMIT_REQUESTS}/minute")  # Apply rate limiting
async def reset_password(request: Request):
    """Reset password using token"""
    try:
        # Parse the request body
        body = await request.json()
        token = body.get("token", "").strip()
        new_password = body.get("newPassword", "").strip()

        if not token or not new_password:
            raise HTTPException(status_code=400, detail="Token and new password are required")

        # In a real implementation, we would:
        # 1. Verify the reset token is valid and not expired
        # 2. Find the user associated with the token
        # 3. Update their password
        # For now, we'll simulate the process

        # In a real app, you would validate the token and find the user
        # For demo purposes, let's just return a success message
        print(f"Password reset attempted with token: {token[:10]}...")

        # This is a simplified implementation for demo purposes
        # In a real application, you would have a proper token validation system
        return {"message": "Password has been reset successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Reset password error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.post("/api/v1/embed")
@limiter.limit(f"{config.RATE_LIMIT_REQUESTS}/minute")  # Apply rate limiting
async def embed_endpoint(request: Request):
    """
    (Internal endpoint) Embed book content and store in vector database
    Request body: {
      "file_path": "string - Path to the .md file to be embedded",
      "content": "string - Content of the file to be chunked and embedded"
    }
    """
    try:
        # Parse the request body
        body = await request.json()
        file_path = body.get("file_path", "").strip()
        content = body.get("content", "")

        if not file_path or not content:
            raise HTTPException(status_code=400, detail="file_path and content are required")

        # Import embed_book functionality
        from .embed_book import BookEmbedder

        # Create embedder instance
        embedder = BookEmbedder()

        # Create a document from the provided content
        doc = {
            'file_path': file_path,
            'content': content,
            'section_title': embedder._extract_title(content) or file_path,
            'position': 0
        }

        # Process the document into chunks
        chunks = embedder.process_documents([doc])

        if not chunks:
            return {
                "status": "error",
                "message": "No valid chunks created from content",
                "chunks_processed": 0,
                "embedding_ids": []
            }

        # Embed and store the chunks
        processed_count, embedding_ids = await embedder.embed_and_store_chunks(chunks)

        return {
            "status": "success" if processed_count > 0 else "partial",
            "chunks_processed": processed_count,
            "embedding_ids": embedding_ids,
            "total_chunks": len(chunks)
        }

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Handle any other errors
        print(f"Error in embed endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")