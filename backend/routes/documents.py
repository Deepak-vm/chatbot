"""
routes/documents.py
-------------------
POST /api/documents/upload  — accept a file, chunk it, embed it, save to FAISS index.
GET  /api/documents          — list indexed documents (metadata only).
DELETE /api/documents/{name} — remove a document's chunks by source filename.
"""

import os
import shutil
import logging
import tempfile
from pathlib import Path

from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel

from rag.loader import load_and_split
from rag.vectorstore import add_documents, get_vector_store

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/documents", tags=["documents"])

ALLOWED_EXTENSIONS = {".pdf", ".txt", ".md"}
MAX_FILE_SIZE_MB = 20


# ── Schemas ────────────────────────────────────────────────────────────────────
class DocumentInfo(BaseModel):
    name: str
    chunks: int


class UploadResponse(BaseModel):
    filename: str
    chunks_added: int
    message: str


# ── Upload ─────────────────────────────────────────────────────────────────────
@router.post("/upload", response_model=UploadResponse)
async def upload_document(file: UploadFile = File(...)):
    """
    Upload a PDF, TXT, or MD file to be indexed in the RAG vector store.
    The file is chunked, embedded, and added to the persistent FAISS index.
    """
    # Validate extension
    suffix = Path(file.filename).suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{suffix}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # Read content and check size
    content = await file.read()
    size_mb = len(content) / (1024 * 1024)
    if size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=413,
            detail=f"File too large ({size_mb:.1f} MB). Maximum allowed: {MAX_FILE_SIZE_MB} MB.",
        )

    # Write to a temp file so loaders (PyPDFLoader etc.) can read it by path
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(content)
        tmp_path = tmp.name

    try:
        chunks = load_and_split(tmp_path)

        # Stamp the real filename into metadata so rag_tool can show it
        for chunk in chunks:
            chunk.metadata["source"] = file.filename

        n = add_documents(chunks)
        logger.info("Indexed %d chunks from '%s'", n, file.filename)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Error indexing '%s'", file.filename)
        raise HTTPException(status_code=500, detail=f"Indexing failed: {exc}") from exc
    finally:
        os.unlink(tmp_path)

    return UploadResponse(
        filename=file.filename,
        chunks_added=n,
        message=f"Successfully indexed {n} chunks from '{file.filename}'.",
    )


# ── List ───────────────────────────────────────────────────────────────────────
@router.get("", response_model=list[DocumentInfo])
def list_documents():
    """Return the list of indexed documents with their chunk counts."""
    store = get_vector_store()
    if store is None:
        return []

    # FAISS stores docstore entries; aggregate by source filename
    counts: dict[str, int] = {}
    try:
        for doc_id in store.index_to_docstore_id.values():
            doc = store.docstore.search(doc_id)
            if doc:
                src = doc.metadata.get("source", "unknown")
                name = os.path.basename(src)
                counts[name] = counts.get(name, 0) + 1
    except Exception as exc:
        logger.warning("Could not enumerate documents: %s", exc)

    return [DocumentInfo(name=name, chunks=cnt) for name, cnt in counts.items()]
