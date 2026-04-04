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

export const PROMPT_CARDS = [
  {
    id: 'p1',
    icon: 'Terminal',
    title: 'Explain LangGraph',
    description: 'What is it and how does it work?',
    prompt: 'What is LangGraph and how does it work? Explain the core concepts including StateGraph, nodes, and edges.',
  },
  {
    id: 'p2',
    icon: 'Database',
    title: 'Build RAG system',
    description: 'How do I build a RAG pipeline?',
    prompt: 'How do I build a production-ready RAG pipeline with LangGraph?',
  },
  {
    id: 'p3',
    icon: 'Bug',
    title: 'Code assistance',
    description: 'Help me debug and improve code',
    prompt: 'Help me debug and improve my Python code for a LangGraph agent.',
  },
  {
    id: 'p4',
    icon: 'CheckSquare',
    title: 'Best practices',
    description: 'Agent development guidelines',
    prompt: 'What are the best practices for building reliable, production-ready AI agents with LangGraph?',
  },
];
