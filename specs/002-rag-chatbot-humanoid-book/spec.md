# Feature Specification: Integrated RAG Chatbot for Humanoid Robotics Docusaurus Book

**Feature Branch**: `002-rag-chatbot-humanoid-book`
**Created**: 2025-12-12
**Status**: Complete
**Input**: User description: "Integrated RAG Chatbot for Humanoid Robotics Docusaurus Book

Target audience:
Undergraduate/graduate students and robotics enthusiasts using the Physical AI & Humanoid Robotics textbook. Beginners to advanced users seeking quick answers on book content via an embedded chatbot.

Focus:
Develop and embed a RAG-based chatbot into the existing Docusaurus site. The chatbot uses OpenAI Agents SDK (Python v2.9.0+), ChatKit SDK/widgets for UI, FastAPI backend, Neon Serverless Postgres for metadata/session storage, and Qdrant Cloud Free Tier for vector embeddings. It answers queries about book content, including from user-selected text. Use Python for all backend logic. Process in phased steps for efficiency:

1. Embed book: Ingest all .md files from Docusaurus /docs folder into Qdrant. Chunk size 200–250 tokens, overlap 40. Use OpenAI \"text-embedding-3-large\" model. Store metadata (file path, section) in Neon Postgres. Env vars: OPENAI_API_KEY, QDRANT_API_KEY, QDRANT_CLUSTER_ENDPOINT, NEON_POSTGRES_URL (add if needed).

2. Chatbot UI: Add simple ChatKit widget to Docusaurus – floating icon bottom-right, opens chat modal. Passes user prompts (and selected text if highlighted) to FastAPI endpoint.

3. AI Agent: Build OpenAI Agents SDK agent that processes user query, retrieves relevant chunks via Qdrant similarity search, and generates response using GPT-4o-mini (or latest efficient model).

4. FastAPI Backend: REST API to handle UI requests. Endpoint /chat: receives query/selected_text, calls retrieval function, invokes agent, returns response to UI.

5. Retrieval Function: Python func that embeds query with \"text-embedding-3-large\", queries Qdrant (top-k=5, score_threshold=0.7), fetches metadata from Neon, combines context for agent.

6. Integration & Extras: Handle user-selected text as priority context in retrieval. Create the backend as a Docker image deployable on Hugging Face Spaces or Railway (using Dockerfile for FastAPI setup). Ensure session persistence via Neon for multi-turn chats. Integrate into Docusaurus build.

Success criteria (testable by deploying and querying):
- Chatbot icon appears on site; opens UI; handles 10+ test queries accurately (e.g., \"Explain ROS 2 nodes\" retrieves from Module 1).
- Processes selected text: Highlight book para, ask \"Summarize this\" – uses only that context.
- Embeddings complete: All .md files chunked/embedded; query retrieves relevant chunks >85% accuracy.
- Multi-turn: Remembers prior messages via Neon sessions.
- Deployment: Runs on free tiers; no crashes on 50 queries/day.
- Token-efficient: Responses <500 tokens avg; uses Claude-Code for impl if needed.

Constraints:
- Backend: Python 3.12+, FastAPI 0.115+, OpenAI SDK 2.9.0+, Qdrant-client 1.12+.
- No scraping: Use local .md files directly.
- Free tiers only: Qdrant Cloud Free (1GB), Neon Free (0.5GB).
- Docusaurus integration: Add ChatKit script to index.html; no site rebuild needed beyond config.
- Security: Env var creds only; no hardcoding.

Not building:
- Advanced auth/user accounts.
- Real-time updates (embed once at build).
- Non-book queries (limit to book content).
- Custom ML training (use OpenAI embeddings/API).
- Windows/macOS-specific instructions (Ubuntu/dev container assumed).

Dependencies & Assumptions:
- Existing Docusaurus repo with /docs .md files.
- Env vars pre-set; Neon DB schema: simple tables for metadata (id, chunk_text, embedding_id, file_path) and sessions (user_id, chat_history).
- Writer has access to OpenAI/Qdrant/Neon accounts.
- All code tested locally before deploy.
- You should ask for env names for any credentials before using them.
- You can use the skills and sub-agent"

## Implementation Summary

The RAG Chatbot for Humanoid Robotics Docusaurus Book has been fully implemented with all specified features and requirements. The system is now complete and ready for deployment.

### Core Components Delivered

- **FastAPI Backend**: Robust API with rate limiting, health checks, and comprehensive error handling
- **Vector Search**: Qdrant-based similarity search with 200-250 token chunks and 40-token overlap
- **Session Management**: Multi-turn conversations with context preservation and timeout logic
- **Selected Text Processing**: Priority context handling for user-selected text
- **Citation System**: Proper attribution of sources from book content
- **Deployment Ready**: Configurations for multiple platforms (self-hosted, Hugging Face, Railway)
- **Testing Suite**: Load testing, integration testing, and success criteria verification
- **Comprehensive Documentation**: API reference, deployment guide, and quickstart instructions

### Local Development & Testing

The system includes comprehensive local development capabilities:

- **Start Script**: `start_server.sh` for easy server startup
- **Verification Script**: `verify_local.py` for quick functionality checks
- **Testing Guide**: `TESTING.md` with detailed verification steps
- **Environment Setup**: `.env.example` with all required variables
- **Docker Support**: Complete Dockerfile and docker-compose.yml for containerized deployment

### Local Testing Capabilities

The system supports full local testing before deployment:

1. **Health Check**: Verify all external services are accessible
2. **Basic Chat**: Test query processing and response generation
3. **Selected Text**: Verify priority context handling
4. **Session Continuity**: Test multi-turn conversation maintenance
5. **Rate Limiting**: Verify request limiting functionality
6. **Embedding**: Test content embedding process
7. **Integration Tests**: Run comprehensive test suite
8. **Load Testing**: Verify performance under expected load

### Deployment Options

The system supports multiple deployment platforms:

- **Self-Hosted**: Docker container with all dependencies
- **Hugging Face Spaces**: Pre-configured with .space directory
- **Railway**: Configuration with railway.json and deployment scripts

## Additional Implementation Details

The system will utilize the OpenRouter API for both embeddings and the OpenAI Agents SDK operations. The following environment variables will be used:
- OPENROUTER_API_KEY: API key for OpenRouter service
- OPENROUTER_URL: Base URL for OpenRouter service

Additionally, the project will use UV venv for python environment management.

## Clarifications

### Session 2025-12-12

- Q: For the security and privacy requirements, should the system implement specific authentication for users, or should it remain anonymous with only session-based tracking? → A: Anonymous usage with only session-based tracking for conversation context (no personal accounts)
- Q: When a user submits a query that has no relevant content in the book, how should the system respond? → A: Provide a helpful response explaining that the topic isn't covered in the book with suggestions for alternative queries
- Q: How should the system handle very long user queries or selected text that might exceed token limits? → A: Process the full input by breaking it into smaller chunks and combining results
- Q: How should the system handle multiple concurrent users making requests when approaching resource limits? → A: Implement rate limiting with graceful queuing for overflow requests
- Q: How should the system handle queries about content that was recently added to the book but not yet indexed in the vector database? → A: Inform the user that the content may not be indexed yet and suggest checking back later

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Query Book Content via Chatbot (Priority: P1)

A student or robotics enthusiast is reading the Physical AI & Humanoid Robotics textbook on the Docusaurus site and has a question about a specific topic. They click the floating chatbot icon, type their question (e.g., "Explain ROS 2 nodes"), and receive an accurate response based on the book content. The response includes relevant citations to specific sections of the book.

**Why this priority**: This is the core functionality that provides immediate value - users can get quick answers to their questions without manually searching through the book content.

**Independent Test**: Can be fully tested by asking various questions about book content and verifying that responses are accurate and come from the correct sections of the book.

**Acceptance Scenarios**:

1. **Given** user is on the Docusaurus site with the chatbot widget available, **When** user clicks the chatbot icon and types a question about book content, **Then** user receives an accurate response based on the book content with proper citations.

2. **Given** user has a question about a specific topic in the book, **When** user submits the question to the chatbot, **Then** response contains relevant information from the book with context and proper attribution.

---
### User Story 2 - Query Using Selected Text (Priority: P1)

A student is reading a section of the book and highlights a paragraph or text they want to understand better. They right-click or use a context menu to ask the chatbot to summarize or explain the selected text. The chatbot processes the selected text as priority context and provides a relevant response.

**Why this priority**: This enhances the user experience by allowing direct interaction with specific content they're reading, making the learning process more interactive and efficient.

**Independent Test**: Can be fully tested by selecting text on the page, invoking the chatbot with a query about the selected text, and verifying the response focuses on the selected content.

**Acceptance Scenarios**:

1. **Given** user has selected text on the Docusaurus page, **When** user asks the chatbot to summarize or explain the selected text, **Then** response is generated based primarily on the selected text content.

2. **Given** user has highlighted a complex paragraph, **When** user asks "Summarize this" or "Explain this concept", **Then** response focuses on the selected content and provides clear explanation.

---
### User Story 3 - Multi-turn Conversations with Context (Priority: P2)

A student engages in a conversation with the chatbot about a complex topic, asking follow-up questions that reference previous parts of the conversation. The chatbot maintains context of the conversation and provides coherent responses that build on previous exchanges.

**Why this priority**: This enables deeper learning interactions and more natural conversation flow, making the chatbot more useful for complex topics.

**Independent Test**: Can be fully tested by having a multi-turn conversation and verifying the chatbot remembers context from earlier messages.

**Acceptance Scenarios**:

1. **Given** user has started a conversation with the chatbot, **When** user asks follow-up questions that reference previous messages, **Then** chatbot maintains context and provides coherent responses.

2. **Given** user is discussing a complex topic across multiple exchanges, **When** user references information from earlier in the conversation, **Then** chatbot correctly recalls and builds upon that context.

---
### User Story 4 - Access Chatbot from Any Page (Priority: P1)

A user browsing any page of the Docusaurus site should be able to access the chatbot functionality through a consistent interface element (floating icon), regardless of which section of the book they're currently viewing.

**Why this priority**: Ensures the chatbot is always accessible, providing consistent value across the entire book content.

**Independent Test**: Can be fully tested by accessing the chatbot from different pages of the Docusaurus site and verifying consistent functionality.

**Acceptance Scenarios**:

1. **Given** user is on any page of the Docusaurus site, **When** user clicks the chatbot icon, **Then** chatbot interface opens consistently with the same functionality.

2. **Given** user navigates between different sections of the book, **When** user accesses the chatbot, **Then** functionality remains consistent across all pages.

---
### Edge Cases

- What happens when the chatbot receives a query that has no relevant content in the book?
- How does the system handle very long user queries or selected text?
- What happens when the vector database is temporarily unavailable?
- How does the system handle concurrent users making multiple requests?
- What occurs when a user tries to query about content that was recently added but not yet indexed?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a floating chatbot widget accessible from any page of the Docusaurus site
- **FR-002**: System MUST process user queries about book content and return accurate responses based on the Physical AI & Humanoid Robotics textbook
- **FR-003**: System MUST handle user-selected text as priority context when generating responses
- **FR-004**: System MUST maintain conversation context across multiple turns in the same session
- **FR-005**: System MUST retrieve relevant book content using vector similarity search to support responses
- **FR-006**: System MUST store conversation history and metadata in a database for session persistence
- **FR-007**: System MUST provide responses that are limited to information contained in the book content
- **FR-008**: System MUST handle errors gracefully and provide helpful feedback to users when issues occur
- **FR-009**: System MUST support embedding all .md files from the Docusaurus /docs folder into the vector database
- **FR-010**: System MUST process queries with appropriate response time (under 10 seconds for typical requests)
- **FR-011**: System MUST store metadata about content chunks including file path and section information
- **FR-012**: System MUST be deployable as a Docker container on cloud platforms like Hugging Face Spaces or Railway

### Key Entities

- **Query**: User input consisting of text question and optional selected text context
- **Response**: AI-generated answer based on book content with proper citations and context
- **Conversation Session**: Persistent context that maintains history of interactions for multi-turn conversations
- **Book Content Chunk**: Segments of the textbook content that have been processed and stored in the vector database
- **Metadata**: Information about content chunks including file path, section, and embedding references

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Chatbot widget is visible and functional on 100% of Docusaurus site pages with response time under 10 seconds for typical queries
- **SC-002**: System accurately answers 85% of test queries about book content by retrieving and citing relevant sections
- **SC-003**: Users can successfully use selected text functionality to get responses focused on highlighted content in 90% of attempts
- **SC-004**: Multi-turn conversations maintain context correctly across at least 5 exchanges with coherent responses
- **SC-005**: System handles 50 queries per day without crashes or significant performance degradation
- **SC-006**: Average response length is under 500 tokens while still providing comprehensive answers
- **SC-007**: All book content from the /docs folder is successfully embedded and retrievable through the system
- **SC-008**: Users report 80% satisfaction with response accuracy and relevance in usability testing
