import psycopg
from psycopg.rows import dict_row
from contextlib import contextmanager
import os
from dotenv import load_dotenv
from typing import Optional
import json

load_dotenv()

class DatabaseConnection:
    def __init__(self):
        self.connection_string = os.getenv("NEON_DATABASE_URL")
        self.conn: Optional[psycopg.Connection] = None

    def connect(self):
        """Create a connection to Neon Postgres"""
        if not self.connection_string:
            raise ValueError("NEON_DATABASE_URL environment variable is not set")

        self.conn = psycopg.connect(
            conninfo=self.connection_string,
            autocommit=True
        )
        print("Connected to Neon Postgres database")

    def disconnect(self):
        """Close the database connection"""
        if self.conn:
            self.conn.close()
            self.conn = None

    def _ensure_connection(self):
        """Ensure connection is alive, reconnect if needed"""
        if self.conn is None:
            self.connect()
            return

        # Check if connection is still alive
        try:
            # Simple query to test connection
            with self.conn.cursor() as cursor:
                cursor.execute("SELECT 1")
        except (psycopg.OperationalError, psycopg.InterfaceError):
            # Connection is dead, reconnect
            print("Connection lost, reconnecting...")
            try:
                self.conn.close()
            except Exception:
                pass
            self.conn = None
            self.connect()

    @contextmanager
    def get_connection(self):
        """Get a connection context"""
        self._ensure_connection()
        yield self.conn

    @contextmanager
    def get_cursor(self):
        """Get a cursor context"""
        self._ensure_connection()
        with self.conn.cursor(row_factory=dict_row) as cursor:
            yield cursor

# Global database instance
db = DatabaseConnection()

# Function to initialize database schema
def init_db_schema():
    """Initialize the database schema for sessions and metadata tables"""
    with db.get_connection() as conn:
        with conn.cursor() as cursor:
            # Create sessions table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS sessions (
                    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    is_active BOOLEAN DEFAULT TRUE,
                    user_id UUID,
                    history JSONB  -- Stores serialized conversation history
                );
            """)

            # Create metadata table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS metadata (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    chunk_id UUID NOT NULL,
                    file_path VARCHAR(500) NOT NULL,
                    section VARCHAR(200),
                    page_number INTEGER,
                    book_module VARCHAR(100),
                    tags TEXT[],
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            """)

            # Create users table for authentication
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id VARCHAR(100) PRIMARY KEY,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    name VARCHAR(255) NOT NULL,
                    password_hash TEXT NOT NULL,
                    background_info JSONB,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    email_verified_at TIMESTAMP WITH TIME ZONE
                );
            """)

            # Create auth_sessions table for session management
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS auth_sessions (
                    token TEXT PRIMARY KEY,
                    user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
                );
            """)

            # Create indexes
            cursor.execute("""
                -- Index for metadata lookups by file path
                CREATE INDEX IF NOT EXISTS idx_metadata_file_path ON metadata(file_path);
            """)

            cursor.execute("""
                -- Index for metadata lookups by section
                CREATE INDEX IF NOT EXISTS idx_metadata_section ON metadata(section);
            """)

            cursor.execute("""
                -- Index for chunk_id lookups
                CREATE INDEX IF NOT EXISTS idx_metadata_chunk_id ON metadata(chunk_id);
            """)

            cursor.execute("""
                -- Index for sessions by user_id and active status
                CREATE INDEX IF NOT EXISTS idx_sessions_user_active ON sessions(user_id, is_active);
            """)

            # Indexes for authentication tables
            cursor.execute("""
                -- Index for users by email (for login lookup)
                CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
            """)

            cursor.execute("""
                -- Index for auth_sessions by user_id
                CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON auth_sessions(user_id);
            """)

            cursor.execute("""
                -- Index for auth_sessions by expires_at (for cleanup)
                CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires_at ON auth_sessions(expires_at);
            """)

            print("Database schema initialized successfully")

# Initialize the schema when module is loaded
init_db_schema()