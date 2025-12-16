from typing import List, Dict, Optional
from openai import AsyncOpenAI
import os
from dotenv import load_dotenv
import asyncio

# Import our modules
from .config import config
from .qdrant_client import qdrant_manager
from .db import db
from .utils import count_tokens

load_dotenv()

class RetrievalService:
    """Service for retrieving relevant book content using vector similarity search"""

    def __init__(self):
        # Initialize OpenAI client with OpenRouter settings
        self.client = AsyncOpenAI(
            base_url=config.OPENROUTER_URL,
            api_key=config.OPENROUTER_API_KEY
        )

    async def embed_text(self, text: str) -> List[float]:
        """Generate embedding for a text using OpenRouter API with text-embedding-3-large model"""
        try:
            response = await self.client.embeddings.create(
                input=text,
                model=config.EMBEDDING_MODEL  # text-embedding-3-large
            )

            # Return the embedding vector
            embedding = response.data[0].embedding
            return embedding
        except Exception as e:
            print(f"Error generating embedding: {e}")
            raise

    async def embed_multiple_texts(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for multiple texts efficiently"""
        try:
            response = await self.client.embeddings.create(
                input=texts,
                model=config.EMBEDDING_MODEL  # text-embedding-3-large
            )

            # Return the embedding vectors
            embeddings = [data.embedding for data in response.data]
            return embeddings
        except Exception as e:
            print(f"Error generating embeddings for multiple texts: {e}")
            raise

    async def retrieve_relevant_chunks(self, query: str, selected_text: Optional[str] = None) -> List[Dict]:
        """Retrieve relevant content chunks based on query and optional selected text"""
        try:
            # If selected text is provided and not empty, use it as higher priority context
            search_text = query
            if selected_text and selected_text.strip():
                # Combine query with selected text, giving selected text higher priority
                search_text = f"Context: {selected_text}\nQuestion: {query}"

            # Generate embedding for the search text
            query_embedding = await self.embed_text(search_text)

            # Search in Qdrant for similar chunks
            search_results = qdrant_manager.search_vectors(
                query_vector=query_embedding,
                top_k=config.SEARCH_TOP_K,
                score_threshold=config.SEARCH_SCORE_THRESHOLD
            )

            # If selected text was provided, also search specifically for content similar to the selected text
            if selected_text and selected_text.strip():
                try:
                    # Create embedding specifically for selected text
                    selected_text_embedding = await self.embed_text(selected_text)

                    # Search for chunks similar to the selected text
                    selected_text_results = qdrant_manager.search_vectors(
                        query_vector=selected_text_embedding,
                        top_k=config.SEARCH_TOP_K,
                        score_threshold=config.SEARCH_SCORE_THRESHOLD * 0.8  # Slightly lower threshold for selected text
                    )

                    # Add these results to the main results, prioritizing them
                    for result in selected_text_results:
                        # Check if this result is already in our main results
                        if not any(r['id'] == result['id'] for r in search_results):
                            # Add to the beginning to prioritize selected text context
                            search_results.insert(0, result)
                            # Limit the total results to avoid too many chunks
                            search_results = search_results[:config.SEARCH_TOP_K]
                except Exception as e:
                    print(f"Error searching for selected text context: {e}")
                    # Continue with original search results if selected text search fails

            # For each result, fetch additional metadata from Neon if needed
            retrieved_chunks = []
            for result in search_results:
                chunk_info = {
                    'id': result['id'],
                    'content': result['payload'].get('content', ''),
                    'file_path': result['payload'].get('file_path', ''),
                    'section': result['payload'].get('section', ''),
                    'score': result['score'],
                    'metadata': result['payload']
                }
                retrieved_chunks.append(chunk_info)

            return retrieved_chunks

        except Exception as e:
            print(f"Error during retrieval: {e}")
            # Return empty list if there's an error (graceful handling)
            return []

    async def check_vector_database_health(self) -> bool:
        """Check if the vector database (Qdrant) is accessible"""
        try:
            collection_info = qdrant_manager.get_collection_info()
            return collection_info is not None
        except Exception as e:
            print(f"Vector database health check failed: {e}")
            return False

    async def retrieve_and_enrich_context(self, query: str, selected_text: Optional[str] = None) -> Dict:
        """Retrieve relevant context and enrich it with metadata for the AI agent"""
        # Get relevant chunks
        relevant_chunks = await self.retrieve_relevant_chunks(query, selected_text)

        # Build context for the agent
        context_parts = []
        citations = []

        for chunk in relevant_chunks:
            context_parts.append(f"Source: {chunk['file_path']} - {chunk['section']}\nContent: {chunk['content']}")

            citations.append({
                'file_path': chunk['file_path'],
                'section': chunk['section'],
                'relevance_score': chunk['score']
            })

        # Combine all context parts
        combined_context = "\n\n".join(context_parts)

        return {
            'context': combined_context,
            'citations': citations,
            'retrieved_chunks': relevant_chunks
        }

# Global retrieval service instance
retrieval_service = RetrievalService()