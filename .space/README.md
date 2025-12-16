# Hugging Face Space Configuration

This Space runs the RAG Chatbot for Humanoid Robotics Docusaurus Book using Docker.

## Configuration

The Space is configured to run a FastAPI application that provides a RAG chatbot interface for humanoid robotics book content. The application connects to external services (Qdrant Cloud, Neon Postgres, OpenRouter) using environment variables.

## Environment Variables Required

You need to set the following secrets in your Space settings:

- `OPENROUTER_API_KEY`: Your OpenRouter API key
- `OPENROUTER_URL`: Your OpenRouter base URL
- `QDRANT_API_KEY`: Your Qdrant Cloud API key
- `QDRANT_CLUSTER_ENDPOINT`: Your Qdrant cluster endpoint URL
- `NEON_POSTGRES_URL`: Your Neon Postgres connection string

## How It Works

1. The application runs as a FastAPI service on port 8000
2. It connects to Qdrant Cloud for vector storage and retrieval
3. It connects to Neon Postgres for session and metadata storage
4. It uses OpenRouter API for embeddings and AI responses
5. Book content must be pre-embedded using the embed endpoint

## Limitations

- This Space only hosts the backend API
- For full functionality, you need to integrate with a Docusaurus site using ChatKit
- External services (Qdrant, Neon, OpenRouter) must be configured separately