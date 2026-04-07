from typing import Annotated, TypedDict

from dotenv import load_dotenv
from langchain_core.messages import BaseMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import END, START, StateGraph, add_messages

load_dotenv()

llm = ChatGoogleGenerativeAI(model="gemini-3.6-flash", streaming=True)


class ChatState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]


def chat_node(state: ChatState) -> dict:
    # Use invoke — LangGraph handles async streaming via astream_events
    reply = llm.invoke(state["messages"])
    return {"messages": [reply]}


# Only the builder is defined here.
# The graph is compiled in main.py lifespan with AsyncSqliteSaver.
graph_builder = StateGraph(ChatState)
graph_builder.add_node("chat_node", chat_node)
graph_builder.add_edge(START, "chat_node")
graph_builder.add_edge("chat_node", END)



