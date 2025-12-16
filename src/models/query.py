from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any
from uuid import UUID, uuid4
from datetime import datetime
import re

class Query(BaseModel):
    """
    Query model representing user input consisting of text question and optional selected text context
    Based on data model specification
    """
    id: str = Field(default_factory=lambda: str(uuid4()), description="Unique identifier for the query")
    text: str = Field(..., min_length=1, max_length=2000, description="The main question or query text from the user")
    selected_text: Optional[str] = Field(None, max_length=5000, description="Text that was selected on the page when the query was made")
    session_id: Optional[str] = Field(None, description="Reference to the conversation session")
    timestamp: datetime = Field(default_factory=datetime.now, description="When the query was submitted")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Additional context information")

    @validator('text')
    def validate_text_length(cls, v):
        """Validate text length between 1 and 2000 characters"""
        if len(v) < 1:
            raise ValueError('Text field must be at least 1 character')
        if len(v) > 2000:
            raise ValueError('Text field must be no more than 2000 characters')
        return v

    @validator('selected_text')
    def validate_selected_text_length(cls, v):
        """Validate selected text length up to 5000 characters"""
        if v is not None and len(v) > 5000:
            raise ValueError('Selected text field must be no more than 5000 characters')
        return v

    @validator('session_id')
    def validate_session_id_format(cls, v):
        """Validate session ID format if provided"""
        if v is not None:
            # Basic UUID format validation
            try:
                UUID(v)
            except ValueError:
                raise ValueError('Session ID must be a valid UUID format')
        return v

    class Config:
        # Allow extra fields for flexibility
        extra = "allow"
        # Enable ORM mode for database integration
        from_attributes = True