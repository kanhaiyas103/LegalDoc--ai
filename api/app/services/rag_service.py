from typing import Any
from uuid import UUID

from app.repositories import ChunkRepository
from app.services.openai_service import OpenAIService


class RagService:
    def __init__(self) -> None:
        self.chunks = ChunkRepository()
        self.openai = OpenAIService()

    def embed_chunks(self, chunks: list[dict[str, Any]]) -> list[dict[str, Any]]:
        embeddings = self.openai.embed([chunk["content"] for chunk in chunks])
        enriched: list[dict[str, Any]] = []
        for chunk, embedding in zip(chunks, embeddings, strict=False):
            next_chunk = dict(chunk)
            next_chunk["embedding"] = embedding if embedding else None
            enriched.append(next_chunk)
        return enriched

    def retrieve(self, *, user_id: str, question: str, document_id: UUID | None, limit: int = 8) -> tuple[list[dict[str, Any]], float]:
        query_embedding = self.openai.embed([question])[0]
        semantic = self.chunks.semantic_search(user_id=user_id, query_embedding=query_embedding, document_id=document_id, limit=limit) if query_embedding else []
        keyword = self.chunks.keyword_search(user_id=user_id, query=question, document_id=document_id, limit=limit)

        scores: dict[str, dict[str, Any]] = {}
        k = 60
        for rank, row in enumerate(semantic, start=1):
            item = scores.setdefault(str(row["id"]), {**row, "rrf_score": 0.0})
            item["rrf_score"] += 1 / (k + rank)
            item["semantic_similarity"] = float(row.get("similarity") or 0)
        for rank, row in enumerate(keyword, start=1):
            item = scores.setdefault(str(row["id"]), {**row, "rrf_score": 0.0})
            item["rrf_score"] += 1 / (k + rank)
            item["keyword_rank"] = float(row.get("rank") or 0)

        fused = sorted(scores.values(), key=lambda row: row["rrf_score"], reverse=True)[:limit]
        confidence = min(0.95, sum(float(row["rrf_score"]) for row in fused) * 8)
        return fused, confidence
