# Research Summary: Integrated RAG Chatbot for Humanoid Robotics Docusaurus Book

## Technology Decisions & Rationale

### Model Selection
- **Decision**: Use gpt-5-mini as the OpenAI model for the agent
- **Rationale**: More cost-efficient latest mini model for agents, sufficient for RAG/book queries while meeting token efficiency success criteria
- **Alternatives considered**: gpt-5.2 (more capable but more expensive)

### Embedding Model
- **Decision**: Use text-embedding-3-large for embeddings
- **Rationale**: Spec-compliant and accurate, available via OpenRouter with free-tier support
- **Alternatives considered**: Newer embedding models (potentially outdated but stable)

### Chunking Strategy
- **Decision**: Use 200-250 token chunks with 40-token overlap
- **Rationale**: Balances detail and noise, reduces hallucinations while maintaining context
- **Alternatives considered**: 512/100 chunks (more context but potentially more noise)

### Vector Database
- **Decision**: Use Qdrant Cloud with 0.7 similarity threshold on top-5 results
- **Rationale**: Tight precision for 85% accuracy success criterion
- **Alternatives considered**: 10 results with 0.5 threshold (may miss less but with lower precision)

### Database for Metadata
- **Decision**: Use Neon Serverless Postgres
- **Rationale**: Serverless Postgres as specified, free tier with persistent storage
- **Alternatives considered**: Supabase (different platform but similar functionality)

### Deployment Platform
- **Decision**: Deploy on Hugging Face Spaces
- **Rationale**: ML-easy deployment with free Docker support, simple for RAG applications
- **Alternatives considered**: Railway (more API control but less ML-focused)

### Rate Limiting
- **Decision**: Implement 10 requests per minute rate limit
- **Rationale**: Handles concurrent usage to prevent crashes while maintaining accessibility
- **Alternatives considered**: No rate limiting (higher risk of resource exhaustion)

### Session Management
- **Decision**: Use Neon table for session storage
- **Rationale**: Persistent storage with free tier, no extra dependencies beyond what's already needed
- **Alternatives considered**: Redis (faster but requires additional service)

### UI Framework
- **Decision**: Use ChatKit widget
- **Rationale**: Simple widget embed that meets functional requirement for accessible chatbot
- **Alternatives considered**: Custom UI (more control but more development time)

### Error Handling
- **Decision**: Implement graceful error messages
- **Rationale**: User-friendly approach for beginner audience as specified in target audience
- **Alternatives considered**: Detailed technical error messages (more information but less user-friendly)

## Integration Research

### OpenRouter API Integration
- OpenRouter serves as the interface for both embeddings and OpenAI agent operations
- Uses base_url=OPENROUTER_URL and api_key=OPENROUTER_API_KEY as specified
- Compatible with OpenAI SDK 2.11.0 for seamless integration

### Docusaurus Integration
- ChatKit widget integrates via script in index.html
- Floating icon implementation with selection handler
- Compatible with existing Docusaurus build process

### Qdrant Integration
- Uses qdrant-client 1.16.1 for vector operations
- Implements similarity search with configurable threshold
- Handles metadata retrieval for context augmentation

### Neon Database Integration
- Uses psycopg 3.3.0 for PostgreSQL operations
- Stores chunk metadata and session information
- Implements schema for persistent conversation context

## Architecture Patterns

### RAG Architecture
- Embedding pipeline processes .md files from Docusaurus docs
- Query embedding and similarity search for relevant context retrieval
- Agent-based response generation with book-specific knowledge

### API Design
- RESTful /chat endpoint for query processing
- Rate limiting middleware for resource protection
- Session-based conversation context management

### Security Considerations
- Environment variable-based credential management
- No hardcoded secrets in codebase
- Anonymous session tracking without personal accounts