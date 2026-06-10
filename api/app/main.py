from uuid import UUID

from fastapi import Depends, FastAPI, File, HTTPException, Query, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from app.core.config import get_settings
from app.core.rate_limit import rate_limit
from app.core.security import AuthUser, get_current_user
from app.repositories import AnalysisRepository, ChatRepository, ChunkRepository, DocumentRepository
from app.schemas import ChatRequest, ChatResponse, DocumentOut, ToolRequest, ToolResponse
from app.services.document_processing import chunk_text, extract_text, validate_upload
from app.services.export_service import analysis_docx, analysis_pdf
from app.services.openai_service import OpenAIService, to_markdown
from app.services.rag_service import RagService
from app.services.storage_service import StorageService

settings = get_settings()
app = FastAPI(title=settings.app_name, version="1.0.0", dependencies=[Depends(rate_limit)])

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/documents", response_model=list[DocumentOut])
def list_documents(
    query: str | None = Query(default=None, max_length=120),
    user: AuthUser = Depends(get_current_user),
) -> list[dict[str, object]]:
    repo = DocumentRepository()
    storage = StorageService()
    documents = repo.list(user.id, query)
    for document in documents:
        document["signed_url"] = storage.signed_url(str(document["storage_url"]))
    return documents


@app.post("/documents", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
async def upload_document(file: UploadFile = File(...), user: AuthUser = Depends(get_current_user)) -> dict[str, object]:
    max_bytes = settings.max_upload_mb * 1024 * 1024
    data = await validate_upload(file, max_bytes)
    text = extract_text(file.filename or "document", file.content_type or "", data)
    storage = StorageService()
    print("TEXT LENGTH:", len(text))
    print("FIRST 300 CHARS:")
    print(text[:300])
    storage_path = storage.upload(user_id=user.id, file_name=file.filename or "document", content_type=file.content_type or "application/octet-stream", data=data)
    document = DocumentRepository().create(
        user_id=user.id,
        file_name=file.filename or "document",
        file_type=file.content_type or "application/octet-stream",
        file_size=len(data),
        storage_url=storage_path,
        text_content=text,
        status="processing",
        metadata={"source": "upload"},
    )

    chunks = chunk_text(text)
    if chunks:
      enriched = RagService().embed_chunks(chunks)
      ChunkRepository().replace_chunks(user_id=user.id, document_id=document["id"], chunks=enriched)

    document["signed_url"] = storage.signed_url(storage_path)
    document["status"] = "indexed" if chunks else "uploaded"
    return document


@app.delete("/documents/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(document_id: UUID, user: AuthUser = Depends(get_current_user)) -> Response:
    deleted = DocumentRepository().soft_delete(user.id, document_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.post("/tools", response_model=ToolResponse)
def run_tool(payload: ToolRequest, user: AuthUser = Depends(get_current_user)) -> ToolResponse:
    document_text = payload.input
    if payload.document_id:
        document = DocumentRepository().get(user.id, payload.document_id)
        if not document:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
        document_text = str(document.get("text_content") or payload.input)

    openai = OpenAIService()
    context = None
    if payload.document_id:
        chunks, _confidence = RagService().retrieve(user_id=user.id, question=payload.prompt or payload.tool, document_id=payload.document_id)
        context = "\n\n".join(f"[chunk {chunk['chunk_index']}] {chunk['content']}" for chunk in chunks)
    result = openai.generate_tool_result(tool=payload.tool, text=document_text, prompt=payload.prompt, context=context)
    markdown = to_markdown(payload.tool, result)
    risk_score = result.get("risk_score") if isinstance(result.get("risk_score"), int) else None
    analysis = AnalysisRepository().create(
        user_id=user.id,
        document_id=payload.document_id,
        tool_used=payload.tool,
        result=result,
        markdown=markdown,
        risk_score=risk_score,
    )
    citations = result.get("citations", [])
    return ToolResponse(
        output=markdown,
        result=result,
        confidence=str(result.get("confidence", "medium")) if result.get("confidence") in {"high", "medium", "low"} else "medium",
        citations=[str(item) for item in citations] if isinstance(citations, list) else [],
        analysis_id=analysis["id"],
    )


@app.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest, user: AuthUser = Depends(get_current_user)) -> ChatResponse:
    rag = RagService()
    chunks, retrieval_confidence = rag.retrieve(user_id=user.id, question=payload.question, document_id=payload.document_id)
    answer = rag.openai.answer_with_context(question=payload.question, context=chunks)
    session_id = payload.session_id or ChatRepository().create_session(user_id=user.id, document_id=payload.document_id, title=payload.question)
    citations = [
        {
            "document_id": chunk["document_id"],
            "chunk_index": chunk["chunk_index"],
            "page_number": chunk.get("page_number"),
            "excerpt": str(chunk["content"])[:500],
            "score": float(chunk.get("rrf_score", 0)),
        }
        for chunk in chunks
    ]
    raw_confidence = answer.get("confidence")

    if isinstance(raw_confidence, str):
        mapping = {
            "low": 0.3,
            "medium": 0.6,
            "high": 0.9,
        }
        confidence = mapping.get(raw_confidence.lower(), retrieval_confidence)
    else:
        confidence = float(raw_confidence or retrieval_confidence)

    ChatRepository().add_message(
        session_id=session_id,
        user_id=user.id,
        role="user",
        content=payload.question,
    )

    ChatRepository().add_message(
        session_id=session_id,
        user_id=user.id,
        role="assistant",
        content=str(answer.get("answer", "")),
        citations=citations,
        confidence=confidence,
    )

    return ChatResponse(
        session_id=session_id,
        answer=str(answer.get("answer", "")),
        citations=citations,
        confidence=confidence,
    )

@app.get("/analyses/recent")
def recent_analyses(user: AuthUser = Depends(get_current_user)) -> list[dict[str, object]]:
    return AnalysisRepository().recent(user.id)


@app.get("/reports/{analysis_id}.{format}")
def export_report(analysis_id: UUID, format: str, user: AuthUser = Depends(get_current_user)) -> Response:
    analysis = AnalysisRepository().get(user.id, analysis_id)
    if not analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found")
    if format == "pdf":
        data = analysis_pdf(title=f"LegalDoc {analysis['tool_used']} Report", result=analysis["result"])
        return Response(content=data, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=legaldoc-report.pdf"})
    if format == "docx":
        data = analysis_docx(title=f"LegalDoc {analysis['tool_used']} Report", result=analysis["result"])
        return Response(
            content=data,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": "attachment; filename=legaldoc-report.docx"},
        )
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported report format")
