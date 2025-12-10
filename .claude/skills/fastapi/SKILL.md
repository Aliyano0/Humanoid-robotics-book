name: fastapi
description: Reusable skill for building FastAPI backends for RAG chatbots. Covers endpoints for querying, uploading content, and integrating with Qdrant/Neon. Auto-loads on mentions of "FastAPI", "API endpoints", or "chatbot server".
when: User needs API setup for chatbot or integrations.
when_not: Frontend or DB-only tasks.
FastAPI for RAG Chatbot
Overview
FastAPI for high-performance APIs. Use to expose RAG endpoints for the book chatbot.

Prerequisites
- Install: pip install fastapi uvicorn

Step 1: Basic App Setup

Create main app.

``` python
from fastapi import FastAPI, Request

app = FastAPI()

@app.post("/chat")
async def chat(request: Request):
    data = await request.json()
    query = data['query']
    # Integrate RAG: embed, retrieve from Qdrant, generate with OpenAI
    return {"response": "Generated answer"}
```

Step 2: Handle User-Selected Text Dedicated endpoint.

``` python
Python@app.post("/selected-text-query")
async def selected_query(request: Request):
    data = await request.json()
    selected_text = data['text']
    # Use as query or context for RAG retrieval
    return {"response": "Answer based on selected text"}
```

Step 3: Integration with Other Tech

Qdrant/Neon: Call clients in endpoints.

Run: uvicorn main:app --reload

Notes:

Async for efficiency with DB calls.
Security: Add API keys or auth.
Testing: Use Postman for queries like book modules