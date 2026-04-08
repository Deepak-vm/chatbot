from dotenv import load_dotenv
from typing import Annotated
from typing_extensions import TypedDict

from langchain_core.messages import BaseMessage, SystemMessage
# from langchain_google_genai import ChatGoogleGenerativeAI  # commented out — using Groq
from langchain_groq import ChatGroq
from langgraph.graph import END, START, StateGraph, add_messages
from langgraph.prebuilt import ToolNode, tools_condition

from tools import TOOLS

load_dotenv()

# ── System prompt ──────────────────────────────────────────────────────────────────
SYSTEM_PROMPT = SystemMessage(content="""You are a helpful and FACTUALLY RELIABLE AI assistant.

You have access to these tools:
- search_tool: Search the internet for real-time information
- calculator: Perform arithmetic (add, sub, mul, div)
- get_stock_price: Fetch the latest stock price for a ticker symbol (e.g. AAPL, TSLA)

General rules:
- Use tools whenever the user asks a factual question that requires real-time data or calculation.
- Be concise and accurate.

When using search_tool, you MUST follow these grounding rules:
1. Base your answer ONLY on facts explicitly stated in the search results.
2. Do NOT invent, fabricate, or guess: company names, product names, dates, version numbers, or statistics.
3. Do NOT combine or extrapolate beyond what the results actually say.
4. If search results are vague, incomplete, or contradictory, say so clearly.
5. Distinguish confirmed facts ("The results state...") from your inference ("This suggests...").
6. If asked about recent/latest events, include the date of the information if it appears in the results.
7. If you cannot verify something from the results, say: "I could not find reliable information about this."
""")


# ── LLM setup ──────────────────────────────────────────────────────────────────
# llm = ChatGoogleGenerativeAI(model="gemini-3.6-flash", streaming=True)  # commented out
llm = ChatGroq(
    model="openai/gpt-oss-20b",
    temperature=0,
    streaming=True,
)
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
