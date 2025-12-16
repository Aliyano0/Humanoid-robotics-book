from qdrant_client import QdrantClient
from qdrant_client.http import models
from qdrant_client.http.models import Distance, VectorParams
import os
from dotenv import load_dotenv
from typing import List, Dict, Optional
import uuid

load_dotenv()

class QdrantManager:
    def __init__(self):
        # Initialize Qdrant client with cluster endpoint and API key
        self.client = QdrantClient(
            url=os.getenv("QDRANT_CLUSTER_ENDPOINT"),
            api_key=os.getenv("QDRANT_API_KEY"),
            prefer_grpc=True  # Use gRPC for better performance if available
        )

        # Collection name for book content
        self.collection_name = "book_content_chunks"

        # Initialize the collection if it doesn't exist
        self._init_collection()

    def _init_collection(self):
        """Initialize the Qdrant collection for storing book content chunks"""
        try:
            # Check if collection exists
            collections = self.client.get_collections()
            collection_exists = any(col.name == self.collection_name for col in collections.collections)

            if not collection_exists:
                # Create collection with vector configuration
                # Using 3072 dimensions for text-embedding-3-large model
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=VectorParams(size=3072, distance=Distance.COSINE),
                )

                print(f"Created Qdrant collection: {self.collection_name}")
            else:
                print(f"Qdrant collection {self.collection_name} already exists")

        except Exception as e:
            print(f"Error initializing Qdrant collection: {e}")
            raise

    def upsert_vectors(self, vectors: List[Dict], payloads: List[Dict]):
        """Upsert vectors with their payloads to the collection"""
        try:
            points = []
            for i, (vector, payload) in enumerate(zip(vectors, payloads)):
                point = models.PointStruct(
                    id=str(uuid.uuid4()),
                    vector=vector,
                    payload=payload
                )
                points.append(point)

            self.client.upsert(
                collection_name=self.collection_name,
                points=points
            )

            print(f"Upserted {len(points)} vectors to collection {self.collection_name}")
            return True

        except Exception as e:
            print(f"Error upserting vectors: {e}")
            return False

    def search_vectors(self, query_vector: List[float], top_k: int = 5, score_threshold: float = 0.7):
        """Search for similar vectors in the collection"""
        try:
            search_results = self.client.query_points(
                collection_name=self.collection_name,
                query=query_vector,
                limit=top_k,
                score_threshold=score_threshold,
                with_payload=True
            )

            # Format results to include payload and score
            results = []
            for result in search_results.points:
                results.append({
                    'id': result.id,
                    'payload': result.payload,
                    'score': result.score
                })

            print(f"Found {len(results)} similar chunks in collection {self.collection_name}")
            return results

        except Exception as e:
            print(f"Error searching vectors: {e}")
            return []

    def get_collection_info(self):
        """Get information about the collection"""
        try:
            info = self.client.get_collection(self.collection_name)
            return {
                'name': info.config.params.vectors.size,
                'vector_size': info.config.params.vectors.size,
                'count': info.points_count
            }
        except Exception as e:
            print(f"Error getting collection info: {e}")
            return None

# Global Qdrant instance
qdrant_manager = QdrantManager()