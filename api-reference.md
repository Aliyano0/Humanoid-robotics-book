# API Reference: RAG Chatbot for Humanoid Robotics Docusaurus Book

## Overview

This document provides comprehensive API reference for the RAG Chatbot for Humanoid Robotics Docusaurus Book. The API is built with FastAPI and provides endpoints for chat interactions, content embedding, and health checks.

## Base URL

All API endpoints are relative to:
```
http://localhost:8000 (development)
https://your-deployment-url.com (production)
```

## Authentication

The API does not require authentication for basic operations, but rate limiting is enforced at 10 requests per minute per IP address.

## Rate Limiting

All endpoints are subject to rate limiting:
- **Limit**: 10 requests per minute
- **Status Code**: 429 Too Many Requests when limit is exceeded
- **Retry After**: 60 seconds

## Common Response Format

### Error Responses
```json
{
  "detail": "Error message"
}
```

---

## Endpoints

### GET /

**Description**: Root endpoint that returns a welcome message.

**Authentication**: None required

**Rate Limited**: Yes

**Response**:
```json
{
  "message": "RAG Chatbot API for Humanoid Robotics Book"
}
```

---

### GET /health

**Description**: Health check endpoint to verify all services are accessible.

**Authentication**: None required

**Rate Limited**: Yes

**Response**:
```json
{
  "status": "healthy|degraded",
  "checks": {
    "qdrant_connection": true|false,
    "neon_connection": true|false,
    "openrouter_connection": true|false
  },
  "timestamp": "2024-01-01T12:00:00.000000"
}
```

**Response Fields**:
- `status`: Overall health status ("healthy" if all services are accessible, "degraded" otherwise)
- `checks`: Individual service health status
- `timestamp`: ISO 8601 formatted timestamp of the check

---

### POST /api/v1/chat

**Description**: Process user query and return AI-generated response based on book content.

**Authentication**: None required

**Rate Limited**: Yes

**Request Body**:
```json
{
  "query": "string, required - The user's question or query",
  "selected_text": "string, optional - Text selected by user on the page",
  "session_id": "string, optional - Existing session ID for conversation continuity"
}
```

**Request Body Validation**:
- `query`: Required, 1-2000 tokens
- `selected_text`: Optional, 0-5000 tokens
- `session_id`: Optional, valid UUID format

**Example Request**:
```bash
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Explain ROS 2 nodes",
    "selected_text": "A ROS 2 node is an entity that uses ROS 2 to communicate with other nodes.",
    "session_id": "session_abc123"
  }'
```

**Success Response (200)**:
```json
{
  "response": "In ROS 2, a node is a fundamental unit of a ROS program that communicates with other nodes...",
  "session_id": "session_abc123",
  "citations": [
    {
      "file_path": "/docs/ros2-concepts.md",
      "section": "Understanding ROS 2 Nodes",
      "relevance_score": 0.89
    }
  ],
  "query_id": "query_def456",
  "response_id": "response_ghi789",
  "token_count": 42,
  "retrieved_chunks": 2
}
```

**Success Response Fields**:
- `response`: AI-generated response content
- `session_id`: Session identifier (newly created if not provided)
- `citations`: Array of source citations with file path, section, and relevance score
- `query_id`: Unique identifier for the query
- `response_id`: Unique identifier for the response
- `token_count`: Number of tokens in the response
- `retrieved_chunks`: Number of content chunks used to generate the response

**Error Responses**:
- `400 Bad Request`: Invalid request body or validation errors
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server-side error

---

### POST /api/v1/embed

**Description**: (Internal endpoint) Embed book content and store in vector database. This endpoint is intended for internal use only.

**Authentication**: None required

**Rate Limited**: Yes

**Request Body**:
```json
{
  "file_path": "string - Path to the .md file to be embedded",
  "content": "string - Content of the file to be chunked and embedded"
}
```

**Request Body Validation**:
- `file_path`: Required, non-empty string
- `content`: Required, non-empty string

**Example Request**:
```bash
curl -X POST http://localhost:8000/api/v1/embed \
  -H "Content-Type: application/json" \
  -d '{
    "file_path": "/docs/new-content.md",
    "content": "The content of the new markdown file..."
  }'
```

**Success Response (200)**:
```json
{
  "status": "success|partial|error",
  "chunks_processed": 5,
  "embedding_ids": ["id1", "id2", "id3", "id4", "id5"],
  "total_chunks": 5
}
```

**Success Response Fields**:
- `status`: Processing status ("success" if all chunks processed, "partial" if some failed, "error" if none processed)
- `chunks_processed`: Number of chunks successfully processed
- `embedding_ids`: Array of IDs for successfully embedded chunks
- `total_chunks`: Total number of chunks created from content

**Error Responses**:
- `400 Bad Request`: Missing required fields
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server-side error

---

## Data Models

### Query Model
- `text`: Query text (1-2000 tokens)
- `selected_text`: Optional selected text (0-5000 tokens)
- `session_id`: Session identifier (UUID)

### Response Model
- `content`: Response content
- `citations`: Array of citation objects
- `query_id`: Query identifier (UUID)
- `session_id`: Session identifier (UUID)
- `token_count`: Number of tokens in response (≤500)
- `retrieved_chunks`: Array of retrieved chunk IDs

### Citation Model
- `file_path`: Path to the source file
- `section`: Section title from the source
- `relevance_score`: Relevance score (0.0-1.0)

### Session Model
- `session_id`: Unique session identifier (UUID)
- `user_id`: Optional user identifier
- `created_at`: Session creation timestamp
- `last_activity`: Last activity timestamp
- `history`: Array of conversation turns
- `metadata`: Additional session metadata

---

## Error Codes

| Status Code | Error Type | Description |
|-------------|------------|-------------|
| 400 | Bad Request | Invalid request body or validation errors |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error |

---

## Response Time SLA

- **Target**: <10 seconds response time for 95% of requests
- **Timeout**: 30 seconds (requests exceeding this will return an error)

---

## Security Considerations

- Rate limiting is enforced on all endpoints
- Input validation is performed on all user-provided content
- No sensitive data is exposed in error messages
- Environment variables are used for API keys and connection strings