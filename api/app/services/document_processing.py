from io import BytesIO
from pathlib import Path
from zipfile import BadZipFile

from docx import Document as DocxDocument
from fastapi import HTTPException, UploadFile, status
from pypdf import PdfReader

ALLOWED_TYPES = {
    "application/pdf": ".pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    "text/plain": ".txt",
}


async def validate_upload(file: UploadFile, max_bytes: int) -> bytes:
    data = await file.read()
    suffix = Path(file.filename or "").suffix.lower()
    if file.content_type not in ALLOWED_TYPES or suffix != ALLOWED_TYPES.get(file.content_type):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only PDF, DOCX, and TXT files are supported")
    if not data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty")
    if len(data) > max_bytes:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File exceeds configured size limit")
    return data


def extract_text(file_name: str, content_type: str, data: bytes) -> str:
    if content_type == "text/plain":
        return data.decode("utf-8", errors="replace")
    if content_type == "application/pdf":
        reader = PdfReader(BytesIO(data))
        return "\n\n".join(page.extract_text() or "" for page in reader.pages).strip()
    if content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        try:
            document = DocxDocument(BytesIO(data))
        except BadZipFile as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid DOCX file") from exc
        return "\n".join(paragraph.text for paragraph in document.paragraphs if paragraph.text.strip()).strip()
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Unsupported file type for {file_name}")


def chunk_text(text: str, *, chunk_size: int = 1200, overlap: int = 180) -> list[dict[str, object]]:
    cleaned = " ".join(text.split())
    if not cleaned:
        return []
    chunks: list[dict[str, object]] = []
    start = 0
    while start < len(cleaned):
        end = min(len(cleaned), start + chunk_size)
        window = cleaned[start:end]
        if end < len(cleaned):
            boundary = max(window.rfind(". "), window.rfind("; "), window.rfind("\n"))
            if boundary > chunk_size // 2:
                end = start + boundary + 1
                window = cleaned[start:end]
        chunks.append(
            {
                "chunk_index": len(chunks),
                "content": window.strip(),
                "token_count": max(1, len(window.split())),
                "metadata": {"start": start, "end": end},
            }
        )
        if end >= len(cleaned):
            break
        start = max(0, end - overlap)
    return chunks
