from collections.abc import Iterator
from contextlib import contextmanager
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

import psycopg
from fastapi import HTTPException, status
from psycopg.rows import dict_row

from app.core.config import get_settings


_UNSUPPORTED_DATABASE_URL_PARAMS = {"pgbouncer", "connection_limit", "pool_timeout"}


def _normalized_database_url(database_url: str) -> str:
    parts = urlsplit(database_url)
    hostname = parts.hostname or ""
    query = {
        key: value
        for key, value in parse_qsl(parts.query, keep_blank_values=True)
        if key not in _UNSUPPORTED_DATABASE_URL_PARAMS
    }
    if "supabase.com" in hostname.lower():
        query.setdefault("sslmode", "require")
    return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(query), parts.fragment))


@contextmanager
def get_connection() -> Iterator[psycopg.Connection]:
    settings = get_settings()
    if not settings.database_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="DATABASE_URL is not configured in the backend environment. Add it to api/.env and restart FastAPI.",
        )
    try:
        with psycopg.connect(_normalized_database_url(settings.database_url), row_factory=dict_row) as connection:
            yield connection
    except psycopg.Error as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database connection failed: {exc.__class__.__name__}",
        ) from exc
