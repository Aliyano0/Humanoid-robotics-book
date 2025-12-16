# Railway Configuration

This project is configured for deployment on Railway.

## Variables Required

The following environment variables must be set in your Railway project:

- `OPENROUTER_API_KEY`: Your OpenRouter API key
- `OPENROUTER_URL`: Your OpenRouter base URL
- `QDRANT_API_KEY`: Your Qdrant Cloud API key
- `QDRANT_CLUSTER_ENDPOINT`: Your Qdrant cluster endpoint URL
- `NEON_POSTGRES_URL`: Your Neon Postgres connection string

## Deployment

1. Connect your GitHub repository to Railway
2. Create a new project and link it to this repository
3. Add the required environment variables in the Variables section
4. Deploy the application

## Post-Deployment Steps

After the initial deployment, you may need to run the embedding process to populate your vector database with book content. You can do this by calling the `/api/v1/embed` endpoint with your book content.

## Scaling

The application is designed to handle multiple concurrent users with rate limiting (10 requests/minute). For higher loads, consider scaling the instance size in Railway settings.

## Health Checks

The application provides a health check endpoint at `/health` that verifies connectivity to all external services.