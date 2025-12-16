from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from uuid import UUID, uuid4
from datetime import datetime
from .query import Query
from ..utils import count_tokens

class Citation(BaseModel):
    """
    Citation model for references to book sections used in the response
    """
    file_path: str = Field(..., description="Path to the source document")
    section: str = Field(..., description="Section title where information was found")
    relevance_score: float = Field(..., ge=0.0, le=1.0, description="Similarity score of the cited content (0.0-1.0)")


class Response(BaseModel):
    """
    Response model representing AI-generated answer based on book content with proper citations and context
    Based on data model specification
    """
    id: str = Field(default_factory=lambda: str(uuid4()), description="Unique identifier for the response")
    content: str = Field(..., min_length=10, max_length=2000, description="The generated response text")
    citations: List[Citation] = Field(default=[], description="References to book sections used in the response")
    query_id: str = Field(..., description="Reference to the original query")
    session_id: Optional[str] = Field(None, description="Reference to the conversation session")
    timestamp: datetime = Field(default_factory=datetime.now, description="When the response was generated")
    token_count: int = Field(default=0, description="Number of tokens in the response")
    retrieved_chunks: List[str] = Field(default=[], description="IDs of chunks used to generate the response")

    @validator('content')
    def validate_content_length(cls, v):
        """Validate content length between 10 and 2000 characters"""
        if len(v) < 10:
            raise ValueError('Content field must be at least 10 characters')
        if len(v) > 2000:
            raise ValueError('Content field must be no more than 2000 characters')
        return v

    @validator('token_count')
    def validate_token_count(cls, v):
        """Validate token count is under 500 as per success criteria"""
        if v > 500:
            raise ValueError('Token count must be under 500 tokens as per success criteria')
        return v

    @validator('query_id')
    def validate_query_id_format(cls, v):
        """Validate query ID format"""
        try:
            UUID(v)
        except ValueError:
            raise ValueError('Query ID must be a valid UUID format')
        return v

    @validator('session_id')
    def validate_session_id_format(cls, v):
        """Validate session ID format if provided"""
        if v is not None:
            try:
                UUID(v)
            except ValueError:
                raise ValueError('Session ID must be a valid UUID format')
        return v

    def calculate_and_validate_tokens(self):
        """Calculate token count and validate it meets requirements"""
        self.token_count = count_tokens(self.content)
        if self.token_count > 500:
            raise ValueError(f"Response token count ({self.token_count}) exceeds maximum of 500 tokens")
        return self.token_count

    class Config:
        # Allow extra fields for flexibility
        extra = "allow"
        # Enable ORM mode for database integration
        from_attributes = True