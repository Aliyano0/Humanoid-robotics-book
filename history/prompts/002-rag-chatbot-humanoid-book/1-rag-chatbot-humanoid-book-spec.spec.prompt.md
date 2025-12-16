---
id: 1
title: rag-chatbot-humanoid-book-spec
stage: spec
date_iso: 2025-12-12
surface: agent
model: Claude Sonnet 4.5
feature: rag-chatbot-humanoid-book
branch: 001-rag-chatbot-humanoid-book
user: claude-code-user
command: /sp.specify
labels: ["specification", "rag-chatbot", "docusaurus", "humanoid-robotics"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml: |
  - specs/001-rag-chatbot-humanoid-book/spec.md
  - specs/001-rag-chatbot-humanoid-book/checklists/requirements.md
tests_yaml: |
  - spec validation checklist
prompt_text: |
  Integrated RAG Chatbot for Humanoid Robotics Docusaurus Book

  Target audience:
  Undergraduate/graduate students and robotics enthusiasts using the Physical AI & Humanoid Robotics textbook. Beginners to advanced users seeking quick answers on book content via an embedded chatbot.

  Focus:
  Develop and embed a RAG-based chatbot into the existing Docusaurus site. The chatbot uses OpenAI Agents SDK (Python v2.9.0+), ChatKit SDK/widgets for UI, FastAPI backend, Neon Serverless Postgres for metadata/session storage, and Qdrant Cloud Free Tier for vector embeddings. It answers queries about book content, including from user-selected text. Use Python for all backend logic. Process in phased steps for efficiency:

  1. Embed book: Ingest all .md files from Docusaurus /docs folder into Qdrant. Chunk size 200–250 tokens, overlap 40. Use OpenAI "text-embedding-3-large" model. Store metadata (file path, section) in Neon Postgres. Env vars: OPENAI_API_KEY, QDRANT_API_KEY, QDRANT_CLUSTER_ENDPOINT, NEON_POSTGRES_URL (add if needed).

  2. Chatbot UI: Add simple ChatKit widget to Docusaurus – floating icon bottom-right, opens chat modal. Passes user prompts (and selected text if highlighted) to FastAPI endpoint.

  3. AI Agent: Build OpenAI Agents SDK agent that processes user query, retrieves relevant chunks via Qdrant similarity search, and generates response using GPT-4o-mini (or latest efficient model).

  4. FastAPI Backend: REST API to handle UI requests. Endpoint /chat: receives query/selected_text, calls retrieval function, invokes agent, returns response to UI.

  5. Retrieval Function: Python func that embeds query with "text-embedding-3-large", queries Qdrant (top-k=5, score_threshold=0.7), fetches metadata from Neon, combines context for agent.

  6. Integration & Extras: Handle user-selected text as priority context in retrieval. Create the backend as a Docker image deployable on Hugging Face Spaces or Railway (using Dockerfile for FastAPI setup). Ensure session persistence via Neon for multi-turn chats. Integrate into Docusaurus build.

  Success criteria (testable by deploying and querying):
  - Chatbot icon appears on site; opens UI; handles 10+ test queries accurately (e.g., "Explain ROS 2 nodes" retrieves from Module 1).
  - Processes selected text: Highlight book para, ask "Summarize this" – uses only that context.
  - Embeddings complete: All .md files chunked/embedded; query retrieves relevant chunks >85% accuracy.
  - Multi-turn: Remembers prior messages via Neon sessions.
  - Deployment: Runs on free tiers; no crashes on 50 queries/day.
  - Token-efficient: Responses <500 tokens avg; uses Claude-Code for impl if needed.

  Constraints:
  - Backend: Python 3.12+, FastAPI 0.115+, OpenAI SDK 2.9.0+, Qdrant-client 1.12+.
  - No scraping: Use local .md files directly.
  - Free tiers only: Qdrant Cloud Free (1GB), Neon Free (0.5GB).
  - Docusaurus integration: Add ChatKit script to index.html; no site rebuild needed beyond config.
  - Security: Env var creds only; no hardcoding.

  Not building:
  - Advanced auth/user accounts.
  - Real-time updates (embed once at build).
  - Non-book queries (limit to book content).
  - Custom ML training (use OpenAI embeddings/API).
  - Windows/macOS-specific instructions (Ubuntu/dev container assumed).

  Dependencies & Assumptions:
  - Existing Docusaurus repo with /docs .md files.
  - Env vars pre-set; Neon DB schema: simple tables for metadata (id, chunk_text, embedding_id, file_path) and sessions (user_id, chat_history).
  - Writer has access to OpenAI/Qdrant/Neon accounts.
  - All code tested locally before deploy.
  - You should ask for env names for any credentials before using them.
  - You can use the skills and sub-agent
response_text: |
  Created comprehensive feature specification for the Integrated RAG Chatbot for Humanoid Robotics Docusaurus Book. The specification includes:
  - User scenarios for querying book content, using selected text, multi-turn conversations, and accessing the chatbot from any page
  - 12 functional requirements covering core chatbot functionality, content retrieval, session management, and deployment
  - 8 measurable success criteria with specific metrics for functionality, accuracy, performance, and user satisfaction
  - Key entities including Query, Response, Conversation Session, Book Content Chunk, and Metadata
  - Edge cases for error handling and boundary conditions
  - A validation checklist confirming the specification meets quality standards
outcome: |
  Specification successfully created and validated, ready for planning phase (/sp.plan)
evaluation: |
  The specification is complete, testable, and technology-agnostic as required by the guidelines
---
