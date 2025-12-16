from typing import Optional, Dict, Any, List
from datetime import datetime
import json
from uuid import UUID, uuid4

# Import our models
from ..models.session import ConversationSession
from ..models.query import Query
from ..models.response import Response
from ..config import config
from ..db import db

class SessionService:
    """Service for managing conversation sessions in the database"""

    @staticmethod
    async def create_session(user_id: Optional[str] = None) -> ConversationSession:
        """Create a new conversation session"""
        session = ConversationSession(user_id=user_id)

        # Store session in database
        await SessionService._save_session_to_db(session)

        return session

    @staticmethod
    async def get_session(session_id: str) -> Optional[ConversationSession]:
        """Retrieve a session from the database by ID"""
        try:
            with db.get_cursor() as cursor:
                cursor.execute(
                    "SELECT session_id, created_at, updated_at, is_active, user_id, history FROM sessions WHERE session_id = %s AND is_active = TRUE",
                    (session_id,)
                )
                row = cursor.fetchone()

                if not row:
                    return None

                # Check if session is expired
                session = ConversationSession(
                    session_id=row['session_id'],
                    created_at=row['created_at'],
                    updated_at=row['updated_at'],
                    is_active=row['is_active'],
                    user_id=row['user_id'],
                    history=json.loads(row['history']) if row['history'] else []
                )

                # Mark session as expired if needed
                if session.is_expired(config.SESSION_TIMEOUT_HOURS):
                    await SessionService.deactivate_session(session.session_id)
                    return None

                return session
        except Exception as e:
            print(f"Error retrieving session {session_id}: {e}")
            return None

    @staticmethod
    async def update_session(session: ConversationSession) -> bool:
        """Update an existing session in the database"""
        try:
            # Check if session is expired
            if session.is_expired(config.SESSION_TIMEOUT_HOURS):
                await SessionService.deactivate_session(session.session_id)
                return False

            # Update the session in database
            with db.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute(
                        """
                        UPDATE sessions
                        SET updated_at = %s, history = %s
                        WHERE session_id = %s
                        """,
                        (session.updated_at, json.dumps([item.dict() for item in session.history]), session.session_id)
                    )

            return True
        except Exception as e:
            print(f"Error updating session {session.session_id}: {e}")
            return False

    @staticmethod
    async def deactivate_session(session_id: str) -> bool:
        """Deactivate a session (mark as inactive)"""
        try:
            with db.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute(
                        "UPDATE sessions SET is_active = FALSE WHERE session_id = %s",
                        (session_id,)
                    )
            return True
        except Exception as e:
            print(f"Error deactivating session {session_id}: {e}")
            return False

    @staticmethod
    async def add_interaction_to_session(session_id: str, query: Query, response: Response) -> bool:
        """Add a query-response interaction to a session's history"""
        session = await SessionService.get_session(session_id)
        if not session:
            return False

        # Add the interaction to the session history
        session.add_to_history(query, response)

        # Save the updated session
        return await SessionService.update_session(session)

    @staticmethod
    async def get_conversation_history(session_id: str, max_turns: int = 10) -> Optional[List[Dict[str, str]]]:
        """Get formatted conversation history for use with the AI agent"""
        session = await SessionService.get_session(session_id)
        if not session:
            return None

        return session.get_conversation_history_for_agent(max_turns)

    @staticmethod
    async def _save_session_to_db(session: ConversationSession) -> bool:
        """Private method to save a new session to the database"""
        try:
            with db.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute(
                        """
                        INSERT INTO sessions (session_id, created_at, updated_at, is_active, user_id, history)
                        VALUES (%s, %s, %s, %s, %s, %s)
                        """,
                        (
                            session.session_id,
                            session.created_at,
                            session.updated_at,
                            session.is_active,
                            session.user_id,
                            json.dumps([item.dict() for item in session.history])
                        )
                    )
            return True
        except Exception as e:
            print(f"Error saving session to database: {e}")
            return False

    @staticmethod
    async def create_anonymous_session() -> ConversationSession:
        """Create a session for an anonymous user"""
        return await SessionService.create_session()

# Global session service instance
session_service = SessionService()