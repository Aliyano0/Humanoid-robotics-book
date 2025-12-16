---
id: 2
title: "Integrated RAG Chatbot Planning"
stage: "plan"
date: "2025-12-13"
surface: "agent"
model: "Claude Sonnet 4.5"
feature: "002-rag-chatbot-humanoid-book"
branch: "002-rag-chatbot-humanoid-book"
user: "user"
command: "/sp.plan"
labels: ["planning", "architecture", "rag", "chatbot"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - "/mnt/c/Study/claude-code/Book-hackathon/the-humanoid-blueprint/specs/002-rag-chatbot-humanoid-book/plan.md"
  - "/mnt/c/Study/claude-code/Book-hackathon/the-humanoid-blueprint/specs/002-rag-chatbot-humanoid-book/research.md"
  - "/mnt/c/Study/claude-code/Book-hackathon/the-humanoid-blueprint/specs/002-rag-chatbot-humanoid-book/data-model.md"
  - "/mnt/c/Study/claude-code/Book-hackathon/the-humanoid-blueprint/specs/002-rag-chatbot-humanoid-book/quickstart.md"
  - "/mnt/c/Study/claude-code/Book-hackathon/the-humanoid-blueprint/specs/002-rag-chatbot-humanoid-book/contracts/chat-api.yaml"
tests: []
---

# Prompt
```
Integrated RAG Chatbot for Humanoid Robotics Docusaurus Book

Project Goal Recap (from /sp.specify):
Develop a RAG chatbot embedded in the Docusaurus site for book queries, using Python backend (FastAPI 0.124.2), OpenAI SDK 2.11.0 via OpenRouter API (base_url=OPENROUTER_URL, api_key=OPENROUTER_API_KEY) for embeddings/agents, Qdrant-client 1.16.1, psycopg 3.3.0 for Neon. Ingest .md files to Qdrant with text-embedding-3-large, ChatKit UI, OpenAI agent with gpt-5-mini (cost-efficient latest model for agents), FastAPI API, retrieval func, Docker for HF Spaces/Railway. Handle selected text, multi-turn via Neon, anonymous sessions. Align with additional details (OpenRouter envs), user stories (P1 core query/selected/access, P2 multi-turn), edge cases (no content/long queries/concurrent/unavailable DB/new content), FRs (widget/process/retrieve/store/deploy), entities (Query/Response/Session/Chunk/Metadata), SCs (100% pages/85% accuracy/90% selected/5 exchanges/50 queries/<500 tokens/100% embedded/80% satisfaction).

Create the following deliverables:

1. Architecture Sketch
- Mermaid diagram: Docusaurus (ChatKit widget w/selection handler) → FastAPI /chat (Docker) → Retrieval (embed query via OpenRouter → Qdrant search top-5>0.7 → Neon metadata) → OpenAI Agent (via OpenRouter, gpt-5-mini w/context) → Response to UI. Neon for sessions/metadata. Rate limit (e.g., 10/min) via FastAPI middleware.
- Stack: Python 3.12, deps in requirements.txt (fastapi==0.124.2, uvicorn, openai==2.11.0, qdrant-client==1.16.1, psycopg[binary]==3.3.0, langchain-text-splitters==1.0.0 for chunking, python-dotenv).
- Structure:
  ├── src/
  │   ├── main.py          # FastAPI app, endpoints, rate limit
  │   ├── retrieval.py     # Query embed/search/combine (via OpenRouter)
  │   ├── agent.py         # OpenAI Assistant setup/prompt (via OpenRouter)
  │   ├── db.py            # Neon connect, schema ops
  │   └── embed_book.py    # Ingest .md, chunk, embed/upsert (via OpenRouter)
  ├── Dockerfile           # FROM python:3.12-slim, deps, CMD uvicorn
  ├── requirements.txt
  ├── .env.example
  └── tests/               # Pytest for components

- Docusaurus: Add ChatKit to config/plugins, script in index.html w/backend URL.

2. Final Section Structure (phased code blueprint, per FR/user stories)
- Phased modules (build sequentially):
  Phase 1: Embedding + DB (embed_book.py with OpenRouter embeds, db.py: schema for chunks/sessions per FR-006/011).
  Phase 2: UI (Docusaurus config for ChatKit widget, selection via getSelection(), per FR-001/003, User Story 1/2/4).
  Phase 3: Agent (agent.py: OpenAI Assistant via OpenRouter w/tools/retrieval, prompt for book-only, handle no-content/edges per clarifications, FR-002/004/007).
  Phase 4: Backend (main.py: /chat POST {query, selected_text, session_id}, rate limit, error handling per FR-008/010/012, edges concurrent/long).
  Phase 5: Retrieval (retrieval.py: embed query via OpenRouter, Qdrant query, prioritize selected, fetch Neon, per FR-005, edges unavailable/new content).
  Phase 6: Integration (Docker, deploy HF/Railway, e2e tests per SCs).

3. Research Approach
- Concurrent: Research during /sp.write per phase (e.g., OpenRouter integration for embeds/agents in Phase 1/3). Max 1hr/phase.
- Check if there is a skill for it then utilize that first and if no skill matches then go to the official docs.
- Sources: Official docs (openrouter.ai/docs, openai.com/docs/assistants, fastapi.tiangolo.com, qdrant.tech/docs, neon.tech/docs, chatkit.com/docs).
- Verify 2025 versions: Targeted browses (e.g., latest OpenRouter usage).
- Citations: APA inline in code comments for quoted docs (e.g., OpenAI. (2025). Assistants API. https://platform.openai.com/docs/assistants).

4. Quality Validation Checklist (post-phase)
- Code executes: Local docker run, no errors, env prompt if missing (including OPENROUTER_API_KEY/URL).
- Token/response: <500 avg, <10s time (measure).
- Spec match: Chunk 200-250/40 overlap, anonymous sessions, graceful errors.
- Edges: Test no-content ("not covered"), long query (chunk), concurrent (rate limit), unavailable (fallback msg), new content ("may not be indexed").
- Free-tier: Qdrant<1GB, Neon<0.5GB (size check).
- Usability: 80% satisfaction via mock tests.

5. Decisions Needing Documentation (10 choices, tradeoffs per options)
- Model: gpt-5-mini vs gpt-5.2 → gpt-5-mini: More cost-efficient latest mini model for agents (SCs token/deploy); tradeoff: Potentially less capable than full version, but sufficient and cheaper for RAG/book queries.
- Embedding: text-embedding-3-large vs newer → 3-large: Spec-compliant/accurate; tradeoff: Potentially outdated, but stable/free-tier via OpenRouter.
- Chunk: 200-250/40 vs 512/100 → Spec: Balances detail/noise; tradeoff: Smaller misses context, but reduces hallucinations.
- Search: top-5/0.7 vs 10/0.5 → Tight: Precision (85% accuracy SC); tradeoff: May miss, but per edges/clarifications.
- DB: Neon vs Supabase → Neon: Serverless Postgres spec; tradeoff: Latency, but free/persistent.
- Deploy: HF Spaces vs Railway → HF: ML-easy/free Docker; tradeoff: Less API control, but simple for RAG.
- Rate limit: 10/min vs none → 10: Handles concurrent (edge); tradeoff: May queue, but prevents crashes (SC-005).
- Sessions: Neon table vs Redis → Neon: Persistent/free; tradeoff: Slower, but spec/no extra deps.
- UI: ChatKit vs custom → ChatKit: Widget embed/simple; tradeoff: Less custom, but per FR-001/Docusaurus.
- Errors: Graceful msg vs raise → Msg: User-friendly (FR-008/clarifications); tradeoff: Hides details, but per beginner audience.

6. Testing Strategy (vs acceptance/SC)
| Criterion/SC | Method | Threshold |
|--------------|--------|-----------|
| Widget functional (SC-001/FR-001) | Deploy, click from pages (User Story 4) | 100% pages, <10s |
| Accurate answers (SC-002/FR-002) | 20 queries, check relevance/cites (User Story 1) | 85% |
| Selected text (SC-003/FR-003) | Highlight/ask, verify focus (User Story 2) | 90% |
| Multi-turn (SC-004/FR-004) | 5+ exchanges, context check (User Story 3) | Coherent |
| Stability (SC-005) | Load test 50 queries | No crashes |
| Token eff (SC-006) | Log averages | <500 |
| Embedded (SC-007) | Count chunks post-ingest | 100% .md |
| Satisfaction (SC-008) | 10 user mocks | 80% |

Technical details:
- Use research-concurrent approach (research while writing, not all upfront)
- Follow APA citation style from Constitution
- Organize by phases: Research → Foundation → Analysis → Synthesis

Phased Execution Plan (with confirms)
Phase 1 – Research/Foundation (research OpenRouter integration, build embed_book.py + db.py schema). Confirm: "Phase 1 complete - proceed?"
Phase 2 – Foundation/Analysis (UI integration + agent.py with OpenRouter). Confirm: "Phase 2 complete - proceed?"
Phase 3 – Analysis (main.py backend + retrieval.py with OpenRouter embeds). Confirm: "Phase 3 complete - proceed?"
Phase 4 – Synthesis (Docker, deploy, full tests/validation). Confirm: "All phases done."
```

# Response
Implementation plan completed successfully. Created the following artifacts:
1. Implementation plan in plan.md with technical context, constitution check, and project structure
2. Research summary in research.md documenting technology decisions and rationale
3. Data model in data-model.md defining all entities and their relationships
4. API contracts in contracts/chat-api.yaml specifying the interface
5. Quickstart guide in quickstart.md for easy setup and deployment
6. Updated agent context with new technologies for this feature

The plan follows the spec requirements including:
- Python 3.12+ with FastAPI, OpenAI SDK, Qdrant-client, and psycopg
- OpenRouter API for embeddings and agent operations
- Qdrant Cloud for vector storage with 0.7 similarity threshold
- Neon Postgres for metadata and session storage
- ChatKit widget for Docusaurus integration
- 200-250 token chunks with 40-token overlap
- Rate limiting at 10 requests per minute
- Support for selected text processing
- Multi-turn conversation support with anonymous sessions
- Docker deployment for Hugging Face Spaces or Railway

All constitution gates have been verified and passed, ensuring the design meets the core principles of accuracy, clarity, reproducibility, spec-driven development, proper citations, and verification requirements.