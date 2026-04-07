import json
import uuid

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from langchain_core.messages import HumanMessage

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


# ─── Streaming endpoint (SSE) ────────────────────────────────────────────────

@router.post("/chat/stream")
async def chat_stream(req: ChatRequest, request: Request):
    """
    Server-Sent Events endpoint.
    Each event is a JSON line:
      data: {"token": "..."}\n\n   – a streamed token
      data: {"done": true, "conversation_id": "..."}\n\n  – end of stream
    """
    workflow = request.app.state.workflow
    thread_id = req.conversation_id or str(uuid.uuid4())
    config = {"configurable": {"thread_id": thread_id}}

    async def event_generator():
        try:
            # astream_events(version="v2") fires:
            #   on_chat_model_stream → individual LLM tokens
            async for event in workflow.astream_events(
                {"messages": [HumanMessage(content=req.message)]},
                config,
                version="v2",
            ):
                if event["event"] == "on_chat_model_stream":
                    chunk = event["data"].get("chunk")
                    if chunk:
                        token = extract_content(chunk.content)
                        if token:
                            yield f"data: {json.dumps({'token': token})}\n\n"

            # Signal end of stream
            yield f"data: {json.dumps({'done': True, 'conversation_id': thread_id})}\n\n"

        except Exception as exc:
            yield f"data: {json.dumps({'error': str(exc)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",       # Disable nginx buffering
        },
    )


# ─── Non-streaming fallback endpoint ─────────────────────────────────────────

@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest, request: Request):
    workflow = request.app.state.workflow
    thread_id = req.conversation_id or str(uuid.uuid4())

    try:
        config = {"configurable": {"thread_id": thread_id}}

        # workflow.stream() yields state chunks per node, e.g.:
        #   {"chat_node": {"messages": [AIMessage(...)]}}
        # We consume the entire stream and keep the last chunk's messages.
        last_chunk = None
        for chunk in workflow.stream(
            {"messages": [HumanMessage(content=req.message)]},
            config,
        ):
            last_chunk = chunk

        if last_chunk is None:
            raise ValueError("No response received from the workflow.")

        # Each chunk is a dict keyed by node name; grab the last AI message.
        node_output = next(iter(last_chunk.values()))  # e.g. {"messages": [...]}
        last = node_output["messages"][-1]
        content = extract_content(last.content)

        return ChatResponse(
            conversation_id=thread_id,
            message=MessageOut(role="assistant", content=content),
            sources=[],
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


# ─── Conversation management ──────────────────────────────────────────────────

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
