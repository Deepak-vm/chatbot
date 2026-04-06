from typing import Annotated, TypedDict

from dotenv import load_dotenv
from langchain_core.messages import BaseMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver
from langgraph.graph import END, START, StateGraph, add_messages

load_dotenv()

llm = ChatGoogleGenerativeAI(model="gemini-3.6-flash", streaming=True)


class ChatState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]


def chat_node(state: ChatState) -> dict:
    # Use invoke — LangGraph handles async streaming via astream_events
    reply = llm.invoke(state["messages"])
    return {"messages": [reply]}


graph = StateGraph(ChatState)
graph.add_node("chat_node", chat_node)
graph.add_edge(START, "chat_node")
graph.add_edge("chat_node", END)

# AsyncSqliteSaver is required for async FastAPI routes (astream_events)
# aiosqlite is already installed as a dependency of langgraph-checkpoint-sqlite
checkpointer = AsyncSqliteSaver.from_conn_string("checkpoints.db")
workflow = graph.compile(checkpointer=checkpointer)


