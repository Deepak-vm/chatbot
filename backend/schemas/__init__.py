from pydantic import BaseModel

class ChatRequest(BaseModel):
    conversation_id: str | None = None
    message: str
    model: str = "LangGraph Agent"

class MessageOut(BaseModel):
    role: str
    content: str


class ChatResponse(BaseModel):
    conversation_id: str
    message: MessageOut
    sources: list = []


class ConversationOut(BaseModel):
    id: str
    title: str


class RenameRequest(BaseModel):
    title: str
