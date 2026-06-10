from collections import defaultdict, deque
from time import monotonic

from fastapi import Depends, HTTPException, Request, status

from app.core.config import Settings, get_settings

_hits: dict[str, deque[float]] = defaultdict(deque)


def rate_limit(request: Request, settings: Settings = Depends(get_settings)) -> None:
    key = request.headers.get("x-forwarded-for", request.client.host if request.client else "unknown").split(",")[0].strip()
    now = monotonic()
    bucket = _hits[key]
    while bucket and now - bucket[0] > 60:
        bucket.popleft()
    if len(bucket) >= settings.rate_limit_per_minute:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Rate limit exceeded")
    bucket.append(now)
