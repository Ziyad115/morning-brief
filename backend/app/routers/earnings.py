"""
Earnings calendar — scoped to your watchlist. Tries THREE different
yfinance data paths since earnings-date coverage is notoriously
inconsistent across tickers and library versions:
  1. get_earnings_dates() — richer, but frequently empty
  2. .calendar dict — sometimes populated when #1 isn't
  3. .info["earningsTimestamp"] — a third fallback, Unix timestamp

TEMPORARY: watchlist widened to include MSFT and GOOGL — both have
very reliable earnings-date coverage on yfinance, so if THESE also
come back empty, that tells us the mechanism itself (not just AAPL/
NVDA/Aramco specifically) needs a different data source entirely.

GET /api/earnings returns:
  [{ "symbol": ..., "name": ..., "date": "2026-08-12" }]
"""
from datetime import datetime

from fastapi import APIRouter
import yfinance as yf

from .cache_utils import ttl_cache

router = APIRouter()

EARNINGS_WATCHLIST = {
    "AAPL": "Apple",
    "NVDA": "Nvidia",
    "2222.SR": "Saudi Aramco",
    "MSFT": "Microsoft",
    "GOOGL": "Alphabet",
}


def _next_earnings_date(ticker: str):
    t = yf.Ticker(ticker)

    try:
        df = t.get_earnings_dates(limit=12)
        if df is not None and not df.empty:
            now = datetime.now(df.index.tz) if df.index.tz else datetime.now()
            upcoming = df[df.index >= now]
            if not upcoming.empty:
                return upcoming.index[0].strftime("%Y-%m-%d")
    except Exception:
        pass

    try:
        cal = t.calendar
        if cal and "Earnings Date" in cal:
            dates = cal["Earnings Date"]
            if isinstance(dates, list) and len(dates) > 0:
                d = dates[0]
                return d.strftime("%Y-%m-%d") if hasattr(d, "strftime") else str(d)
    except Exception:
        pass

    try:
        info = t.info
        ts = info.get("earningsTimestamp") or info.get("earningsTimestampStart")
        if ts:
            return datetime.fromtimestamp(ts).strftime("%Y-%m-%d")
    except Exception:
        pass

    return None


@router.get("/earnings")
@ttl_cache(seconds=3600)
def get_earnings():
    results = []
    for ticker, name in EARNINGS_WATCHLIST.items():
        date = _next_earnings_date(ticker)
        if date:
            results.append({"symbol": ticker.replace(".SR", ""), "name": name, "date": date})
    results.sort(key=lambda x: x["date"])
    return results
