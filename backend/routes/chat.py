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
      data: {"token": "..."}\\n\\n           – a streamed LLM token
      data: {"tool_start": "name", "input": {...}}\\n\\n  – tool call started
      data: {"tool_end": "name", "output": "..."}\\n\\n  – tool call finished
      data: {"done": true, "conversation_id": "..."}\\n\\n – end of stream
    """
    workflow = request.app.state.workflow
    thread_id = req.conversation_id or str(uuid.uuid4())
    config = {"configurable": {"thread_id": thread_id}}

    async def event_generator():
        try:
            async for event in workflow.astream_events(
                {"messages": [HumanMessage(content=req.message)]},
                config,
                version="v2",
            ):
                kind = event["event"]

                # ── Streamed LLM token ──────────────────────────────────────
                if kind == "on_chat_model_stream":
                    chunk = event["data"].get("chunk")
                    if chunk:
                        token = extract_content(chunk.content)
                        if token:
                            yield f"data: {json.dumps({'token': token})}\n\n"

                # ── Tool call started (LLM decided to use a tool) ───────────
                elif kind == "on_tool_start":
                    tool_name = event.get("name", "tool")
                    tool_input = event["data"].get("input", {})
                    yield f"data: {json.dumps({'tool_start': tool_name, 'input': tool_input})}\n\n"

                # ── Tool call finished (result is available) ────────────────
                elif kind == "on_tool_end":
                    tool_name = event.get("name", "tool")
                    tool_output = event["data"].get("output", "")
                    # Truncate large outputs (e.g. full stock API response)
                    output_str = str(tool_output)
                    if len(output_str) > 500:
                        output_str = output_str[:500] + "…"
                    yield f"data: {json.dumps({'tool_end': tool_name, 'output': output_str})}\n\n"

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

        last_chunk = None
        for chunk in workflow.stream(
            {"messages": [HumanMessage(content=req.message)]},
            config,
        ):
            last_chunk = chunk

        if last_chunk is None:
            raise ValueError("No response received from the workflow.")

        node_output = next(iter(last_chunk.values()))
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
