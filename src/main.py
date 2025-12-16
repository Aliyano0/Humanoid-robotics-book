import logging
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os
from typing import Dict, Any, Optional
from uuid import uuid4
import datetime

# Import our modules
from .config import config
from .rate_limiter import add_rate_limiting
from .qdrant_client import qdrant_manager
from .db import db
from .models.query import Query
from .models.response import Response as ResponseModel
from .services.session_service import session_service
from .retrieval import retrieval_service
from .agent import agent_service
from .utils import validate_query_text, validate_selected_text, count_tokens

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app with title from config
app = FastAPI(title=config.APP_TITLE)

# Add CORS middleware to allow requests from Docusaurus frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://aliyano0.github.io/Humanoid-robotics-book/"],  # In production, replace with specific origin like ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, OPTIONS, etc.)
    allow_headers=["*"],  # Allow all headers
    # Expose certain headers to browsers
    expose_headers=["Access-Control-Allow-Origin"]
)

# Add rate limiting
limiter = add_rate_limiting(app)

@app.get("/")
@limiter.limit(f"{config.RATE_LIMIT_REQUESTS}/minute")  # Apply rate limiting
def read_root(request: Request):
    return {"message": "RAG Chatbot API for Humanoid Robotics Book"}

@app.get("/health")
@limiter.limit(f"{config.RATE_LIMIT_REQUESTS}/minute")  # Apply rate limiting
def health_check(request: Request):
    """Health check endpoint to verify all services are accessible"""
    checks = {
        "qdrant_connection": False,
        "neon_connection": False,
        "openrouter_connection": False
    }

    # Check Qdrant connection
    try:
        collection_info = qdrant_manager.get_collection_info()
        checks["qdrant_connection"] = collection_info is not None
    except Exception:
        checks["qdrant_connection"] = False

    # Check Neon connection
    try:
        # Test database connection
        with db.get_cursor() as cursor:
            cursor.execute("SELECT 1")
        checks["neon_connection"] = True
    except Exception:
        checks["neon_connection"] = False

    # Check OpenRouter connection by verifying environment variables exist
    checks["openrouter_connection"] = bool(config.OPENROUTER_API_KEY and config.OPENROUTER_URL)

    # Overall status
    overall_status = "healthy" if all(checks.values()) else "degraded"

    return {
        "status": overall_status,
        "checks": checks,
        "timestamp": datetime.datetime.now().isoformat()
    }

@app.post("/api/v1/chat")
@limiter.limit(f"{config.RATE_LIMIT_REQUESTS}/minute")  # Apply rate limiting
async def chat_endpoint(request: Request):
    """
    Process user query and return AI-generated response based on book content
    Request body: {
      "query": "string, required - The user's question or query",
      "selected_text": "string, optional - Text selected by user on the page",
      "session_id": "string, optional - Existing session ID for conversation continuity"
    }
    """
    try:
        logger.info("Received chat request")

        # Parse the request body
        body = await request.json()
        query_text = body.get("query", "").strip()
        selected_text = body.get("selected_text", "")
        session_id = body.get("session_id")

        logger.info(f"Processing query: '{query_text[:50]}...' with session_id: {session_id}")

        # Validate inputs
        is_valid, error_msg = validate_query_text(query_text)
        if not is_valid:
            logger.warning(f"Invalid query text: {error_msg}")
            raise HTTPException(status_code=400, detail=error_msg)

        if selected_text:
            is_valid, error_msg = validate_selected_text(selected_text)
            if not is_valid:
                logger.warning(f"Invalid selected text: {error_msg}")
                raise HTTPException(status_code=400, detail=error_msg)

        # If no session_id provided, create a new session
        if not session_id:
            logger.info("No session_id provided, creating new session")
            session = await session_service.create_anonymous_session()
            session_id = session.session_id
        else:
            # Try to get existing session
            session = await session_service.get_session(session_id)
            if not session:
                # If session doesn't exist or is expired, create a new one
                logger.info(f"Session {session_id} not found or expired, creating new session")
                session = await session_service.create_anonymous_session()
                session_id = session.session_id

        # Get conversation history for multi-turn context
        conversation_history = await session_service.get_conversation_history(session_id)

        # Create query object
        query_obj = Query(
            text=query_text,
            selected_text=selected_text if selected_text else None,
            session_id=session_id
        )

        # Check if vector database is available
        vector_db_healthy = await retrieval_service.check_vector_database_health()
        if not vector_db_healthy:
            logger.warning("Vector database is unavailable, returning graceful error response")
            # If vector database is unavailable, return a graceful error response
            fallback_response = await agent_service.generate_fallback_response(
                "The system is currently experiencing issues retrieving content from the textbook. Please try again later."
            )

            response_obj = ResponseModel(
                content=fallback_response['content'],
                citations=[],
                query_id=query_obj.id,
                session_id=session_id,
                token_count=fallback_response['token_count'],
                retrieved_chunks=[]
            )

            # Add the interaction to the session history
            await session_service.add_interaction_to_session(session_id, query_obj, response_obj)

            logger.info(f"Returning fallback response for session {session_id}")
            return {
                "response": response_obj.content,
                "session_id": session_id,
                "citations": [],
                "query_id": query_obj.id,
                "response_id": response_obj.id,
                "token_count": response_obj.token_count,
                "retrieved_chunks": 0
            }

        # Retrieve relevant context
        logger.info(f"Retrieving relevant context for query in session {session_id}")
        retrieval_result = await retrieval_service.retrieve_and_enrich_context(
            query_text,
            selected_text
        )

        # If no relevant content found, return a fallback response
        if not retrieval_result['context'].strip():
            logger.info("No relevant content found, generating fallback response")
            agent_response = await agent_service.generate_fallback_response(query_text)
        else:
            logger.info(f"Found {len(retrieval_result['retrieved_chunks'])} relevant chunks, generating response")
            # Generate response using the agent with conversation history
            agent_response = await agent_service.generate_response(
                query=query_text,
                context=retrieval_result['context'],
                selected_text=selected_text,
                conversation_history=conversation_history
            )

        # Create response object
        response_obj = ResponseModel(
            content=agent_response['content'],
            citations=retrieval_result['citations'],
            query_id=query_obj.id,
            session_id=session_id,
            token_count=agent_response['token_count'],
            retrieved_chunks=[chunk['id'] for chunk in retrieval_result['retrieved_chunks']]
        )

        # Add the interaction to the session history
        await session_service.add_interaction_to_session(session_id, query_obj, response_obj)

        logger.info(f"Successfully processed chat request, response tokens: {response_obj.token_count}")

        # Return the response in the required format
        return {
            "response": response_obj.content,
            "session_id": session_id,
            "citations": [
                {
                    "file_path": citation.file_path,
                    "section": citation.section,
                    "relevance_score": citation.relevance_score
                }
                for citation in response_obj.citations
            ],
            "query_id": query_obj.id,
            "response_id": response_obj.id,
            "token_count": response_obj.token_count,
            "retrieved_chunks": len(response_obj.retrieved_chunks)
        }

    except HTTPException:
        # Re-raise HTTP exceptions
        logger.warning(f"HTTP exception in chat endpoint: {e}")
        raise
    except Exception as e:
        # Handle any other errors
        logger.error(f"Error in chat endpoint: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


@app.post("/api/v1/embed")
@limiter.limit(f"{config.RATE_LIMIT_REQUESTS}/minute")  # Apply rate limiting
async def embed_endpoint(request: Request):
    """
    (Internal endpoint) Embed book content and store in vector database
    Request body: {
      "file_path": "string - Path to the .md file to be embedded",
      "content": "string - Content of the file to be chunked and embedded"
    }
    """
    try:
        # Parse the request body
        body = await request.json()
        file_path = body.get("file_path", "").strip()
        content = body.get("content", "")

        if not file_path or not content:
            raise HTTPException(status_code=400, detail="file_path and content are required")

        # Import embed_book functionality
        from .embed_book import BookEmbedder

        # Create embedder instance
        embedder = BookEmbedder()

        # Create a document from the provided content
        doc = {
            'file_path': file_path,
            'content': content,
            'section_title': embedder._extract_title(content) or file_path,
            'position': 0
        }

        # Process the document into chunks
        chunks = embedder.process_documents([doc])

        if not chunks:
            return {
                "status": "error",
                "message": "No valid chunks created from content",
                "chunks_processed": 0,
                "embedding_ids": []
            }

        # Embed and store the chunks
        processed_count, embedding_ids = await embedder.embed_and_store_chunks(chunks)

        return {
            "status": "success" if processed_count > 0 else "partial",
            "chunks_processed": processed_count,
            "embedding_ids": embedding_ids,
            "total_chunks": len(chunks)
        }

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Handle any other errors
        print(f"Error in embed endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")