#!/bin/bash
# Startup script for Hugging Face Spaces

echo "Starting RAG Chatbot for Humanoid Robotics Docusaurus Book..."
echo "Environment: Hugging Face Spaces"
echo ""

# Set default port if not provided (Hugging Face Spaces requirement)
if [ -z "$PORT" ]; then
    export PORT=7860
    echo "PORT not set, using default: $PORT"
else
    echo "Using PORT: $PORT"
fi

# Check if .env file exists (for local development)
if [ -f ".env" ]; then
    echo "Loading environment variables from .env file..."
    export $(grep -v '^#' .env | xargs)
else
    echo "No .env file found. Using environment variables from Hugging Face Secrets..."
fi

echo "Starting server on port $PORT..."
echo ""

# Start the server using uvicorn with the provided port
# Use --reload only for development, not for production deployment
exec uvicorn src.main:app --host 0.0.0.0 --port $PORT