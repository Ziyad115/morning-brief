"""
Overnight Asia session recap — since KSA mornings begin after Asian
markets have already closed for the day (and while US markets are
still closed too), this is the genuinely "new since you slept"
information a US-only ticker feed misses entirely.

GET /api/overnight returns:
  [{ "symbol": "N225", "name": "Nikkei 225", "price": ..., "changePct": ... }]
"""
from fastapi import APIRouter
import yfinance as yf

from .cache_utils import ttl_cache

router = APIRouter()

WATCHLIST = {
    "^N225": ("N225", "Nikkei 225 (Japan)"),
    "^HSI": ("HSI", "Hang Seng (Hong Kong)"),
    "000001.SS": ("SHCOMP", "Shanghai Composite"),
    "^KS11": ("KOSPI", "KOSPI (South Korea)"),
}


def _fetch_quote(yf_ticker: str):
    try:
        hist = yf.Ticker(yf_ticker).history(period="5d")
        if hist.empty or len(hist) < 2:
            return None
        last_close = float(hist["Close"].iloc[-1])
        prev_close = float(hist["Close"].iloc[-2])
        change_pct = ((last_close - prev_close) / prev_close) * 100
        return round(last_close, 2), round(change_pct, 2)
    except Exception:
        return None


def _fetch_all():
    results = []
    for yf_ticker, (symbol, name) in WATCHLIST.items():
        quote = _fetch_quote(yf_ticker)
        if quote is None:
            continue
        price, change_pct = quote
        results.append({"symbol": symbol, "name": name, "price": price, "changePct": change_pct})
    return results


@router.get("/overnight")
@ttl_cache(seconds=600)
def get_overnight():
    return _fetch_all()
