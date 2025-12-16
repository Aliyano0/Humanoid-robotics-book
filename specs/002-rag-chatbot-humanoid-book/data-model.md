# Data Model: Integrated RAG Chatbot for Humanoid Robotics Docusaurus Book

## Entity: Query
**Description**: User input consisting of text question and optional selected text context

**Fields**:
- `id` (string/UUID): Unique identifier for the query
- `text` (string): The main question or query text from the user
- `selected_text` (string, optional): Text that was selected on the page when the query was made
- `session_id` (string/UUID): Reference to the conversation session
- `timestamp` (datetime): When the query was submitted
- `metadata` (object): Additional context information

**Relationships**:
- Belongs to one `Conversation Session`
- May be associated with multiple `Book Content Chunks` (via retrieval process)

## Entity: Response
**Description**: AI-generated answer based on book content with proper citations and context

**Fields**:
- `id` (string/UUID): Unique identifier for the response
- `content` (string): The generated response text
- `citations` (array of objects): References to book sections used in the response
- `query_id` (string/UUID): Reference to the original query
- `session_id` (string/UUID): Reference to the conversation session
- `timestamp` (datetime): When the response was generated
- `token_count` (integer): Number of tokens in the response
- `retrieved_chunks` (array of strings): IDs of chunks used to generate the response

**Relationships**:
- Belongs to one `Query`
- Belongs to one `Conversation Session`
- References multiple `Book Content Chunks`

## Entity: Conversation Session
**Description**: Persistent context that maintains history of interactions for multi-turn conversations

**Fields**:
- `session_id` (string/UUID): Unique identifier for the session
- `created_at` (datetime): When the session was started
- `updated_at` (datetime): When the session was last updated
- `is_active` (boolean): Whether the session is currently active
- `user_id` (string/UUID, optional): Anonymous user identifier (for tracking purposes only)
- `history` (array of objects): Serialized conversation history (queries and responses)

**Relationships**:
- Contains many `Query` entities
- Contains many `Response` entities

## Entity: Book Content Chunk
**Description**: Segments of the textbook content that have been processed and stored in the vector database

**Fields**:
- `chunk_id` (string/UUID): Unique identifier for the chunk
- `content` (string): The text content of the chunk
- `embedding_id` (string): Reference to the vector embedding in Qdrant
- `file_path` (string): Path to the original .md file in the Docusaurus docs
- `section_title` (string): Title of the section this chunk belongs to
- `position` (integer): Position of this chunk within the original document
- `metadata` (object): Additional metadata about the chunk
- `created_at` (datetime): When the chunk was created
- `token_count` (integer): Number of tokens in the chunk

**Relationships**:
- Associated with one `Metadata` record
- May be referenced by multiple `Response` entities

## Entity: Metadata
**Description**: Information about content chunks including file path and section information

**Fields**:
- `id` (string/UUID): Unique identifier for the metadata record
- `chunk_id` (string/UUID): Reference to the corresponding content chunk
- `file_path` (string): Path to the original .md file
- `section` (string): Section title or heading
- `page_number` (integer, optional): Page number if applicable
- `book_module` (string): Module/chapter this content belongs to
- `tags` (array of strings): Content tags for categorization
- `created_at` (datetime): When the metadata was created
- `updated_at` (datetime): When the metadata was last updated

**Relationships**:
- Associated with one `Book Content Chunk`
- Referenced by the retrieval system

## Database Schema for Neon Postgres

### sessions table
```sql
CREATE TABLE sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    user_id UUID,
    history JSONB  -- Stores serialized conversation history
);
```

### metadata table
```sql
CREATE TABLE metadata (
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
```

### Indexes
```sql
-- Index for metadata lookups by file path
CREATE INDEX idx_metadata_file_path ON metadata(file_path);

-- Index for metadata lookups by section
CREATE INDEX idx_metadata_section ON metadata(section);

-- Index for chunk_id lookups
CREATE INDEX idx_metadata_chunk_id ON metadata(chunk_id);

-- Index for sessions by user_id and active status
CREATE INDEX idx_sessions_user_active ON sessions(user_id, is_active);
```

## Validation Rules

### Query Entity
- Text field must be between 1 and 2000 characters
- Selected text field, if provided, must be between 1 and 5000 characters
- Session ID must reference an existing active session
- Must include either text or selected_text (or both)

### Response Entity
- Content field must be between 10 and 2000 characters
- Token count must be less than 500 (per success criteria)
- Must reference a valid query ID
- Citations must be properly formatted with file paths

### Conversation Session
- Session must remain active for up to 24 hours of inactivity
- History must not exceed 50 conversation turns to prevent excessive storage
- Anonymous sessions should not store personally identifiable information

### Book Content Chunk
- Content must be between 200 and 250 tokens (as specified in requirements)
- Overlap with adjacent chunks must be 40 tokens
- File path must reference an existing .md file in the docs directory
- Embedding ID must correspond to a valid vector in Qdrant

### Metadata Entity
- File path must be a valid path to a .md file in the Docusaurus docs
- Section must correspond to a heading in the original document
- Tags should be standardized to maintain consistency across the corpus