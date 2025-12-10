name: chatkit-sdk
description: Reusable skill for using OpenAI ChatKit SDK to build custom chat servers and widgets. Supports advanced integrations for RAG chatbot frontend/backend. Auto-loads on mentions of "ChatKit", "chat interface", or "custom chatbot UI".
when: User needs chat UI, widgets, or custom backend for chatbot.
when_not: Pure backend or DB tasks.
ChatKit SDK Integration
Overview
ChatKit SDK allows building custom chat experiences with Python backend and widgets for frontend. Use for embedding RAG chatbot in Docusaurus book.

Prerequisites

- Install: pip install chatkit
- OpenAI API key for backend.

Step 1: Setup Backend
Create a custom ChatKit server.

``` python
from chatkit import ChatKitServer

server = ChatKitServer(
    agent_backend="your-rag-agent",  # Link to OpenAI Agent or custom RAG logic
    api_key="your-openai-api-key"
)

@server.route("/chat")
def handle_chat(message):
    # Process with RAG: retrieve from Qdrant, generate response
    return "Response based on book content"
```

Step 2: Frontend Widgets

Add to Docusaurus (React-based).
``` js
// In Docusaurus component

import { ChatWidget } from 'chatkit-js';

<ChatWidget serverUrl="your-chatkit-server-url" />;
```

Step 3: Advanced Features

Respond to events, integrate widgets.

``` python
Pythonserver.respond_to("user_query", lambda msg: rag_process(msg))
```

Integration Notes

Embed in book: Add widget to pages for interactive queries.
Handle selected text: Pass as initial message.
Security: Use auth for API.
Testing: Simulate chats with book queries.