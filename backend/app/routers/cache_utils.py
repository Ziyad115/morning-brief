"""
Shared TTL cache helper for API routers.

Drop this file in as `app/routers/cache_utils.py` (same folder as
brief.py, tickers.py, calendar.py, earnings.py, overnight.py).

Usage in any router file:

    from .cache_utils import ttl_cache

    @router.get("/tickers")
    @ttl_cache(seconds=120)   # tickers move fast intraday -> short TTL
    def get_tickers():
        ...  # your existing yfinance logic, unchanged
        return data

    @router.get("/calendar")
    @ttl_cache(seconds=3600)  # calendar barely changes intraday -> long TTL
    def get_calendar():
        ...
        return data

That's it — no other code in the route function needs to change.
Each decorated function gets its OWN independent cache slot, keyed by
the function itself, so different TTLs per router are fully isolated.
"""
import time
import functools


def ttl_cache(seconds: int):
    """Cache the return value of a zero-argument route function for
    `seconds`. Thread-safe enough for typical single-process Uvicorn
    workers (WEB_CONCURRENCY=1, as your Render logs show).
    """
    def decorator(func):
        cache = {"data": None, "fetched_at": 0.0}

        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            now = time.time()
            if cache["data"] is not None and (now - cache["fetched_at"]) < seconds:
                return cache["data"]

            data = func(*args, **kwargs)
            cache["data"] = data
            cache["fetched_at"] = now
            return data

        return wrapper
    return decorator
