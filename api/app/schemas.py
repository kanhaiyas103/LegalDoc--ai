from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, Field


ToolId = Literal[
    "document-analyzer",
    "risk-scorer",
    "clause-extractor",
    "contract-drafter",
    "nda-generator",
    "legal-qa",
    "plain-english",
]


class ToolRequest(BaseModel):
    tool: ToolId
    input: str = Field(min_length=1, max_length=120_000)
    prompt: str | None = Field(default=None, max_length=8_000)
    documentName: str | None = Field(default=None, max_length=255)
    document_id: UUID | None = None


class ToolResponse(BaseModel):
    output: str
    result: dict[str, Any]
    confidence: Literal["high", "medium", "low"] = "medium"
    citations: list[str] = []
    analysis_id: UUID | None = None


class DocumentOut(BaseModel):
    id: UUID
    user_id: UUID
    file_name: str
    file_type: str
    file_size: int
    upload_date: str
    storage_url: str
    status: str
    signed_url: str | None = None


class ChatRequest(BaseModel):
    question: str = Field(min_length=1, max_length=4_000)
    document_id: UUID | None = None
    session_id: UUID | None = None


class Citation(BaseModel):
    document_id: UUID
    chunk_index: int
    page_number: int | None = None
    excerpt: str
    score: float


class ChatResponse(BaseModel):
    session_id: UUID
    answer: str
    citations: list[Citation]
    confidence: float


class ExportRequest(BaseModel):
    analysis_id: UUID
    format: Literal["pdf", "docx"]
