"""
rag/vectorstore.py
------------------
Manages the FAISS vector store.

- On startup: loads from disk if an index already exists, otherwise starts empty.
- add_documents(chunks): embeds and adds new chunks, then saves to disk.
- get_retriever(): returns a LangChain retriever ready to be used in a tool.

The index is stored in FAISS_INDEX_DIR (default: ./faiss_index).
"""

import os
import logging
from pathlib import Path

from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings

logger = logging.getLogger(__name__)

FAISS_INDEX_DIR = os.getenv("FAISS_INDEX_DIR", "faiss_index")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "gemini-embedding-001")

# ── Singleton state ────────────────────────────────────────────────────────────
_vector_store: FAISS | None = None
_embeddings: GoogleGenerativeAIEmbeddings | None = None


def _get_embeddings() -> GoogleGenerativeAIEmbeddings:
    global _embeddings
    if _embeddings is None:
        candidate_models = [EMBEDDING_MODEL, "gemini-embedding-001", "models/gemini-embedding-001", "gemini-embedding-2"]
        # Remove duplicates while preserving order
        candidate_models = list(dict.fromkeys(candidate_models))
        
        last_error = None
        for model_name in candidate_models:
            try:
                emb = GoogleGenerativeAIEmbeddings(model=model_name)
                # Quick validation check to confirm model works with API key
                emb.embed_query("health check")
                logger.info(f"Successfully initialized Google embeddings with model '{model_name}'")
                _embeddings = emb
                break
            except Exception as exc:
                logger.warning(f"Embedding model '{model_name}' failed validation: {exc}")
                last_error = exc
        
        if _embeddings is None:
            raise RuntimeError(f"Failed to initialize any Google Generative AI embedding model. Last error: {last_error}")
            
    return _embeddings


def _load_store_from_disk() -> FAISS | None:
    """Load existing FAISS index from disk if it exists."""
    index_path = Path(FAISS_INDEX_DIR)
    if index_path.exists() and (index_path / "index.faiss").exists():
        logger.info("Loading FAISS index from %s", FAISS_INDEX_DIR)
        try:
            store = FAISS.load_local(
                FAISS_INDEX_DIR,
                _get_embeddings(),
                allow_dangerous_deserialization=True,
            )
            logger.info("FAISS index loaded successfully.")
            return store
        except Exception as exc:
            logger.warning("Failed to load FAISS index: %s — starting fresh.", exc)
    return None


def get_vector_store() -> FAISS | None:
    """Return the current in-memory vector store (may be None if no docs loaded)."""
    global _vector_store
    if _vector_store is None:
        _vector_store = _load_store_from_disk()
    return _vector_store


def add_documents(chunks: list) -> int:
    """
    Embed and add document chunks to the vector store.
    Persists the updated index to disk.
    Returns the number of chunks added.
    """
    global _vector_store

    if not chunks:
        return 0

    embeddings = _get_embeddings()

    if _vector_store is None:
        logger.info("Creating new FAISS index with %d chunks…", len(chunks))
        _vector_store = FAISS.from_documents(chunks, embeddings)
    else:
        logger.info("Adding %d chunks to existing FAISS index…", len(chunks))
        _vector_store.add_documents(chunks)

    # Persist to disk
    _vector_store.save_local(FAISS_INDEX_DIR)
    logger.info("FAISS index saved to %s", FAISS_INDEX_DIR)
    return len(chunks)


def get_retriever(k: int = 4, search_type: str = "mmr"):
    """
    Return a retriever from the current vector store.
    Returns None if no documents have been indexed yet.
    """
    store = get_vector_store()
    if store is None:
        return None
    return store.as_retriever(
        search_type=search_type,
        search_kwargs={"k": k, "fetch_k": max(k * 3, 20)},
    )
