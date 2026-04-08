from dotenv import load_dotenv
from typing import Annotated
from typing_extensions import TypedDict

from langchain_core.messages import BaseMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import END, START, StateGraph, add_messages
from langgraph.prebuilt import ToolNode, tools_condition

from tools import TOOLS

load_dotenv()

# ── System prompt ──────────────────────────────────────────────────────────────
SYSTEM_PROMPT = SystemMessage(content="""You are a helpful AI assistant with access to the following tools:
- search_tool: Search the web for current information
- calculator: Perform arithmetic (add, sub, mul, div)
- get_stock_price: Fetch the latest stock price for a ticker symbol (e.g. AAPL, TSLA)

Use tools whenever the user asks a factual question that requires real-time data or calculation.
Always be concise and helpful in your responses.""")


# ── LLM setup ──────────────────────────────────────────────────────────────────
llm = ChatGoogleGenerativeAI(model="gemini-3.6-flash", streaming=True)
llm_with_tools = llm.bind_tools(TOOLS)


# ── State ───────────────────────────────────────────────────────────────────────
class ChatState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]


# ── Nodes ───────────────────────────────────────────────────────────────────────
def chat_node(state: ChatState) -> dict:
    """Main LLM node: prepends system prompt and invokes the tool-aware LLM."""
    messages = [SYSTEM_PROMPT] + state["messages"]
    reply = llm_with_tools.invoke(messages)  
    return {"messages": [reply]}

tool_node = ToolNode(TOOLS)


# ── Graph builder ───────────────────────────────────────────────────────────────
graph_builder = StateGraph(ChatState)

graph_builder.add_node("chat_node", chat_node)
graph_builder.add_node("tools", tool_node)

graph_builder.add_edge(START, "chat_node")

graph_builder.add_conditional_edges("chat_node", tools_condition)


graph_builder.add_edge("tools", "chat_node")
