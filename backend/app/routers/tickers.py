"""
Unified live quotes for ALL 15 ticker strip symbols — one data source,
fetched via yfinance. This permanently sidesteps TradingView's free
embedded widget, whose licensing restrictions were causing several
symbols (Tadawul, VIX, DXY, US10Y, Russell 2000) to silently break.

GET /api/tickers returns:
  [{
    "symbol": "SPX", "name": "S&P 500", "price": ..., "changePct": ...,
    "stale": bool, "chartUrl": "https://www.tradingview.com/symbols/..."
  }, ...]

`chartUrl` points to each symbol's real TradingView chart page (the
main site works fine for all of these — only the free WIDGET has the
licensing gap) so clicking a ticker on the frontend opens a full chart.

Resilience: disk-persisted "last known good" cache. If a live fetch
fails (e.g. Tadawul outside trading hours), falls back to the last
successful value and marks it "stale": true rather than dropping it.

NaN/Inf guard: yfinance occasionally returns NaN for a symbol's most
recent Close (e.g. a forming, not-yet-settled intraday candle), or a
zero prev_close can produce an Inf percent change. Neither NaN nor
Inf is valid JSON, so FastAPI's JSONResponse raises a ValueError and
the WHOLE endpoint fails for every ticker, not just the bad one. Every
numeric value is now validated with math.isfinite() before being
treated as usable, at both the live-fetch and cached-fallback stages.
"""
import json
import math
import time
from pathlib import Path

from fastapi import APIRouter
import yfinance as yf

router = APIRouter()

CACHE_TTL_SECONDS = 60
_cache = {"data": None, "fetched_at": 0}

LAST_KNOWN_PATH = Path(__file__).resolve().parents[1] / "cache" / "last_known_tickers.json"

# yfinance ticker -> (display symbol, display name, TradingView chart URL)
WATCHLIST = {
    "^GSPC":    ("SPX",    "S&P 500",         "https://www.tradingview.com/symbols/SPX/"),
    "^NDX":     ("NDX",    "Nasdaq 100",      "https://www.tradingview.com/symbols/NASDAQ-NDX/"),
    "^DJI":     ("DJI",    "Dow Jones",       "https://www.tradingview.com/symbols/DJ-DJI/"),
    "^TASI.SR": ("TASI",   "Tadawul (TASI)",  "https://www.tradingview.com/symbols/TADAWUL-TASI/"),
    "BTC-USD":  ("BTC",    "Bitcoin",         "https://www.tradingview.com/symbols/BTCUSD/"),
    "^VIX":     ("VIX",    "VIX",             "https://www.tradingview.com/symbols/CBOE-VIX/"),
    "GC=F":     ("GOLD",   "Gold",            "https://www.tradingview.com/symbols/TVC-GOLD/"),
    "CL=F":     ("OIL",    "WTI Crude Oil",   "https://www.tradingview.com/symbols/USOIL/"),
    "^RUT":     ("RUT",    "Russell 2000",    "https://www.tradingview.com/symbols/CBOEFTSE-RUT/"),
    "DX-Y.NYB": ("DXY",    "US Dollar Index", "https://www.tradingview.com/symbols/TVC-DXY/"),
    "^TNX":     ("US10Y",  "US 10Y Yield",    "https://www.tradingview.com/symbols/TVC-US10Y/"),
    "ETH-USD":  ("ETH",    "Ethereum",        "https://www.tradingview.com/symbols/ETHUSD/"),
    "AAPL":     ("AAPL",   "Apple",           "https://www.tradingview.com/symbols/NASDAQ-AAPL/"),
    "NVDA":     ("NVDA",   "Nvidia",          "https://www.tradingview.com/symbols/NASDAQ-NVDA/"),
    "2222.SR":  ("ARAMCO", "Saudi Aramco",    "https://www.tradingview.com/symbols/TADAWUL-2222/"),
}


def _is_valid_number(x) -> bool:
    return isinstance(x, (int, float)) and math.isfinite(x)


def _load_last_known() -> dict:
    if LAST_KNOWN_PATH.exists():
        try:
            return json.loads(LAST_KNOWN_PATH.read_text())
        except (json.JSONDecodeError, OSError):
            return {}
    return {}


def _save_last_known(entries: dict):
    # Extra safety net: never persist a NaN/Inf value to disk, even
    # though the callers below should already prevent this upstream.
    clean = {
        symbol: entry
        for symbol, entry in entries.items()
        if _is_valid_number(entry.get("price")) and _is_valid_number(entry.get("changePct"))
    }
    LAST_KNOWN_PATH.parent.mkdir(parents=True, exist_ok=True)
    LAST_KNOWN_PATH.write_text(json.dumps(clean, indent=2))


def _fetch_quote(yf_ticker: str):
    try:
        hist = yf.Ticker(yf_ticker).history(period="5d")
        if hist.empty or len(hist) < 2:
            return None
        last_close = float(hist["Close"].iloc[-1])
        prev_close = float(hist["Close"].iloc[-2])

        if not _is_valid_number(last_close) or not _is_valid_number(prev_close) or prev_close == 0:
            return None

        change_pct = ((last_close - prev_close) / prev_close) * 100

        if not _is_valid_number(change_pct):
            return None

        return round(last_close, 2), round(change_pct, 2)
    except Exception:
        return None


def _fetch_all():
    last_known = _load_last_known()
    results = []
    updated_last_known = dict(last_known)

    for yf_ticker, (symbol, name, chart_url) in WATCHLIST.items():
        quote = _fetch_quote(yf_ticker)

        if quote is not None:
            price, change_pct = quote
            results.append({
                "symbol": symbol,
                "name": name,
                "price": price,
                "changePct": change_pct,
                "stale": False,
                "chartUrl": chart_url,
            })
            updated_last_known[symbol] = {
                "name": name,
                "price": price,
                "changePct": change_pct,
                "chartUrl": chart_url,
                "fetched_at": time.time(),
            }
        elif symbol in last_known:
            fallback = last_known[symbol]
            fallback_price = fallback.get("price")
            fallback_change = fallback.get("changePct")

            # Guard against a previously-corrupted cache entry too —
            # don't resurrect a bad NaN value from disk either.
            if _is_valid_number(fallback_price) and _is_valid_number(fallback_change):
                results.append({
                    "symbol": symbol,
                    "name": fallback.get("name", name),
                    "price": fallback_price,
                    "changePct": fallback_change,
                    "stale": True,
                    "chartUrl": fallback.get("chartUrl", chart_url),
                })

    _save_last_known(updated_last_known)
    return results


@router.get("/tickers")
def get_tickers():
    now = time.time()
    if _cache["data"] is not None and (now - _cache["fetched_at"]) < CACHE_TTL_SECONDS:
        return _cache["data"]

    data = _fetch_all()
    _cache["data"] = data
    _cache["fetched_at"] = now
    return data
