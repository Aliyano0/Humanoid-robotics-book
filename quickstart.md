# Quickstart Guide: RAG Chatbot for Humanoid Robotics Docusaurus Book

## Overview
This guide will help you set up and run the RAG chatbot for the Physical AI & Humanoid Robotics textbook. The system consists of a FastAPI backend that handles queries, retrieves relevant content from a Qdrant vector database, and generates responses using OpenAI's API via OpenRouter.

## Prerequisites
- Python 3.12+
- Docker (for containerized deployment)
- OpenRouter API key and endpoint URL
- Qdrant Cloud account and API key
- Neon Postgres database connection string

## Environment Setup

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

## Installation

1. Install Python dependencies:
```bash
uv pip install -r requirements.txt
```

2. For Docker deployment (recommended):
```bash
docker build -t rag-chatbot .
```

## Initial Setup: Embedding Book Content

Before using the chatbot, you need to embed the book content:

1. Run the embedding script:
```bash
python -c "import asyncio; from src.embed_book import embed_book_content; asyncio.run(embed_book_content())"
```

This will:
- Read all .md files from the Docusaurus `/docs` folder
- Chunk them into 200-250 token segments with 40-token overlap
- Generate embeddings using OpenRouter's text-embedding-3-large model
- Store embeddings in Qdrant
- Store metadata in Neon Postgres

## Running the Application

### Option 1: Direct Python execution
```bash
uvicorn src.main:app --host 0.0.0.0 --port 8000
```

### Option 2: Docker
```bash
docker run -p 8000:8000 --env-file .env rag-chatbot
```

The API will be available at `http://localhost:8000`

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

### Embed Endpoint (Internal Use)
For embedding new content:
```bash
curl -X POST http://localhost:8000/api/v1/embed \
  -H "Content-Type: application/json" \
  -d '{
    "file_path": "/docs/new-content.md",
    "content": "The content of the new markdown file..."
  }'
```

## Docusaurus Integration

To integrate the chatbot with your Docusaurus site:

1. Add the ChatKit widget script to your Docusaurus `static/` directory
2. Include the script in your Docusaurus configuration
3. Configure the backend URL to point to your deployed chatbot API

## Testing

Run the test suite to verify functionality:
```bash
pytest tests/
```

## Deployment

### Hugging Face Spaces
1. Create a Space with Docker environment
2. Push your Docker image or source code
3. Set the environment variables in the Space settings

### Railway
1. Connect your GitHub repository to Railway
2. Deploy the application with the appropriate environment variables
3. Scale as needed based on usage

## Troubleshooting

### Common Issues
- **Rate Limiting**: The system implements 10 requests per minute rate limiting. If you receive 429 errors, wait before making additional requests.
- **Vector Database Unavailable**: If Qdrant is unreachable, the system will return a graceful error message.
- **Missing Environment Variables**: Ensure all required environment variables are set before starting the application.

### Health Check
Check the system health at `/health` endpoint:
```bash
curl http://localhost:8000/health
```

## Next Steps
1. Customize the ChatKit widget to match your site's design
2. Fine-tune the AI model prompt for better book-specific responses
3. Add analytics to track usage and improve the system
4. Set up monitoring for the deployed service