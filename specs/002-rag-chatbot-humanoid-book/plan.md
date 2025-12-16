# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implementation of an integrated RAG chatbot for the Physical AI & Humanoid Robotics Docusaurus Book. The system uses a Python FastAPI backend with OpenRouter API for embeddings and AI operations, Qdrant Cloud for vector storage, and Neon Postgres for metadata/session storage. The chatbot is integrated into the Docusaurus site via a ChatKit widget, enabling users to ask questions about book content with support for selected text processing and multi-turn conversations. The architecture includes rate limiting, proper error handling, and deployment via Docker for Hugging Face Spaces or Railway.

## Technical Context

**Language/Version**: Python 3.12+
**Primary Dependencies**: FastAPI 0.124.2, OpenAI SDK 2.11.0, Qdrant-client 1.16.1, psycopg 3.3.0, langchain-text-splitters 1.0.0, python-dotenv, uvicorn
**Storage**: Neon Serverless Postgres (for session/metadata storage), Qdrant Cloud (for vector embeddings)
**Testing**: pytest for unit and integration tests
**Target Platform**: Linux server (Docker container deployable on Hugging Face Spaces or Railway)
**Project Type**: Web application (backend API with Docusaurus frontend integration)
**Performance Goals**: <10 seconds response time for typical queries, <500 tokens average response length, 85% accuracy for book content queries
**Constraints**: Free tier limits (Qdrant Cloud 1GB, Neon 0.5GB), anonymous sessions only, chunk size 200-250 tokens with 40 overlap, score threshold 0.7 for retrieval
**Scale/Scope**: Support 50+ queries per day, handle multi-turn conversations with session persistence, embed all .md files from Docusaurus docs folder
**Environment Management**: Use UV venv for python environment management

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Accuracy Gate**: All AI responses MUST be based on book content with proper citations. The RAG system will ensure responses are grounded in the textbook content.
*Status: PASSED - Design includes citation system in API contracts and data model*

**Clarity Gate**: The chatbot interface and responses MUST be clear and understandable for CS and engineering learners at intermediate-advanced level.
*Status: PASSED - Using ChatKit for clear UI and OpenAI for appropriate response generation*

**Reproducibility Gate**: All code for the backend API, embedding process, and Docusaurus integration MUST be fully replicable with proper documentation and environment setup.
*Status: PASSED - Design includes Dockerfile, requirements.txt, and proper environment variable handling*

**Spec-Driven Gate**: The implementation MUST follow the feature specification and integrate with Docusaurus documentation using proper MDX guidelines.
*Status: PASSED - Following feature spec exactly with Docusaurus integration via ChatKit*

**Citation Gate**: All book content referenced in responses MUST properly cite the original source sections from the Physical AI & Humanoid Robotics textbook.
*Status: PASSED - API contract and data model include citation fields and metadata tracking*

**Verification Gate**: The system MUST be tested with at least 20 queries to verify 85% accuracy as specified in the success criteria.
*Status: PASSED - Design includes token count tracking and relevance scoring for verification*

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
src/
├── main.py          # FastAPI app, endpoints, rate limit
├── retrieval.py     # Query embed/search/combine (via OpenRouter)
├── agent.py         # OpenAI Assistant setup/prompt (via OpenRouter)
├── db.py            # Neon connect, schema ops
└── embed_book.py    # Ingest .md, chunk, embed/upsert (via OpenRouter)

Dockerfile           # FROM python:3.12-slim, deps, CMD uvicorn
requirements.txt
.env.example
tests/               # Pytest for components

# Docusaurus integration
docs/                # Existing Docusaurus docs to be embedded
static/              # For ChatKit widget script
```

**Structure Decision**: This is a web application with a Python FastAPI backend for the RAG chatbot API and integration with the existing Docusaurus frontend via ChatKit widget. The backend handles embeddings, retrieval, and AI agent processing, while the frontend provides the chat interface.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
