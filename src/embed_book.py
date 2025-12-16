import os
import asyncio
from pathlib import Path
from typing import List, Dict, Tuple
import glob
from uuid import uuid4

# Import our modules
from .config import config
from .utils import chunk_text, count_tokens
from .qdrant_client import qdrant_manager
from .db import db


class BookEmbedder:
    """Class for processing Docusaurus /docs folder and embedding content"""

    def __init__(self):
        self.docs_path = Path("docs")  # Default Docusaurus docs folder
        self.processed_count = 0
        self.failed_count = 0

    def read_md_files(self, docs_path: str = None) -> List[Dict[str, str]]:
        """Read all .md and .mdx files from the docs directory"""
        if docs_path:
            self.docs_path = Path(docs_path)

        if not self.docs_path.exists():
            print(f"Docs directory {self.docs_path} does not exist")
            return []

        # Look for both .md and .mdx files (Docusaurus supports both)
        md_files = list(self.docs_path.rglob("*.md")) + list(self.docs_path.rglob("*.mdx"))
        print(f"Found {len(md_files)} markdown files in {self.docs_path}")

        documents = []
        for file_path in md_files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Create a document object
                doc = {
                    'file_path': str(file_path.relative_to(self.docs_path)),
                    'content': content,
                    'section_title': self._extract_title(content) or file_path.stem,
                    'position': 0  # Will be set during chunking
                }

                documents.append(doc)
                print(f"Read file: {doc['file_path']}")

            except Exception as e:
                print(f"Error reading file {file_path}: {e}")
                self.failed_count += 1

        return documents

    def _extract_title(self, content: str) -> str:
        """Extract the first heading from markdown content as title"""
        lines = content.split('\n')
        for line in lines[:10]:  # Look at first 10 lines
            if line.strip().startswith('# '):
                return line.strip()[2:]  # Remove '# ' prefix
        return "Untitled"

    def process_documents(self, documents: List[Dict[str, str]]) -> List[Dict]:
        """Process documents into chunks with proper metadata"""
        all_chunks = []

        for doc_idx, doc in enumerate(documents):
            try:
                # Chunk the content
                chunks = chunk_text(
                    doc['content'],
                    min_size=config.CHUNK_MIN_SIZE,
                    max_size=config.CHUNK_MAX_SIZE,
                    overlap=config.CHUNK_OVERLAP
                )

                print(f"Document {doc['file_path']} split into {len(chunks)} chunks")

                # Create chunk objects with metadata
                for chunk_idx, chunk_content in enumerate(chunks):
                    chunk_obj = {
                        'id': str(uuid4()),  # Generate a proper UUID
                        'content': chunk_content,
                        'file_path': doc['file_path'],
                        'section_title': doc['section_title'],
                        'position': chunk_idx,
                        'doc_index': doc_idx,
                        'token_count': count_tokens(chunk_content)
                    }

                    all_chunks.append(chunk_obj)

            except Exception as e:
                print(f"Error processing document {doc['file_path']}: {e}")
                self.failed_count += 1

        print(f"Total chunks created: {len(all_chunks)}")
        return all_chunks

    async def embed_and_store_chunks(self, chunks: List[Dict]) -> Tuple[int, List[str]]:
        """Embed chunks and store in Qdrant and Neon"""
        from .retrieval import retrieval_service

        embedding_ids = []
        processed_count = 0

        for i, chunk in enumerate(chunks):
            try:
                print(f"Processing chunk {i+1}/{len(chunks)}: {chunk['file_path']}")

                # Generate embedding for the chunk
                embedding = await retrieval_service.embed_text(chunk['content'])

                # Prepare payload for Qdrant
                payload = {
                    'content': chunk['content'],
                    'file_path': chunk['file_path'],
                    'section': chunk['section_title'],
                    'position': chunk['position'],
                    'doc_index': chunk['doc_index'],
                    'token_count': chunk['token_count']
                }

                # Upsert to Qdrant
                success = qdrant_manager.upsert_vectors([embedding], [payload])

                if success:
                    # Store metadata in Neon
                    self._store_metadata(chunk, embedding)
                    embedding_ids.append(f"chunk_{i}")
                    processed_count += 1
                    print(f"Successfully processed chunk {i+1}")
                else:
                    print(f"Failed to upsert chunk {i+1} to Qdrant")
                    self.failed_count += 1

            except Exception as e:
                print(f"Error embedding chunk {i+1}: {e}")
                self.failed_count += 1

        return processed_count, embedding_ids

    def _store_metadata(self, chunk: Dict, embedding: List[float]) -> bool:
        """Store chunk metadata in Neon Postgres"""
        try:
            with db.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute(
                        """
                        INSERT INTO metadata (chunk_id, file_path, section, page_number, book_module, tags)
                        VALUES (%s, %s, %s, %s, %s, %s)
                        """,
                        (
                            chunk['id'],  # Using the chunk ID we generated
                            chunk['file_path'],
                            chunk['section_title'],
                            None,  # page_number - not available in markdown files
                            chunk['file_path'].split('/')[0] if '/' in chunk['file_path'] else 'root',  # book_module
                            ['book-content']  # tags
                        )
                    )
            return True
        except Exception as e:
            print(f"Error storing metadata for chunk {chunk['id']}: {e}")
            return False

    async def embed_book_content(self, docs_path: str = None) -> Dict[str, any]:
        """Main method to embed all book content"""
        print("Starting book content embedding process...")

        # Read markdown files
        documents = self.read_md_files(docs_path)
        if not documents:
            print("No documents found to embed")
            return {
                'status': 'error',
                'message': 'No documents found',
                'chunks_processed': 0,
                'embedding_ids': []
            }

        # Process documents into chunks
        chunks = self.process_documents(documents)
        if not chunks:
            print("No chunks created from documents")
            return {
                'status': 'error',
                'message': 'No chunks created from documents',
                'chunks_processed': 0,
                'embedding_ids': []
            }

        # Embed and store chunks
        processed_count, embedding_ids = await self.embed_and_store_chunks(chunks)

        result = {
            'status': 'success' if processed_count > 0 else 'partial',
            'message': f'Processed {processed_count} out of {len(chunks)} chunks',
            'chunks_processed': processed_count,
            'embedding_ids': embedding_ids,
            'total_chunks': len(chunks),
            'failed_count': self.failed_count
        }

        print(f"Embedding process completed: {result['message']}")
        return result


# Function to execute full embedding process
async def embed_book_content(docs_path: str = None):
    """Convenience function to embed book content"""
    embedder = BookEmbedder()
    return await embedder.embed_book_content(docs_path)


# Example usage
if __name__ == "__main__":
    import asyncio

    async def main():
        # Embed the book content from the docs directory
        result = await embed_book_content()
        print("Embedding result:", result)

    # Run the embedding process
    asyncio.run(main())