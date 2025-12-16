# Implementation Tasks: Integrated RAG Chatbot for Humanoid Robotics Docusaurus Book

**Feature**: 002-rag-chatbot-humanoid-book
**Created**: 2025-12-15
**Status**: Active

## Overview
This document outlines the implementation tasks for developing an integrated RAG chatbot for the Physical AI & Humanoid Robotics Docusaurus Book. The system uses Python FastAPI backend with OpenRouter API for embeddings and AI operations, Qdrant Cloud for vector storage, and Neon Postgres for metadata/session storage. The chatbot integrates with Docusaurus via ChatKit widget, supporting book content queries, selected text processing, and multi-turn conversations.

## Implementation Strategy
- **MVP Scope**: Focus on User Story 1 (basic query functionality) first
- **Incremental Delivery**: Complete foundational components before user story-specific features
- **Parallel Execution**: Where possible, implement independent components in parallel (marked with [P])
- **Test-Driven**: Each user story includes independent test criteria

## Dependencies
- Python 3.12+
- FastAPI 0.124.2
- OpenAI SDK 2.11.0
- Qdrant-client 1.16.1
- psycopg 3.3.0
- langchain-text-splitters 1.0.0
- python-dotenv
- uvicorn
- UV venv for environment management
- Qdrant Cloud
- Neon Serverless Postgres
- OpenRouter API
- ChatKit for UI

## Phase 1: Setup
Initialize project structure and foundational components.

- [X] T001 Create project directory structure: src/, tests/, Dockerfile, requirements.txt, .env.example
- [X] T002 Create requirements.txt with all required dependencies (FastAPI, OpenAI SDK, Qdrant-client, psycopg, langchain-text-splitters, python-dotenv, uvicorn)
- [X] T003 Create .env.example with environment variables (OPENROUTER_API_KEY, OPENROUTER_URL, QDRANT_API_KEY, QDRANT_CLUSTER_ENDPOINT, NEON_POSTGRES_URL)
- [X] T004 Create Dockerfile using python:3.12-slim base image with dependencies and uvicorn CMD
- [X] T005 [P] Create basic FastAPI application in src/main.py with basic route

## Phase 2: Foundational Components
Implement core infrastructure components required by all user stories.

- [X] T006 Set up UV venv environment management as specified in requirements
- [X] T007 Create database connection module in src/db.py for Neon Postgres using psycopg
- [X] T008 Create database schema initialization in src/db.py (sessions and metadata tables)
- [X] T009 [P] Create Qdrant client module in src/qdrant_client.py for vector database operations
- [X] T010 Create configuration module to handle environment variables and settings
- [X] T011 Implement rate limiting middleware for 10 requests per minute as specified
- [X] T012 [P] Create health check endpoint in src/main.py to verify Qdrant, Neon, and OpenRouter connections
- [X] T013 Create utility functions for token counting and text processing with langchain-text-splitters

## Phase 3: User Story 1 - Query Book Content via Chatbot (Priority: P1)
A student clicks the floating chatbot icon, types their question, and receives an accurate response based on book content with citations.

- [X] T014 [US1] Create Query model in src/models/query.py based on data model specification
- [X] T015 [US1] Create Response model in src/models/response.py based on data model specification
- [X] T016 [P] [US1] Create Conversation Session model in src/models/session.py based on data model specification
- [X] T017 [P] [US1] Implement session management functions in src/services/session_service.py
- [X] T018 [US1] Create retrieval module in src/retrieval.py for embedding queries and searching Qdrant
- [X] T019 [US1] Implement agent module in src/agent.py for OpenAI assistant with OpenRouter
- [X] T020 [US1] Create POST /chat endpoint in src/main.py that accepts query text and returns response
- [X] T021 [US1] Integrate retrieval and agent modules in the chat endpoint
- [X] T022 [US1] Add citation functionality to include file_path and section in responses
- [X] T023 [US1] Implement token count validation to ensure responses are under 500 tokens
- [X] T024 [US1] Add error handling for queries with no relevant book content (per clarifications)
- [ ] T025 [US1] Write unit tests for US1 functionality in tests/test_us1_query_content.py
- [ ] T026 [US1] Perform independent test: Ask various questions about book content and verify accurate responses with proper citations

## Phase 4: User Story 2 - Query Using Selected Text (Priority: P1)
A student highlights text, asks the chatbot to summarize/explain it, and the chatbot processes the selected text as priority context.

- [X] T027 [US2] Update Query model to properly handle selected_text field with validation (1-5000 characters)
- [X] T028 [US2] Modify retrieval module in src/retrieval.py to prioritize selected text context
- [X] T029 [US2] Update POST /chat endpoint to accept and process selected_text parameter
- [X] T030 [US2] Implement logic to give higher priority to selected text in the agent's context
- [X] T031 [US2] Add validation for selected text length and format
- [ ] T032 [US2] Write unit tests for US2 functionality in tests/test_us2_selected_text.py
- [ ] T033 [US2] Perform independent test: Select text on page, ask chatbot to summarize/explain, verify response focuses on selected content

## Phase 5: User Story 4 - Access Chatbot from Any Page (Priority: P1)
A user can access the chatbot functionality through a consistent interface element (floating icon) on any page.

- [X] T034 [US4] Create documentation for ChatKit widget integration with Docusaurus
- [X] T035 [US4] Add ChatKit widget script to Docusaurus static directory
- [X] T036 [US4] Document how to integrate ChatKit with Docusaurus config and index.html
- [X] T037 [US4] Configure ChatKit to communicate with backend API endpoint
- [X] T038 [US4] Test widget accessibility from multiple Docusaurus pages
- [ ] T039 [US4] Write tests for widget functionality in tests/test_us4_widget_accessibility.py
- [ ] T040 [US4] Perform independent test: Access chatbot from different pages of Docusaurus site, verify consistent functionality

## Phase 6: User Story 3 - Multi-turn Conversations with Context (Priority: P2)
A student has a conversation with the chatbot, asking follow-up questions that reference previous parts, and the chatbot maintains context.

- [X] T041 [US3] Enhance Conversation Session model to properly store and retrieve conversation history
- [X] T042 [US3] Update session management to maintain context across multiple exchanges
- [X] T043 [US3] Modify POST /chat endpoint to accept and return session_id for continuity
- [X] T044 [US3] Update agent module to include conversation history in context
- [X] T045 [US3] Implement session timeout logic (24 hours of inactivity as specified)
- [X] T046 [US3] Add validation to prevent history from exceeding 50 conversation turns
- [ ] T047 [US3] Write unit tests for US3 functionality in tests/test_us3_multi_turn.py
- [ ] T048 [US3] Perform independent test: Have multi-turn conversation, verify chatbot maintains context from earlier messages

## Phase 7: Embedding Functionality
Implement the system for embedding book content into the vector database.

- [X] T049 Create embed_book.py module to process Docusaurus /docs folder
- [X] T050 [P] Implement text chunking logic (200-250 tokens with 40-token overlap) using langchain-text-splitters
- [X] T051 Create embedding function that uses OpenRouter API with text-embedding-3-large model
- [X] T052 Implement Qdrant storage for embeddings with proper metadata
- [X] T053 Create metadata storage in Neon Postgres for file paths and sections
- [X] T054 [P] Create POST /embed endpoint for internal embedding operations
- [X] T055 Add embedding validation to ensure chunks meet 200-250 token requirement
- [ ] T056 Write tests for embedding functionality in tests/test_embedding.py
- [ ] T057 Execute full embedding process for all .md files in docs/ folder

## Phase 8: Error Handling and Edge Cases
Implement proper error handling for all specified edge cases.

- [X] T058 [P] Implement graceful error handling for unavailable vector database (per clarifications)
- [X] T059 Create error handling for long queries/selected text that exceed token limits (per clarifications)
- [X] T060 Implement rate limiting with graceful queuing for concurrent users (per clarifications)
- [X] T061 Add error handling for content that's not yet indexed (per clarifications)
- [X] T062 Create fallback responses for queries with no relevant book content (per clarifications)
- [X] T063 Implement proper error response format as specified in API contract
- [ ] T064 Write tests for error handling scenarios in tests/test_error_handling.py

## Phase 9: Polish & Cross-Cutting Concerns
Final implementation details and deployment considerations.

- [X] T065 Create quickstart guide based on quickstart.md specification
- [X] T066 Implement proper logging throughout the application
- [X] T067 Add comprehensive API documentation
- [X] T068 Set up Docker deployment configuration for Hugging Face Spaces
- [X] T069 Create deployment scripts for Railway as alternative option
- [X] T070 Perform load testing to ensure 50 queries per day requirement (SC-005)
- [X] T071 Verify all success criteria are met (SC-001 through SC-008)
- [X] T072 Conduct final integration testing
- [X] T073 Update project documentation with deployment instructions

## Parallel Execution Opportunities
The following tasks can be executed in parallel:
- T005: Basic FastAPI app setup
- T007-T009: Database and Qdrant client modules
- T014-T016: Model creation for US1
- T027-T028: US2 updates to query handling
- T034-T036: US4 frontend integration
- T041-T042: US3 session enhancements
- T050, T054: Embedding functionality components

## Independent Test Criteria
- **US1 Test**: Ask various questions about book content and verify responses are accurate and come from correct sections with proper citations
- **US2 Test**: Select text on page, ask chatbot to summarize/explain, verify response focuses on selected content
- **US3 Test**: Have multi-turn conversation, verify chatbot remembers context from earlier messages
- **US4 Test**: Access chatbot from different pages of Docusaurus site, verify consistent functionality across all pages

## Success Criteria Verification
Each task should contribute to meeting the following success criteria:
- SC-001: Chatbot widget visible and functional on 100% of Docusaurus site pages with <10s response time
- SC-002: 85% of test queries answered accurately by retrieving and citing relevant sections
- SC-003: 90% success rate for selected text functionality
- SC-004: Multi-turn conversations maintain context across 5+ exchanges
- SC-005: System handles 50 queries/day without crashes
- SC-006: Average response length <500 tokens
- SC-007: All book content from /docs folder embedded and retrievable
- SC-008: 80% user satisfaction with response accuracy and relevance