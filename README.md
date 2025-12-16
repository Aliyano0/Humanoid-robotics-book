# RAG Chatbot for Humanoid Robotics Docusaurus Book

## Overview

This project implements an integrated RAG (Retrieval-Augmented Generation) chatbot for the Physical AI & Humanoid Robotics Docusaurus Book. The system uses Python FastAPI backend with OpenRouter API for embeddings and AI operations, Qdrant Cloud for vector storage, and Neon Postgres for metadata/session storage. The chatbot integrates with Docusaurus via ChatKit widget, supporting book content queries, selected text processing, and multi-turn conversations.

## Features

- **Query Book Content**: Ask questions about humanoid robotics concepts and get accurate responses with citations
- **Selected Text Processing**: Highlight text and ask the chatbot to summarize or explain it
- **Multi-turn Conversations**: Maintain context across multiple exchanges in a session
- **Citation System**: All responses include citations to specific sections of the book
- **Rate Limiting**: Built-in rate limiting at 10 requests per minute
- **Session Management**: Persistent conversation sessions with timeout handling

## Architecture

- **Backend**: Python FastAPI
- **Vector Database**: Qdrant Cloud
- **Metadata Storage**: Neon Postgres
- **AI Provider**: OpenRouter API
- **Frontend Integration**: ChatKit widget for Docusaurus

## Prerequisites

- Python 3.12+
- Docker (for containerized deployment)
- OpenRouter API key and endpoint URL
- Qdrant Cloud account and API key
- Neon Postgres database connection string

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Fill in the required environment variables in `.env`:
   ```env
   OPENROUTER_API_KEY=your_openrouter_api_key
   OPENROUTER_URL=your_openrouter_base_url
   QDRANT_API_KEY=your_qdrant_api_key
   QDRANT_CLUSTER_ENDPOINT=your_qdrant_cluster_endpoint
   NEON_POSTGRES_URL=your_neon_postgres_connection_string
   ```

4. Install Python dependencies:
   ```bash
   uv pip install -r requirements.txt
   # or
   pip install -r requirements.txt
   ```

## Local Development

### Starting the Server

```bash
# Using the start script
./start_server.sh

# Or directly with uvicorn
uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

### Verifying Local Functionality

1. Run the verification script:
   ```bash
   python verify_local.py
   ```

2. Or manually test using the instructions in [TESTING.md](TESTING.md)

### Embedding Book Content

Before using the chatbot, you need to embed the book content:

```bash
python -c "import asyncio; from src.embed_book import embed_book_content; asyncio.run(embed_book_content())"
```

This will:
- Read all .md files from the Docusaurus `/docs` folder
- Chunk them into 200-250 token segments with 40-token overlap
- Generate embeddings using OpenRouter's text-embedding-3-large model
- Store embeddings in Qdrant
- Store metadata in Neon Postgres

## API Usage

### Chat Endpoint
Send a POST request to `/api/v1/chat`:

```bash
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Explain ROS 2 nodes",
    "selected_text": "A ROS 2 node is an entity that uses ROS 2 to communicate with other nodes.",
    "session_id": "session_abc123"
  }'
```

### Response Format
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

## Testing

Run the full test suite:

```bash
# Run basic tests
python -m pytest tests/ -v

# Run integration tests
python tests/integration_test.py

# Run success criteria verification
python tests/verify_success_criteria.py

# Run load tests
python tests/load_test.py
```

## Deployment

See [docs/deployment.md](docs/deployment.md) for detailed deployment instructions for:
- Self-hosted with Docker
- Hugging Face Spaces
- Railway

## Documentation

- [API Reference](docs/api-reference.md)
- [Deployment Guide](docs/deployment.md)
- [Quickstart Guide](quickstart.md)
- [Testing Guide](TESTING.md)

## Project Structure

```
├── src/                    # Source code
│   ├── main.py            # FastAPI application
│   ├── models/            # Data models
│   ├── services/          # Business logic services
│   ├── retrieval.py       # Vector retrieval logic
│   ├── agent.py           # AI agent integration
│   ├── db.py             # Database operations
│   ├── qdrant_client.py  # Qdrant client
│   ├── config.py         # Configuration
│   ├── utils.py          # Utility functions
│   └── embed_book.py     # Content embedding
├── tests/                 # Test suite
├── docs/                  # Documentation
├── static/                # Static files
├── requirements.txt       # Python dependencies
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose configuration
├── .env.example          # Environment variables example
├── quickstart.md         # Quickstart guide
├── TESTING.md            # Testing guide
└── README.md             # This file
```

## License

[Specify your license here]
