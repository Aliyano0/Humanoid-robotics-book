# RAG Chatbot for Humanoid Robotics Docusaurus Book - Documentation

## Project Overview

The RAG Chatbot for Humanoid Robotics Docusaurus Book is an advanced AI-powered search and conversation system that integrates directly with a Docusaurus-based documentation site for Physical AI & Humanoid Robotics. The system enables users to ask natural language questions about the textbook content and receive accurate, cited responses powered by Retrieval-Augmented Generation (RAG).

### Key Features
- **Natural Language Querying**: Ask questions about humanoid robotics concepts in plain English
- **Real-time Content Retrieval**: Instant access to textbook content with semantic search
- **Citation System**: All responses include specific citations to textbook sections
- **Selected Text Processing**: Highlight text and ask the chatbot to explain or summarize it
- **Multi-turn Conversations**: Maintain context across multiple exchanges in a session
- **Docusaurus Integration**: Seamless integration with Docusaurus frontend via ChatKit widget
- **Rate Limiting**: Built-in protection against API abuse (10 requests/minute)
- **Session Management**: Persistent conversation sessions with timeout handling

## Architecture

### Backend Components
- **FastAPI**: Python web framework for the REST API
- **Qdrant Cloud**: Vector database for semantic search and similarity matching
- **Neon Postgres**: Cloud database for session management and metadata storage
- **OpenRouter API**: AI model access for embeddings and response generation
- **gRPC/HTTP**: Communication protocols for vector database operations

### Frontend Integration
- **ChatKit Widget**: Docusaurus-integrated chat interface
- **JavaScript Integration**: Dynamic script injection for Docusaurus compatibility
- **Real-time Communication**: WebSocket/HTTP communication with backend

### Data Flow
1. User queries are processed through the FastAPI backend
2. Text is converted to embeddings using OpenRouter's text-embedding-3-large model
3. Vector similarity search retrieves relevant content chunks from Qdrant
4. AI agent generates contextual responses with proper citations
5. Session state is maintained in Neon Postgres
6. Responses are delivered to the Docusaurus frontend via ChatKit

## Technical Specifications

### Core Requirements
- **Python 3.12+**: Backend runtime environment
- **FastAPI 0.124.2+**: Web framework
- **OpenAI SDK 2.11.0+**: AI integration
- **Qdrant-client 1.16.1+**: Vector database client
- **psycopg 3.3.0+**: Postgres database adapter
- **langchain-text-splitters 1.0.0+**: Text chunking utilities
- **python-dotenv**: Environment variable management
- **uvicorn**: ASGI server

### Environment Variables
```env
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_URL=your_openrouter_base_url (default: https://openrouter.ai/api/v1)
QDRANT_API_KEY=your_qdrant_api_key
QDRANT_CLUSTER_ENDPOINT=your_qdrant_cluster_endpoint
NEON_POSTGRES_URL=your_neon_postgres_connection_string
```

### API Endpoints

#### `/`
- **Method**: GET
- **Description**: Root endpoint for basic service information
- **Rate Limiting**: 10 requests/minute

#### `/health`
- **Method**: GET
- **Description**: Health check endpoint with status of all services
- **Response**:
  ```json
  {
    "status": "healthy",
    "checks": {
      "qdrant_connection": true,
      "neon_connection": true,
      "openrouter_connection": true
    },
    "timestamp": "2025-12-16T02:22:45.586123"
  }
  ```
- **Rate Limiting**: 10 requests/minute

#### `/api/v1/chat`
- **Method**: POST
- **Description**: Main chat endpoint for querying the RAG system
- **Request Body**:
  ```json
  {
    "query": "string, required - The user's question or query",
    "selected_text": "string, optional - Text selected by user on the page",
    "session_id": "string, optional - Existing session ID for conversation continuity"
  }
  ```
- **Response**:
  ```json
  {
    "response": "AI-generated response text",
    "session_id": "UUID of the conversation session",
    "citations": [
      {
        "file_path": "path to source document",
        "section": "section title",
        "relevance_score": "similarity score (0.0-1.0)"
      }
    ],
    "query_id": "UUID of the query",
    "response_id": "UUID of the response",
    "token_count": "number of tokens in response",
    "retrieved_chunks": "number of content chunks used"
  }
  ```
- **Rate Limiting**: 10 requests/minute

#### `/api/v1/embed` (Internal)
- **Method**: POST
- **Description**: Embed book content and store in vector database
- **Request Body**:
  ```json
  {
    "file_path": "path to the .md file to be embedded",
    "content": "content of the file to be chunked and embedded"
  }
  ```

### Content Processing Specifications

#### Text Chunking
- **Minimum Size**: 200 tokens per chunk
- **Maximum Size**: 250 tokens per chunk
- **Overlap**: 40 tokens between chunks
- **Format**: Supports both `.md` and `.mdx` files from Docusaurus `/docs` folder

#### Embedding Model
- **Model**: `text-embedding-3-large`
- **Vector Size**: 3072 dimensions
- **Provider**: OpenRouter API

#### Similarity Search
- **Top-K Results**: 5 most relevant chunks
- **Score Threshold**: 0.3 (adjusted for larger dataset recall)
- **Distance Metric**: Cosine similarity

### Session Management
- **Session ID Format**: UUID v4
- **Timeout**: 24 hours of inactivity
- **History Limit**: 50 conversation turns per session
- **Storage**: Neon Postgres database

### Rate Limiting
- **Limit**: 10 requests per minute per IP
- **Implementation**: slowapi
- **Applied To**: All API endpoints

### Response Specifications
- **Maximum Tokens**: 500 tokens per response
- **Minimum Content**: 10 characters (validation enforced)
- **Citation Format**: File path, section title, and relevance score
- **Response Time**: Target <10 seconds

## Deployment Configuration

### Hugging Face Spaces
- **Runtime**: Docker
- **SDK**: Docker
- **Port**: Dynamic (PORT environment variable)
- **Environment Variables**: Set as Space secrets

### Docker Configuration
- **Base Image**: python:3.12-slim
- **Port**: Dynamic via PORT environment variable (defaults to 7860)
- **Health Check**: `/health` endpoint
- **Startup Script**: `start_server.sh`

### Docusaurus Integration
- **Script Injection**: Dynamic loading of ChatKit widget
- **Widget Location**: Bottom-right corner with message icon
- **Styling**: White stroke for message icon visibility
- **Communication**: API calls to backend server

## Success Criteria

### Functional Requirements
1. **Widget Integration**: Chatbot widget visible and functional on 100% of Docusaurus site pages with <10s response time
2. **Accuracy**: 85% of test queries answered accurately by retrieving and citing relevant sections
3. **Selected Text**: 90% success rate for selected text functionality
4. **Multi-turn**: 5+ exchange conversations maintain context (3/5 success rate currently)
5. **Reliability**: System handles 50+ queries/day without crashes
6. **Token Limits**: Average response length <500 tokens
7. **Content Coverage**: All book content from `/docs` folder embedded and retrievable
8. **User Satisfaction**: 80% user satisfaction with response accuracy and relevance

### Performance Metrics
- **Response Time**: <10 seconds for 95% of queries
- **Availability**: >99% uptime
- **Throughput**: 10 requests/minute sustained rate
- **Token Efficiency**: <500 tokens per response
- **Citation Accuracy**: >85% of responses include proper citations

## Error Handling

### Common Error Types
- **Empty Response**: When no relevant content found, returns fallback message
- **Database Connection**: Connection recovery with automatic reconnection
- **API Limits**: Graceful handling of OpenRouter rate limits
- **Vector Database**: Fallback responses when Qdrant is unavailable
- **Validation**: Pydantic model validation for all inputs and outputs

### Health Monitoring
- **Database Connectivity**: Neon Postgres connection status
- **Vector Database**: Qdrant cluster accessibility
- **AI Provider**: OpenRouter API availability
- **Service Status**: Overall system health metrics

## Security Considerations

### API Key Management
- **Environment Variables**: All API keys stored in environment variables
- **Secrets**: Hugging Face Spaces uses secure secret management
- **No Hardcoding**: API keys never stored in source code

### Rate Limiting
- **Per-IP Limits**: 10 requests/minute to prevent abuse
- **Distributed**: Rate limits applied across all endpoints
- **Monitoring**: Track and alert on unusual usage patterns

### Data Privacy
- **No User Data**: System does not store personal user information
- **Session Data**: Temporary session storage with automatic cleanup
- **Content Access**: Read-only access to textbook content

## Development and Testing

### Local Development
- **Virtual Environment**: Python 3.12+ with requirements.txt
- **Environment Setup**: Copy `.env.example` to `.env`
- **Local Server**: `./start_server.sh` or `uvicorn src.main:app --reload`

### Testing Framework
- **Unit Tests**: Pytest-based testing framework
- **Integration Tests**: End-to-end functionality verification
- **Success Criteria Verification**: Automated testing of all requirements
- **Load Testing**: Performance and stress testing capabilities

### Content Embedding Process
- **Automatic**: Runs during initial setup
- **File Support**: Processes all `.md` and `.mdx` files in `/docs`
- **Chunking**: Automatic text chunking with proper overlap
- **Indexing**: Vector storage with metadata preservation

## Project Structure

```
├── src/                    # Source code
│   ├── main.py            # FastAPI application entry point
│   ├── agent.py           # AI agent integration and response generation
│   ├── config.py          # Configuration and environment handling
│   ├── db.py              # Database connection and schema management
│   ├── qdrant_client.py   # Vector database operations
│   ├── retrieval.py       # Content retrieval and similarity search
│   ├── embed_book.py      # Content embedding functionality
│   ├── utils.py           # Utility functions
│   ├── models/            # Pydantic data models
│   │   ├── query.py       # Query data model
│   │   ├── response.py    # Response data model with validation
│   │   └── session.py     # Session data model
│   └── services/          # Business logic services
│       └── session_service.py # Session management
├── static/                # Static files
│   └── chatkit-widget.js  # Docusaurus ChatKit widget
├── tests/                 # Test suite
│   └── verify_success_criteria.py # Automated testing
├── docs/                  # Docusaurus content (textbook files)
├── .env.example          # Environment variables template
├── Dockerfile            # Docker configuration
├── start_server.sh       # Startup script for various environments
├── requirements.txt      # Python dependencies
├── deployment.md         # Deployment instructions
├── api-reference.md      # API documentation
└── README.md             # Project overview
```

## Integration Points

### Docusaurus Frontend
- **Script Injection**: Dynamic loading via docusaurus.config.ts
- **Widget Placement**: Automatic integration on all pages
- **Styling**: CSS customization for message icon visibility
- **Communication**: REST API calls to backend services

### External Services
- **Qdrant Cloud**: Vector database for semantic search
- **Neon Postgres**: Session and metadata storage
- **OpenRouter**: AI model access for embeddings and responses
- **Hugging Face Spaces**: Containerized deployment platform

## Maintenance and Operations

### Monitoring
- **Health Checks**: Regular service availability verification
- **Performance Metrics**: Response time and throughput tracking
- **Error Logging**: Comprehensive error and exception logging
- **Database Health**: Connection and query performance monitoring

### Scaling Considerations
- **Horizontal Scaling**: Stateless design supports multiple instances
- **Database Scaling**: Neon Postgres auto-scaling capabilities
- **Vector Database**: Qdrant Cloud performance tiers
- **CDN Integration**: Static asset delivery optimization

### Backup and Recovery
- **Database Backups**: Neon Postgres automated backups
- **Vector Database**: Qdrant Cloud backup features
- **Configuration**: Version control for all code and configuration
- **Recovery Procedures**: Documented disaster recovery processes

## Future Enhancements

### Planned Features
- **Improved Multi-turn Conversations**: Better context management
- **Enhanced Citations**: More detailed source information
- **Advanced Search**: Filter and facet capabilities
- **User Authentication**: Personalized session management
- **Analytics Dashboard**: Usage and performance metrics

### Performance Improvements
- **Caching Layer**: Redis or similar for frequently accessed content
- **Connection Pooling**: Optimized database connection management
- **Response Caching**: Cache common query responses
- **Model Optimization**: More efficient AI model usage

This RAG Chatbot system represents a comprehensive solution for interactive textbook learning, combining modern AI techniques with robust infrastructure to provide students and researchers with powerful search and conversation capabilities for the Physical AI & Humanoid Robotics textbook.