from dataclasses import dataclass
import json
from time import time
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import urlopen

import jwt
from fastapi import Depends, Header, HTTPException, Request, status
from jwt import InvalidAudienceError, InvalidIssuerError, InvalidSignatureError, PyJWK, PyJWTError

from app.core.config import Settings, get_settings


@dataclass(frozen=True)
class AuthUser:
    id: str
    email: str | None
    token: str


_jwks_cache: dict[str, dict[str, Any]] = {}


def _bearer_token(authorization: str | None) -> str:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")
    return authorization.split(" ", 1)[1].strip()


def _load_jwks(settings: Settings) -> dict[str, Any]:
    jwks_url = settings.jwks_url
    if not jwks_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Supabase JWKS URL is not configured. Set SUPABASE_URL or SUPABASE_JWKS_URL.",
        )

    cached = _jwks_cache.get(jwks_url)
    now = time()
    if cached and now - float(cached["loaded_at"]) < settings.supabase_jwks_cache_seconds:
        return cached["jwks"]

    try:
        with urlopen(jwks_url, timeout=5) as response:
            jwks = json.loads(response.read().decode("utf-8"))
    except HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Unable to fetch Supabase JWKS: HTTP {exc.code}",
        ) from exc
    except URLError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Unable to fetch Supabase JWKS: {exc.reason}",
        ) from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Supabase JWKS response is not valid JSON") from exc

    keys = jwks.get("keys")
    if not isinstance(keys, list) or not keys:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Supabase JWKS contains no public keys")

    _jwks_cache[jwks_url] = {"loaded_at": now, "jwks": jwks}
    return jwks


def _public_key_for_token(token: str, settings: Settings) -> tuple[Any, str]:
    try:
        header = jwt.get_unverified_header(token)
    except PyJWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid JWT header") from exc

    kid = header.get("kid")
    alg = header.get("alg")
    if not isinstance(kid, str):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="JWT header is missing key id")
    if alg not in {"ES256", "RS256"}:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Unsupported JWT signing algorithm: {alg}")

    jwks = _load_jwks(settings)
    for jwk in jwks["keys"]:
        if jwk.get("kid") == kid:
            return PyJWK.from_dict(jwk).key, alg

    _jwks_cache.pop(settings.jwks_url, None)
    jwks = _load_jwks(settings)
    for jwk in jwks["keys"]:
        if jwk.get("kid") == kid:
            return PyJWK.from_dict(jwk).key, alg

    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="JWT signing key was not found in Supabase JWKS")


def _decode_supabase_token(token: str, settings: Settings) -> dict[str, Any]:
    key, algorithm = _public_key_for_token(token, settings)
    try:
        return jwt.decode(
            token,
            key=key,
            algorithms=[algorithm],
            audience=settings.supabase_jwt_audience,
            issuer=settings.jwt_issuer or None,
            options={"require": ["exp", "sub"]},
        )
    except InvalidAudienceError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="JWT audience is invalid") from exc
    except InvalidIssuerError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="JWT issuer is invalid") from exc
    except InvalidSignatureError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="JWT signature verification failed") from exc
    except PyJWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid JWT: {exc}") from exc


def get_current_user(
    request: Request,
    authorization: str | None = Header(default=None),
    settings: Settings = Depends(get_settings),
) -> AuthUser:
    token = _bearer_token(authorization)
    payload = _decode_supabase_token(token, settings)

    user_id = payload.get("sub")
    if not isinstance(user_id, str):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token subject")

    request.state.user_id = user_id
    email = payload.get("email")
    return AuthUser(id=user_id, email=email if isinstance(email, str) else None, token=token)
