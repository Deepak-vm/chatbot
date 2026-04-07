import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver

from graph import graph_builder
from routes import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # AsyncSqliteSaver must be used as an async context manager —
    # it opens/closes the aiosqlite connection for the app lifetime.
    async with AsyncSqliteSaver.from_conn_string("checkpoints.db") as checkpointer:
        app.state.workflow = graph_builder.compile(checkpointer=checkpointer)
        yield
    # Connection is automatically closed when the context manager exits


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/", tags=["health"])
def root():
    return {"status": "ok", "message": "LangGraph Chat API is running"}


@app.get("/health", tags=["health"])
def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
