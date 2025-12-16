import os
from dotenv import load_dotenv
from typing import Optional

# Load environment variables from .env file
load_dotenv()

class Config:
    """Configuration class to handle environment variables and settings"""

    # OpenRouter Configuration
    OPENROUTER_API_KEY: Optional[str] = os.getenv("OPENROUTER_API_KEY")
    OPENROUTER_URL: Optional[str] = os.getenv("OPENROUTER_URL", "https://openrouter.ai/api/v1")

    # Qdrant Configuration
    QDRANT_API_KEY: Optional[str] = os.getenv("QDRANT_API_KEY")
    QDRANT_CLUSTER_ENDPOINT: Optional[str] = os.getenv("QDRANT_CLUSTER_ENDPOINT")

    # Neon Postgres Configuration
    NEON_POSTGRES_URL: Optional[str] = os.getenv("NEON_POSTGRES_URL")

    # Application Settings
    APP_TITLE: str = "RAG Chatbot for Humanoid Robotics Docusaurus Book"
    APP_VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Rate Limiting (10 requests per minute as specified)
    RATE_LIMIT_REQUESTS: int = 10
    RATE_LIMIT_WINDOW: int = 60  # in seconds

    # Chunking Settings (as specified in requirements)
    CHUNK_MIN_SIZE: int = 200  # minimum tokens per chunk
    CHUNK_MAX_SIZE: int = 250  # maximum tokens per chunk
    CHUNK_OVERLAP: int = 40    # overlap tokens between chunks

    # Similarity Search Settings (as specified in requirements)
    SEARCH_TOP_K: int = 5      # top-k results to retrieve
    SEARCH_SCORE_THRESHOLD: float = 0.3  # minimum similarity score (reduced for better recall with larger dataset)

    # Token Limits
    MAX_QUERY_TOKENS: int = 2000
    MAX_SELECTED_TEXT_TOKENS: int = 5000
    MAX_RESPONSE_TOKENS: int = 500

    # Session Settings
    SESSION_TIMEOUT_HOURS: int = 24  # session timeout after 24 hours of inactivity
    MAX_HISTORY_TURNS: int = 50      # maximum number of conversation turns to store

    # Model Settings
    EMBEDDING_MODEL: str = "text-embedding-3-large"
    AGENT_MODEL: str = "gpt-5-mini"  # as specified in research

    @classmethod
    def validate_config(cls) -> bool:
        """Validate that all required environment variables are set"""
        required_vars = [
            cls.OPENROUTER_API_KEY,
            cls.OPENROUTER_URL,
            cls.QDRANT_API_KEY,
            cls.QDRANT_CLUSTER_ENDPOINT,
            cls.NEON_POSTGRES_URL
        ]

        for var in required_vars:
            if not var:
                return False
        return True

# Create a global config instance
config = Config()