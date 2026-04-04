import uuid

from fastapi import APIRouter, HTTPException
from langchain_core.messages import HumanMessage

from graph import workflow
from schemas import ChatRequest, ChatResponse, ConversationOut, MessageOut, RenameRequest

router = APIRouter(prefix="/api", tags=["chat"])


def extract_content(raw) -> str:
    """
    Gemini can return content as either:
      - a plain string: "Hello!"
      - a list of parts: [{'type': 'text', 'text': 'Hello!'}]
    This helper always returns a plain string.
    """
    if isinstance(raw, list):
        return "".join(
            part.get("text", "") if isinstance(part, dict) else str(part)
            for part in raw
        )
    return str(raw)


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    thread_id = req.conversation_id or str(uuid.uuid4())

    try:
        config = {"configurable": {"thread_id": thread_id}}
        result = workflow.invoke(
            {"messages": [HumanMessage(content=req.message)]},
            config,
        )
        last = result["messages"][-1]
        content = extract_content(last.content)

        return ChatResponse(
            conversation_id=thread_id,
            message=MessageOut(role="assistant", content=content),
            sources=[],
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("/conversations", response_model=list[ConversationOut])
def list_conversations():
    return []


@router.post("/conversations", response_model=ConversationOut)
def create_conversation(body: dict = {}):
    return ConversationOut(id=str(uuid.uuid4()), title=body.get("title", "New Chat"))


@router.delete("/conversations/{conversation_id}")
def delete_conversation(conversation_id: str):
    return {"status": "deleted", "id": conversation_id}


@router.patch("/conversations/{conversation_id}", response_model=ConversationOut)
def rename_conversation(conversation_id: str, body: RenameRequest):
    return ConversationOut(id=conversation_id, title=body.title)
