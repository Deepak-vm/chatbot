// Centralized constants for the LangGraph Chat frontend

export const MODELS = [
  { id: 'langgraph-agent', label: 'LangGraph Agent', description: 'General purpose AI agent' },
  { id: 'rag-agent', label: 'RAG Agent', description: 'Retrieval augmented generation' },
  { id: 'research-agent', label: 'Research Agent', description: 'Deep research & analysis' },
  { id: 'code-agent', label: 'Code Agent', description: 'Code generation & review' },
];

export const DEFAULT_MODEL = MODELS[0];

export const CONVERSATION_GROUPS = {
  TODAY: 'Today',
  YESTERDAY: 'Yesterday',
  PREVIOUS_7_DAYS: 'Previous 7 Days',
  OLDER: 'Older',
};

export const INITIAL_CONVERSATIONS = [
  { id: 'c1', title: 'What is LangGraph?', createdAt: new Date().toISOString(), messages: [] },
  { id: 'c2', title: 'RAG System Design', createdAt: new Date(Date.now() - 86400000).toISOString(), messages: [] },
  { id: 'c3', title: 'Python Code Help', createdAt: new Date(Date.now() - 86400000).toISOString(), messages: [] },
  { id: 'c4', title: 'Vector Databases', createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), messages: [] },
  { id: 'c5', title: 'Agent Architecture', createdAt: new Date(Date.now() - 4 * 86400000).toISOString(), messages: [] },
  { id: 'c6', title: 'LangChain vs LangGraph', createdAt: new Date(Date.now() - 5 * 86400000).toISOString(), messages: [] },
];


export const CAPABILITIES = [
  { id: 'web', label: 'Web Search', icon: 'Globe' },
  { id: 'doc', label: 'Document Q&A', icon: 'FileText' },
  { id: 'code', label: 'Code Execution', icon: 'Terminal' },
  { id: 'img', label: 'Image Analysis', icon: 'Image' },
  { id: 'data', label: 'Data Analysis', icon: 'BarChart2' },
  { id: 'mem', label: 'Memory', icon: 'Brain' },
];

export const MOCK_RESPONSES = [
  `**LangGraph** is a framework built on top of LangChain that allows you to create stateful, multi-actor applications with LLMs.

Key concepts include:

- **StateGraph**: The core abstraction that manages the state of your application
- **Nodes**: Individual processing units (functions or agents)
- **Edges**: Connections between nodes that define the flow
- **Conditional edges**: Dynamic routing based on state

\`\`\`python
from langgraph.graph import StateGraph, END
from typing import TypedDict

class AgentState(TypedDict):
    messages: list
    
graph = StateGraph(AgentState)
graph.add_node("agent", agent_node)
graph.add_edge("agent", END)
graph.set_entry_point("agent")
app = graph.compile()
\`\`\`

LangGraph is especially useful for building **multi-agent systems**, **RAG pipelines**, and **complex reasoning chains**.`,

  `Here's how to build a production-ready **RAG pipeline** with LangGraph:

## Architecture Overview

1. **Document Ingestion** → Vector Store
2. **Query Processing** → Retriever  
3. **Generation** → LLM with context
4. **Evaluation** → Quality checks

\`\`\`python
from langgraph.graph import StateGraph
from langchain_community.vectorstores import Chroma
from langchain_openai import ChatOpenAI

def retrieve(state):
    docs = retriever.get_relevant_documents(state["query"])
    return {"context": docs}

def generate(state):
    response = llm.invoke(prompt.format(
        context=state["context"],
        question=state["query"]
    ))
    return {"answer": response.content}

workflow = StateGraph(RAGState)
workflow.add_node("retrieve", retrieve)
workflow.add_node("generate", generate)
workflow.add_edge("retrieve", "generate")
\`\`\`

> **Pro tip**: Add a grading node to evaluate retrieval quality before generation.`,

  `Great question! Here are the **best practices** for AI agent development with LangGraph:

### 1. State Design
- Keep state minimal and focused
- Use TypedDict for type safety  
- Avoid storing large objects in state

### 2. Error Handling
- Add retry logic with exponential backoff
- Implement fallback nodes for failures
- Log state transitions for debugging

### 3. Testing
- Test each node in isolation
- Use LangSmith for tracing
- Mock external APIs during tests

### 4. Performance
- Use async nodes where possible
- Implement caching for expensive operations
- Stream responses for better UX

### 5. Security
- Validate all tool inputs
- Implement rate limiting
- Never expose raw API errors to users`,
];
