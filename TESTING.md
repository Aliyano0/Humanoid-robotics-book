# Testing Guide: RAG Chatbot for Humanoid Robotics Docusaurus Book

## Overview
This guide provides step-by-step instructions to verify all functionalities of the RAG Chatbot system locally before deployment.

## Prerequisites
- Python 3.12+
- UV package manager
- Docker (for optional containerized testing)
- Access to external services (Qdrant Cloud, Neon Postgres, OpenRouter)

## Setup for Local Testing

### 1. Install Dependencies
```bash
# Using UV (recommended)
uv pip install -r requirements.txt

# Or using pip
pip install -r requirements.txt
```

### 2. Set Up Environment Variables
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your actual credentials
nano .env
```

Required environment variables:
- `OPENROUTER_API_KEY` - Your OpenRouter API key
- `OPENROUTER_URL` - Your OpenRouter base URL
- `QDRANT_API_KEY` - Your Qdrant Cloud API key
- `QDRANT_CLUSTER_ENDPOINT` - Your Qdrant cluster endpoint URL
- `NEON_POSTGRES_URL` - Your Neon Postgres connection string

### 3. Start the Local Server
```bash
# Using the start script
./start_server.sh

# Or directly with uvicorn
uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

The server will be available at `http://localhost:8000`

## Functionality Tests

### Test 1: Health Check
**Purpose**: Verify all external services are accessible

**Command**:
```bash
curl http://localhost:8000/health
```

**Expected Response**:
```json
{
  "status": "healthy",
  "checks": {
    "qdrant_connection": true,
    "neon_connection": true,
    "openrouter_connection": true
  },
  "timestamp": "2024-01-01T12:00:00.000000"
}
```

### Test 2: Basic Chat Functionality
**Purpose**: Verify the chat endpoint works with basic queries

**Command**:
```bash
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is a humanoid robot?"
  }'
```

**Expected Response**:
- Status: 200 OK
- Response should contain meaningful content about humanoid robots
- Should include citations if book content is available
- Should have session_id, query_id, response_id, token_count, and retrieved_chunks

### Test 3: Selected Text Functionality
**Purpose**: Verify the system prioritizes selected text in responses

**Command**:
```bash
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Summarize this text",
    "selected_text": "Humanoid robots are robots with physical features resembling the human body."
  }'
```

**Expected Response**:
- Response should focus on the selected text
- Should provide relevant information based on the selected content

### Test 4: Session Continuity (Multi-turn Conversations)
**Purpose**: Verify conversation history is maintained across requests

**Step 1**: Create a session with first query
```bash
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is ROS 2?",
    "session_id": "test-session-123"
  }'
```

**Step 2**: Continue the session with a follow-up query
```bash
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "How do nodes communicate in ROS 2?",
    "session_id": "test-session-123"
  }'
```

**Expected Response**:
- Both requests should use the same session_id
- Second response should reference the context from the first query

### Test 5: Rate Limiting
**Purpose**: Verify rate limiting is enforced at 10 requests per minute

**Command**:
```bash
# Run multiple requests quickly
for i in {1..15}; do
  curl -X POST http://localhost:8000/api/v1/chat \
    -H "Content-Type: application/json" \
    -d '{"query": "Test rate limiting ' $i '"}' &
done
wait
```

**Expected Response**:
- Some requests should return status 429 (Too Many Requests)
- Rate limiting should be enforced at 10 requests per minute

### Test 6: Embedding Endpoint (Internal Use)
**Purpose**: Verify the embedding functionality works

**Command**:
```bash
curl -X POST http://localhost:8000/api/v1/embed \
  -H "Content-Type: application/json" \
  -d '{
    "file_path": "/docs/test-content.md",
    "content": "This is a test content for embedding."
  }'
```

**Expected Response**:
- Should return embedding status and processed chunk information

### Test 7: Root Endpoint
**Purpose**: Verify the root endpoint works

**Command**:
```bash
curl http://localhost:8000/
```

**Expected Response**:
```json
{
  "message": "RAG Chatbot API for Humanoid Robotics Book"
}
```

## Verification Checklist

### ✅ Core Functionality
- [ ] Server starts without errors
- [ ] Health check returns "healthy" status
- [ ] Basic chat queries return meaningful responses
- [ ] Selected text functionality works
- [ ] Session continuity is maintained
- [ ] Rate limiting is enforced
- [ ] Root endpoint returns expected message

### ✅ Response Format
- [ ] Responses include all required fields (response, session_id, citations, etc.)
- [ ] Citations contain file_path, section, and relevance_score
- [ ] Token counts are within limits
- [ ] Error responses follow proper format

### ✅ Error Handling
- [ ] Invalid queries return proper error messages
- [ ] Rate limit exceeded returns 429 status
- [ ] Service unavailability is handled gracefully
- [ ] Empty or malformed requests are handled properly

## Testing the Book Content

Before full testing, you'll need to embed some book content. If you have markdown files in a `/docs` folder, you can run:

```bash
# Run the embedding process
python -c "import asyncio; from src.embed_book import embed_book_content; asyncio.run(embed_book_content())"
```

Or if you want to embed a single piece of content:
```bash
curl -X POST http://localhost:8000/api/v1/embed \
  -H "Content-Type: application/json" \
  -d '{
    "file_path": "/docs/introduction.md",
    "content": "# Introduction to Humanoid Robotics\n\nHumanoid robots are robots with physical features resembling the human body..."
  }'
```

## Troubleshooting

### Common Issues

1. **Connection Errors**:
   - Verify environment variables are set correctly
   - Check network connectivity to external services
   - Ensure API keys are valid and have proper permissions

2. **Empty Responses**:
   - Verify book content has been embedded in the vector database
   - Check that the embedding process completed successfully

3. **Rate Limiting Issues**:
   - Wait 60 seconds between bursts of requests
   - Verify rate limiting configuration in `src/rate_limiter.py`

4. **Database Connection Issues**:
   - Verify Neon Postgres connection string is correct
   - Check that the database schema has been initialized

### Logs
Check the server logs for any errors or warnings:
- Look for log messages starting with "ERROR" or "WARNING"
- Pay attention to connection failure messages
- Monitor for rate limiting triggers

## Next Steps Before Deployment

Once all tests pass locally:

1. **Verify with Real Content**: Test with actual book content to ensure the system works as expected
2. **Performance Testing**: Run the load tests to ensure the system can handle expected traffic
3. **Security Check**: Verify no sensitive information is exposed in responses
4. **Documentation Review**: Ensure all deployment documentation is accurate

## Running Automated Tests

You can also run the automated test suites that were created:

```bash
# Run basic tests
python -m pytest tests/ -v

# Run integration tests
python tests/integration_test.py

# Run success criteria verification
python tests/verify_success_criteria.py

# Run load tests (adjust BASE_URL as needed)
python tests/load_test.py
```

After successful local testing, the system will be ready for deployment to your chosen platform.