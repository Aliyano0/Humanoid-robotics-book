from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from uuid import UUID, uuid4
from datetime import datetime
from .query import Query
from .response import Response

class SessionHistoryItem(BaseModel):
    """Model for a single item in session history"""
    query: Query
    response: Response
    timestamp: datetime = Field(default_factory=datetime.now)


class ConversationSession(BaseModel):
    """
    Conversation Session model representing persistent context that maintains history of interactions for multi-turn conversations
    Based on data model specification
    """
    session_id: str = Field(default_factory=lambda: str(uuid4()), description="Unique identifier for the session")
    created_at: datetime = Field(default_factory=datetime.now, description="When the session was started")
    updated_at: datetime = Field(default_factory=datetime.now, description="When the session was last updated")
    is_active: bool = Field(default=True, description="Whether the session is currently active")
    user_id: Optional[str] = Field(None, description="Anonymous user identifier (for tracking purposes only)")
    history: List[SessionHistoryItem] = Field(default=[], description="Serialized conversation history (queries and responses)")

    @validator('session_id')
    def validate_session_id_format(cls, v):
        """Validate session ID format"""
        try:
            UUID(v)
        except ValueError:
            raise ValueError('Session ID must be a valid UUID format')
        return v

    @validator('user_id')
    def validate_user_id_format(cls, v):
        """Validate user ID format if provided"""
        if v is not None:
            try:
                UUID(v)
            except ValueError:
                raise ValueError('User ID must be a valid UUID format')
        return v

    @validator('history')
    def validate_history_length(cls, v):
        """Validate history does not exceed 50 conversation turns"""
        if len(v) > 50:
            raise ValueError('History must not exceed 50 conversation turns to prevent excessive storage')
        return v

    def update_timestamp(self):
        """Update the updated_at timestamp to current time"""
        self.updated_at = datetime.now()
        return self.updated_at

    def add_to_history(self, query: Query, response: Response):
        """Add a query-response pair to the session history"""
        # Check if we're at the history limit
        if len(self.history) >= 50:
            # Remove the oldest item to make space
            self.history.pop(0)

        # Add the new item
        history_item = SessionHistoryItem(query=query, response=response)
        self.history.append(history_item)
        self.update_timestamp()

    def is_expired(self, hours: int = 24) -> bool:
        """Check if the session has been inactive for more than specified hours"""
        time_diff = datetime.now() - self.updated_at
        return time_diff.total_seconds() > (hours * 3600)

    def check_and_expire_session(self) -> bool:
        """Check if session is expired and update is_active flag if needed"""
        if self.is_expired():
            self.is_active = False
            return True
        return False

    def get_conversation_history_for_agent(self, max_turns: int = 10) -> List[Dict[str, str]]:
        """
        Format conversation history for use with the AI agent
        Returns a list of messages in the format expected by the OpenAI API
        """
        history_for_agent = []

        # Get the most recent turns up to the limit
        recent_history = self.history[-max_turns:] if len(self.history) > max_turns else self.history

        for item in recent_history:
            # Add user message (the query)
            history_for_agent.append({
                "role": "user",
                "content": item.query.text
            })

            # Add assistant message (the response)
            history_for_agent.append({
                "role": "assistant",
                "content": item.response.content
            })

        return history_for_agent

    class Config:
        # Allow extra fields for flexibility
        extra = "allow"
        # Enable ORM mode for database integration
        from_attributes = True