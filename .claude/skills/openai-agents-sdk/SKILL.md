name: openai-agents-sdk
description: Reusable skill for integrating OpenAI Agents SDK to create LLMs with tools, instructions, and handoff capabilities. Useful for agentic RAG flows in the chatbot, such as delegating retrieval or generation tasks. Auto-loads on mentions of "OpenAI agents", "assistant setup", or "agentic workflow".
when: User discusses agents, assistants, or tool-equipped LLMs.
when_not: Simple embeddings or DB operations without agency.
OpenAI Agents SDK Integration
Overview
OpenAI Agents SDK enables building agents (LLMs with tools/instructions) and handoffs for task delegation. Use for RAG chatbot to handle complex queries, e.g., retrieve from Qdrant then generate response.

Prerequisites

- Install: pip install openai-agents
- OpenAI API key.

Step 1: Create an Agent
Define an agent with instructions and tools.

```Python
from openai_agents import Agent, Tool

def custom_retrieval_tool(query):  # Example tool for Qdrant retrieval
    # Implement retrieval logic here
    return "Retrieved context"

agent = Agent(
    model="gpt-4o",
    instructions="You are a RAG assistant for Physical AI book. Use tools to retrieve content.",
    tools=[Tool(name="retrieve", func=custom_retrieval_tool, description="Retrieve book content for query")]
)
```

Step 2: Run Agent
Process messages or queries.

```Python
response = agent.run("Explain actuation in humanoid robotics")
print(response)
```

Step 3: Handoffs
Delegate to specialized agents.

```Python
specialist_agent = Agent(...)  # Another agent for specific module
handoff = agent.handoff_to(specialist_agent, "Handle this perception query")
```

Integration Notes

For chatbot: Use in FastAPI to process user queries agentically.
Tools: Integrate Qdrant search or Neon DB queries as tools.
Error Handling: Manage tool failures with retries.
Testing: Simulate queries with book content.