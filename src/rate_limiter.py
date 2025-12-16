from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import FastAPI, Request

# Import our config for rate limiting values
from .config import config

# Create limiter instance with remote address as identifier
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[f"{config.RATE_LIMIT_REQUESTS}/minute"]  # 10 requests per minute as specified
)

def add_rate_limiting(app: FastAPI):
    """Add rate limiting middleware to the FastAPI application"""
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    return limiter