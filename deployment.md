# Deployment Guide: RAG Chatbot for Humanoid Robotics Docusaurus Book

## Overview

This guide provides detailed instructions for deploying the RAG Chatbot for Humanoid Robotics Docusaurus Book application. The system can be deployed on various platforms including self-hosted servers, Hugging Face Spaces, and Railway.

## Prerequisites

Before deploying the application, ensure you have the following:

- **Qdrant Cloud Account**: For vector storage and similarity search
- **Neon Postgres Account**: For session and metadata storage
- **OpenRouter Account**: For API access to embeddings and AI models
- **Docker**: For containerized deployment (recommended)
- **Git**: For version control and deployment

## Environment Variables

The application requires the following environment variables:

```env
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_URL=your_openrouter_base_url
QDRANT_API_KEY=your_qdrant_api_key
QDRANT_CLUSTER_ENDPOINT=your_qdrant_cluster_endpoint
NEON_POSTGRES_URL=your_neon_postgres_connection_string
```

## Deployment Options

### Option 1: Self-Hosted with Docker

#### Prerequisites
- Docker and Docker Compose installed
- Access to external services (Qdrant, Neon, OpenRouter)

#### Steps

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

3. **Update `.env` with your credentials:**
   ```bash
   nano .env
   ```

4. **Build and run the application:**
   ```bash
   docker-compose up -d
   ```

5. **Run the embedding process:**
   ```bash
   # After the application is running, execute:
   docker exec -it <container-name> python -c "import asyncio; from src.embed_book import embed_book_content; asyncio.run(embed_book_content())"
   ```

6. **Access the application:**
   - API: `http://localhost:8000`
   - Health Check: `http://localhost:8000/health`

#### Production Considerations
- Use a reverse proxy (nginx) with SSL
- Implement proper logging and monitoring
- Set up backup procedures for external databases
- Configure health checks and auto-restart policies

### Option 2: Hugging Face Spaces

#### Prerequisites
- Hugging Face account
- Access to external services (Qdrant, Neon, OpenRouter)

#### Steps

1. **Create a new Space on Hugging Face:**
   - Go to [huggingface.co/spaces](https://huggingface.co/spaces)
   - Click "Create Space"
   - Choose "Docker" SDK
   - Choose appropriate hardware specifications

2. **Configure the Space:**
   - Set the repository to your fork of this repository
   - In the Space settings, add the required environment variables as "Secrets"

3. **Add secrets in Space settings:**
   - `OPENROUTER_API_KEY`
   - `OPENROUTER_URL`
   - `QDRANT_API_KEY`
   - `QDRANT_CLUSTER_ENDPOINT`
   - `NEON_POSTGRES_URL`

4. **The Space will automatically build and deploy using the configuration in `.space/Dockerfile`**

#### Configuration Details
- The `.space/` directory contains Hugging Face specific configuration
- The application will run on port 8000
- The embedding process will run automatically on startup

### Option 3: Railway

#### Prerequisites
- Railway account
- Access to external services (Qdrant, Neon, OpenRouter)

#### Steps

1. **Connect your GitHub repository to Railway:**
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub"
   - Choose your repository

2. **Configure variables:**
   - Go to the "Variables" tab
   - Add the following variables:
     - `OPENROUTER_API_KEY`
     - `OPENROUTER_URL`
     - `QDRANT_API_KEY`
     - `QDRANT_CLUSTER_ENDPOINT`
     - `NEON_POSTGRES_URL`

3. **Deploy the application:**
   - Go to the "Deploy" tab
   - Click "Deploy Now" or enable automatic deployment from your branch

4. **The application will be deployed using the configuration in `railway.json`**

#### Railway Configuration
- The `railway.json` file defines the build and deploy configuration
- Health checks are configured to use the `/health` endpoint
- The application will run with the specified environment variables

## Post-Deployment Steps

### 1. Embed Book Content
After the application is deployed and running, you need to embed your book content:

```bash
# If running locally
python -c "import asyncio; from src.embed_book import embed_book_content; asyncio.run(embed_book_content())"

# Or call the embed endpoint directly if you have the content
curl -X POST http://your-deployment-url/api/v1/embed \
  -H "Content-Type: application/json" \
  -d '{
    "file_path": "/docs/introduction.md",
    "content": "Your book content here..."
  }'
```

### 2. Verify Deployment
Check that all services are working properly:

```bash
curl http://your-deployment-url/health
```

Expected response:
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

### 3. Test Basic Functionality
Test the chat endpoint:

```bash
curl -X POST http://your-deployment-url/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is this book about?"
  }'
```

## Monitoring and Maintenance

### Health Monitoring
- Use the `/health` endpoint for health checks
- Monitor response times and error rates
- Set up alerts for service degradation

### Performance Monitoring
- Track response times for the chat endpoint
- Monitor rate limiting effectiveness
- Watch database connection pools

### Logging
The application logs to stdout with the following format:
```
YYYY-MM-DD HH:MM:SS - logger_name - LEVEL - log_message
```

### Backup and Recovery
- Regular backups of Neon Postgres database
- Export vector database periodically (Qdrant backup features)
- Version control for application code and configuration

## Scaling Considerations

### Horizontal Scaling
- The application is stateless (except for session storage in Neon)
- Can be scaled horizontally behind a load balancer
- Rate limiting is per-instance, so consider centralized rate limiting for large deployments

### Vertical Scaling
- Increase instance resources for higher throughput
- More memory for larger context windows
- Better CPU for faster processing

### Database Scaling
- Neon Postgres scales automatically
- Qdrant Cloud offers various performance tiers
- Consider read replicas for high-read scenarios

## Troubleshooting

### Common Issues

#### 1. Rate Limiting
- **Symptom**: 429 responses
- **Solution**: Respect the 10 requests/minute limit per IP

#### 2. Connection Issues
- **Symptom**: Health check shows services as unhealthy
- **Solution**: Verify environment variables and network connectivity

#### 3. Empty Responses
- **Symptom**: Chat returns empty responses
- **Solution**: Verify book content is embedded in vector database

#### 4. High Response Times
- **Symptom**: Responses taking longer than 10 seconds
- **Solution**: Check external service performance, consider scaling

### Debugging Steps
1. Check health endpoint: `GET /health`
2. Verify environment variables are set correctly
3. Check application logs for errors
4. Test external service connectivity separately
5. Validate book content is properly embedded

## Security Considerations

### API Keys
- Store API keys as environment variables, never in code
- Use secret management in deployment platforms
- Rotate keys regularly

### Rate Limiting
- Built-in rate limiting at 10 requests/minute
- Consider additional security measures for production
- Monitor for abuse patterns

### Data Privacy
- No user data is stored beyond session information
- All processing happens server-side
- External services handle AI and vector operations

## Updating the Application

### For Self-Hosted Deployments
1. Pull the latest code: `git pull origin main`
2. Rebuild the Docker image: `docker-compose build`
3. Restart the application: `docker-compose up -d`

### For Platform Deployments
- Updates happen automatically with connected GitHub repositories
- Review changes before merging to production branch

## Support

For issues with deployment:
1. Check the [API Reference](api-reference.md) for endpoint details
2. Review the [Quickstart Guide](../quickstart.md) for setup instructions
3. Examine application logs for error details
4. Verify all external services are accessible
5. Contact the development team if issues persist