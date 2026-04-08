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

// Prompt cards shown on the welcome screen.
// Now showcase the 3 tools you built!
export const PROMPT_CARDS = [
  {
    id: 'p1',
    icon: 'TrendingUp',
    title: 'Stock Price',
    description: 'Look up a live stock price',
    prompt: "What is the current stock price of Apple (AAPL)?",
  },
  {
    id: 'p2',
    icon: 'Calculator',
    title: 'Calculator',
    description: 'Do some quick math',
    prompt: "What is 1234 multiplied by 56? Then divide that result by 7.",
  },
  {
    id: 'p3',
    icon: 'Search',
    title: 'Web Search',
    description: 'Search the web for latest info',
    prompt: "Search the web for the latest news about LangGraph and summarize what you find.",
  },
  {
    id: 'p4',
    icon: 'Zap',
    title: 'Multi-tool',
    description: 'Combine tools in one query',
    prompt: "Search the web for Tesla's latest news, then get the TSLA stock price and calculate what 100 shares would be worth.",
  },
];

// Tool metadata used for display labels in the UI
export const TOOL_DISPLAY = {
  search_tool:     { label: 'Web Search',   color: '#60a5fa' },
  calculator:      { label: 'Calculator',    color: '#a78bfa' },
  get_stock_price: { label: 'Stock Lookup', color: '#34d399' },
};
