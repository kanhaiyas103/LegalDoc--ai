import json
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen
from uuid import uuid4

from fastapi import HTTPException, status

from app.core.config import get_settings


class StorageService:
    def __init__(self) -> None:
        settings = get_settings()
        self.settings = settings
        if not settings.supabase_url:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="SUPABASE_URL is not configured")
        if not settings.supabase_service_role_key:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="SUPABASE_SERVICE_ROLE_KEY is not configured")
        self.storage_url = f"{settings.supabase_url.rstrip('/')}/storage/v1"

    def _headers(self, content_type: str = "application/json") -> dict[str, str]:
        return {
            "apikey": self.settings.supabase_service_role_key,
            "authorization": f"Bearer {self.settings.supabase_service_role_key}",
            "content-type": content_type,
        }

    def _request(self, request: Request) -> Any:
        try:
            with urlopen(request, timeout=30) as response:
                body = response.read().decode("utf-8")
                return json.loads(body) if body else {}
        except HTTPError as exc:
            body = exc.read().decode("utf-8", errors="replace")
            detail = body or f"Supabase Storage returned HTTP {exc.code}"
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=detail) from exc
        except URLError as exc:
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Could not reach Supabase Storage: {exc.reason}") from exc

    def upload(self, *, user_id: str, file_name: str, content_type: str, data: bytes) -> str:
        path = f"{user_id}/{uuid4()}{Path(file_name).suffix.lower()}"
        encoded_path = quote(path, safe="/")
        url = f"{self.storage_url}/object/{self.settings.supabase_storage_bucket}/{encoded_path}"
        request = Request(
            url,
            data=data,
            headers={
                **self._headers(content_type),
                "x-upsert": "false",
            },
            method="POST",
        )
        self._request(request)
        return path

    def signed_url(self, path: str, expires_in: int = 3600) -> str | None:
        encoded_path = quote(path, safe="/")
        url = f"{self.storage_url}/object/sign/{self.settings.supabase_storage_bucket}/{encoded_path}"
        request = Request(
            url,
            data=json.dumps({"expiresIn": expires_in}).encode("utf-8"),
            headers=self._headers(),
            method="POST",
        )
        result = self._request(request)
        signed_path = result.get("signedURL") or result.get("signedUrl") or result.get("signedURL".lower())
        if not signed_path:
            return None
        if str(signed_path).startswith("http"):
            return str(signed_path)
        return f"{self.settings.supabase_url.rstrip('/')}/storage/v1{signed_path}"
