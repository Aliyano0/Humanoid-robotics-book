name: rag-implementation
description: Reusable skill for implementing Retrieval-Augmented Generation (RAG) pipelines using OpenAI's text-embedding-3-large model (3072 dimensions) for embeddings and Qdrant vector database. Covers content loading from Docusaurus book (Markdown/HTML), chunking, embedding, storage in Qdrant Cloud Free Tier, and retrieval for chatbot queries, including user-selected text. Integrates with Python SDKs for OpenAI and Qdrant. Auto-loads on mentions of "RAG setup", "embed book content", or "vector query Physical AI".
when: User mentions RAG, embeddings, vector search, or querying book content like Physical AI modules (Foundations, Perception, Actuation, Integration).
when_not: General coding without vector DB or embeddings.
---
# RAG Implementation with OpenAI Embeddings and Qdrant

## Overview
This skill equips agents with step-by-step guidance and code for building a RAG system. Use OpenAI's `text-embedding-3-large` for high-dimensional embeddings (up to 3072 dims) to capture nuanced semantics from the textbook. Qdrant handles vector storage and similarity search (cosine distance). Process the Docusaurus book content (local MD files or scraped HTML) to embed all modules.

## Prerequisites
- OpenAI API key for embeddings.
- Qdrant Cloud Free Tier cluster URL and API key.
- Python libraries: `openai`, `qdrant-client`, `requests`, `beautifulsoup4`.

### Step 1: Setup Clients
Initialize OpenAI and Qdrant clients.
```python
from openai import OpenAI
from qdrant_client import QdrantClient

openai_client = OpenAI(api_key="your-openai-api-key")
qdrant_client = QdrantClient(url="https://your-qdrant-cluster-url.qdrant.io:6333", api_key="your-qdrant-api-key")
```

### Step 2: Load Book Content
Load from local Docusaurus repo or scrape GitHub Pages.

``` Python
import os
import requests
from bs4 import BeautifulSoup

def load_local_md(directory='docs'):  # Adjust to your Docusaurus docs path
    docs = []
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.md'):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                docs.append({'content': content, 'source': path})
    return docs

def scrape_docusaurus(url='https://your-github-pages-url/docs'):
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    # Extract main content; adjust selectors for Docusaurus structure
    main = soup.find('main')
    content = main.get_text(separator='\n', strip=True) if main else ''
    return [{'content': content, 'source': url}]

# Combine or process all pages/modules (e.g., Foundations, Perception)
```

### Step 3: Chunk Content
Split into manageable chunks (e.g., 200 - 250 chars) with overlap.

``` Python
    
def chunk_text(text, chunk_size=250, overlap=40):
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunks.append(text[start:end])
        start += chunk_size - overlap
    return chunks

# Apply to loaded docs
chunks = []
for doc in docs:
    doc_chunks = chunk_text(doc['content'])
    for ch in doc_chunks:
        chunks.append({'page_content': ch, 'metadata': {'source': doc['source'], 'module': 'Extract module name here'}})
```

### Step 4: Generate Embeddings
Use text-embedding-3-large for vectors.

``` Python
def get_embedding(text):
    response = openai_client.embeddings.create(input=text, model="text-embedding-3-large")
    return response.data[0].embedding

vectors = []
for chunk in chunks:
    try:
        vectors.append(get_embedding(chunk['page_content']))
    except Exception as e:
        print(f"Embedding error: {e}")
 
# Batch process to handle rate limits: split into batches of 10-20
```

### Step 5: Store in Qdrant
Create collection and upsert points.

```Python
from qdrant_client.http.models import Distance, VectorParams, PointStruct

collection_name = "physical-ai-book"
if not qdrant_client.has_collection(collection_name):
    qdrant_client.create_collection(
        collection_name=collection_name,
        vectors_config=VectorParams(size=3072, distance=Distance.COSINE)  # Match embedding dim
    )

points = [
    PointStruct(id=str(i), vector=vec, payload={"text": chunk['page_content'], "source": chunk['metadata']['source'], "module": chunk['metadata']['module']})
    for i, (vec, chunk) in enumerate(zip(vectors, chunks))
]
qdrant_client.upsert(collection_name=collection_name, points=points)  # Batch upsert if large
```

### Step 6: Retrieval for Queries
Embed query and search; handle user-selected text as primary input.

``` Python
def retrieve(query_text, top_k=5):
    query_vec = get_embedding(query_text)
    results = qdrant_client.search(
        collection_name=collection_name,
        query_vector=query_vec,
        limit=top_k
    )
    return [hit.payload['text'] for hit in results]
# For user-selected text: Use as query_text directly, or combine with full query.
# Augment generation: Pass retrieved texts to OpenAI completion for response.
```

Integration Notes

For chatbot: Combine with FastAPI endpoints and OpenAI Agents for query handling.
Error Handling: Retry on API errors, chunk large payloads.
Testing: Query examples like "Explain perception in humanoid robotics" or selected text from a module.
Optimization: Use filters on payload (e.g., module) for targeted search.