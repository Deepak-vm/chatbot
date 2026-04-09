"""
rag/loader.py
-------------
Handles document ingestion: loading files and splitting them into chunks
ready to be passed to add_documents().

Supported loaders:
- PDF  → PyPDFLoader
- TXT  → TextLoader
- DOCX → Docx2txtLoader  (requires docx2txt)
"""

import logging
from pathlib import Path

from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

logger = logging.getLogger(__name__)

_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    add_start_index=True,
)


def load_and_split(file_path: str) -> list:
    """
    Load a file and split it into LangChain Document chunks.

    Args:
        file_path: Absolute or relative path to the file.

    Returns:
        A list of Document objects ready for embedding.

    Raises:
        ValueError: If the file type is not supported.
        FileNotFoundError: If the file does not exist.
    """
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")

    suffix = path.suffix.lower()

    if suffix == ".pdf":
        loader = PyPDFLoader(str(path))
    elif suffix in (".txt", ".md"):
        loader = TextLoader(str(path), encoding="utf-8")
    else:
        raise ValueError(
            f"Unsupported file type '{suffix}'. Supported: .pdf, .txt, .md"
        )

    logger.info("Loading %s …", path.name)
    docs = loader.load()
    chunks = _splitter.split_documents(docs)
    logger.info("Split %s into %d chunks.", path.name, len(chunks))
    return chunks
