from typing import Any
from uuid import UUID

from psycopg.types.json import Jsonb

from app.db import get_connection


class DocumentRepository:
    def create(
        self,
        *,
        user_id: str,
        file_name: str,
        file_type: str,
        file_size: int,
        storage_url: str,
        text_content: str,
        status: str,
        metadata: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        with get_connection() as connection:
            row = connection.execute(
                """
                insert into public.documents (user_id, file_name, file_type, file_size, storage_url, text_content, status, metadata)
                values (%s, %s, %s, %s, %s, %s, %s, %s::jsonb)
                returning id, user_id, file_name, file_type, file_size, upload_date::text, storage_url, status
                """,
                (user_id, file_name, file_type, file_size, storage_url, text_content, status, Jsonb(metadata or {})),
            ).fetchone()
            connection.commit()
            return dict(row)

    def list(self, user_id: str, query: str | None = None) -> list[dict[str, Any]]:
        sql = """
            select id, user_id, file_name, file_type, file_size, upload_date::text, storage_url, status
            from public.documents
            where user_id = %s and deleted_at is null
        """
        params: list[Any] = [user_id]
        if query:
            sql += " and file_name ilike %s"
            params.append(f"%{query}%")
        sql += " order by upload_date desc limit 50"
        with get_connection() as connection:
            return [dict(row) for row in connection.execute(sql, params).fetchall()]

    def get(self, user_id: str, document_id: UUID) -> dict[str, Any] | None:
        with get_connection() as connection:
            row = connection.execute(
                """
                select id, user_id, file_name, file_type, file_size, upload_date::text, storage_url, status, text_content
                from public.documents
                where user_id = %s and id = %s and deleted_at is null
                """,
                (user_id, document_id),
            ).fetchone()
            return dict(row) if row else None

    def soft_delete(self, user_id: str, document_id: UUID) -> bool:
        with get_connection() as connection:
            row = connection.execute(
                "update public.documents set deleted_at = now() where user_id = %s and id = %s and deleted_at is null returning id",
                (user_id, document_id),
            ).fetchone()
            connection.commit()
            return row is not None


class AnalysisRepository:
    def create(
        self,
        *,
        user_id: str,
        document_id: UUID | None,
        tool_used: str,
        result: dict[str, Any],
        markdown: str,
        risk_score: int | None = None,
    ) -> dict[str, Any]:
        with get_connection() as connection:
            row = connection.execute(
                """
                insert into public.analyses (document_id, user_id, tool_used, result, markdown, risk_score)
                values (%s, %s, %s, %s::jsonb, %s, %s)
                returning id, created_at::text
                """,
                (document_id, user_id, tool_used, Jsonb(result), markdown, risk_score),
            ).fetchone()
            connection.commit()
            return dict(row)

    def recent(self, user_id: str) -> list[dict[str, Any]]:
        with get_connection() as connection:
            return [
                dict(row)
                for row in connection.execute(
                    """
                    select a.id, a.document_id, d.file_name, a.tool_used, a.risk_score, a.created_at::text
                    from public.analyses a
                    left join public.documents d on d.id = a.document_id
                    where a.user_id = %s
                    order by a.created_at desc
                    limit 20
                    """,
                    (user_id,),
                ).fetchall()
            ]

    def get(self, user_id: str, analysis_id: UUID) -> dict[str, Any] | None:
        with get_connection() as connection:
            row = connection.execute(
                "select * from public.analyses where user_id = %s and id = %s",
                (user_id, analysis_id),
            ).fetchone()
            return dict(row) if row else None


class ChunkRepository:
    def replace_chunks(self, *, user_id: str, document_id: UUID, chunks: list[dict[str, Any]]) -> None:
        with get_connection() as connection:
            connection.execute("delete from public.document_chunks where user_id = %s and document_id = %s", (user_id, document_id))
            for chunk in chunks:
                connection.execute(
                    """
                    insert into public.document_chunks
                    (document_id, user_id, chunk_index, content, token_count, page_number, section_title, embedding, metadata)
                    values (%s, %s, %s, %s, %s, %s, %s, %s, %s::jsonb)
                    """,
                    (
                        document_id,
                        user_id,
                        chunk["chunk_index"],
                        chunk["content"],
                        chunk["token_count"],
                        chunk.get("page_number"),
                        chunk.get("section_title"),
                        chunk.get("embedding"),
                        Jsonb(chunk.get("metadata", {})),
                    ),
                )
            connection.execute("update public.documents set status = 'indexed' where user_id = %s and id = %s", (user_id, document_id))
            connection.commit()

    def semantic_search(self, *, user_id: str, query_embedding: list[float], document_id: UUID | None, limit: int = 8) -> list[dict[str, Any]]:
        embedding = "[" + ",".join(str(value) for value in query_embedding) + "]"
        with get_connection() as connection:
            return [
                dict(row)
                for row in connection.execute(
                    "select * from public.match_document_chunks(%s::vector, %s::uuid, %s::uuid, %s)",
                    (embedding, user_id, document_id, limit),
                ).fetchall()
            ]

    def keyword_search(self, *, user_id: str, query: str, document_id: UUID | None, limit: int = 8) -> list[dict[str, Any]]:
        with get_connection() as connection:
            return [
                dict(row)
                for row in connection.execute(
                    "select * from public.keyword_document_chunks(%s, %s::uuid, %s::uuid, %s)",
                    (query, user_id, document_id, limit),
                ).fetchall()
            ]


class ChatRepository:
    def create_session(self, *, user_id: str, document_id: UUID | None, title: str) -> UUID:
        with get_connection() as connection:
            row = connection.execute(
                "insert into public.chat_sessions (user_id, document_id, title) values (%s, %s, %s) returning id",
                (user_id, document_id, title[:120]),
            ).fetchone()
            connection.commit()
            return row["id"]

    def add_message(self, *, session_id: UUID, user_id: str, role: str, content: str, citations: list[dict[str, Any]] | None = None, confidence: float | None = None) -> None:
        with get_connection() as connection:
            connection.execute(
                """
                insert into public.chat_messages (session_id, user_id, role, content, citations, confidence)
                values (%s, %s, %s, %s, %s::jsonb, %s)
                """,
                (session_id, user_id, role, content, Jsonb(citations or []), confidence),
            )
            connection.execute("update public.chat_sessions set updated_at = now() where id = %s and user_id = %s", (session_id, user_id))
            connection.commit()
