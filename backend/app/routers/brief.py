"""
Daily news brief — pulls live headlines via yfinance's built-in news
feed, ranks them by RECENCY and RELEVANCE rather than just keyword
matching, and surfaces the handful that most likely matter for
understanding "why did the market move today" — not just any headline
that happens to contain a keyword.

Ranking logic:
  1. Recency — headlines from the last 18 hours score higher (a
     3-day-old "1 Software Stock to Own for Decades" listicle shouldn't
     outrank this morning's Fed commentary).
  2. Source breadth — a headline appearing across MULTIPLE tracked
     tickers' news feeds (i.e. broad market relevance) scores higher
     than one that only showed up under a single obscure ticker.
  3. Theme keyword match — still used to group into sections, but no
     longer the only signal for what counts as "important."

This is a heuristic, not true AI summarization — it can't tell you
WHY something matters, only surface headlines more likely to be
market-moving. A genuine upgrade path is feeding the top-ranked
headlines into an LLM call to write real analysis; that requires an
API key this version deliberately avoids needing.

GET /api/brief returns:
  { "date": "...", "summary": [{ "theme": ..., "headlines": [...] }] }
"""
import re
import time
from datetime import datetime, timezone
from collections import defaultdict

from fastapi import APIRouter
import yfinance as yf

router = APIRouter()

CACHE_TTL_SECONDS = 900
_cache = {"data": None, "fetched_at": 0}

NEWS_SOURCE_TICKERS = [
    "^GSPC", "^NDX", "^TNX", "GC=F", "CL=F", "AAPL", "NVDA", "^VIX",
    "2222.SR", "^TASI.SR",
]

THEME_KEYWORDS = {
    "Rates & Fed": ["fed", "federal reserve", "rate", "interest rate", "powell", "fomc", "inflation", "cpi", "yield", "treasury"],
    "Earnings": ["earnings", "eps", "revenue", "guidance", "quarterly", "beat", "miss", "results"],
    "Capital Markets": ["ipo", "initial public offering", "acquisition", "merger", "acquires", "bond issuance", "debt offering", "takeover", "buyout", "spac", "aramco", "saudi", "tadawul"],
    "Commodities": ["oil", "gold", "crude", "opec", "commodity", "gas", "barrel"],
    "Geopolitics": ["trade", "tariff", "china", "sanction", "war", "geopolitic", "export", "conflict"],
    "Markets": ["stocks", "dow", "s&p", "nasdaq", "wall street", "market", "futures", "rally", "selloff"],
    "GCC / Middle East": ["aramco", "saudi", "tadawul", "gcc", "uae", "abu dhabi", "dubai", "qatar", "opec+", "riyadh"],
}

# Per-theme minimum score to appear in the summary. Themes not listed default
# to 0 (any positive-scoring match qualifies, as before). Themes prone to
# noisy/marginal keyword matches get a stricter bar so they stay empty and
# hidden on quiet days instead of surfacing weak matches.
MIN_SCORE_BY_THEME = {
    "Capital Markets": 8,
}

# Rates & Fed and Markets are the two "fast scan" cards. They're capped
# together (rather than each getting its own independent MAX_PER_THEME
# budget) so the combined macro-pulse portion of the brief stays scannable
# in well under 90 seconds. MAX_PER_THEME still applies to each individually
# on top of this, and every other theme's MAX_PER_THEME budget is unchanged.
COMBINED_CAP_THEMES = {"Rates & Fed", "Markets"}
COMBINED_CAP_LIMIT = 6

# Low-value content that should never make the cut, regardless of score:
# content-farm listicles ("7 Stocks to Buy Now"), promotional/sponsored
# placements, and opinion/"should you buy" pieces that aren't news.
_LOW_VALUE_PATTERN = re.compile(
    r"stocks? to buy"
    r"|best stocks?"
    r"|top picks"
    r"|stocks? to own"
    r"|^\s*\d+\s+stocks?\b"
    r"|\bsponsored\b"
    r"|partner content"
    r"|presented by"
    r"|^\s*opinion\s*[:\-]"
    r"|\bop-ed\b"
    r"|should you buy"
    r"|is it (?:a|the) buy"
    r"|here'?s why"
    r"|reasons to (?:buy|sell)",
    re.IGNORECASE,
)

# Headline keywords treated as high-signal macro topics — rates/inflation,
# major indices, oil, USD, and mega-cap names — scored as a boost on top of
# (not instead of) theme classification, so e.g. a Fed headline that also
# moves the S&P doesn't just tie with any other "Rates & Fed" match.
_MACRO_SIGNAL_KEYWORDS = [
    "fed", "federal reserve", "fomc", "powell", "interest rate", "rate cut", "rate hike",
    "inflation", "cpi", "treasury yield",
    "s&p 500", "nasdaq", "dow jones", "russell 2000",
    "oil", "crude", "opec", "brent",
    "dollar", "usd", "dxy",
    "apple", "nvidia", "microsoft", "amazon", "alphabet", "meta platforms", "tesla",
]
MACRO_SIGNAL_BOOST = 4

# Recognizable financial press gets a credibility boost. Confirmed via
# yfinance's underlying Yahoo "content platform" news schema:
# item["content"]["provider"]["displayName"].
_TOP_TIER_PUBLISHERS = ["reuters", "bloomberg", "wall street journal", "wsj", "financial times", "cnbc"]
PUBLISHER_BOOST = 3

RECENCY_WINDOW_HOURS = 18
MAX_PER_THEME = 4


def _is_low_value_content(title: str) -> bool:
    return bool(_LOW_VALUE_PATTERN.search(title))


def _has_macro_signal(title: str) -> bool:
    title_lower = title.lower()
    return any(kw in title_lower for kw in _MACRO_SIGNAL_KEYWORDS)


def _is_top_tier_publisher(publisher: str) -> bool:
    if not publisher:
        return False
    publisher_lower = publisher.lower()
    return any(name in publisher_lower for name in _TOP_TIER_PUBLISHERS)


def _classify(title: str):
    title_lower = title.lower()
    matches = []
    for theme, keywords in THEME_KEYWORDS.items():
        if any(kw in title_lower for kw in keywords):
            matches.append(theme)
    return matches


def _fetch_raw_headlines():
    """Collect headlines with metadata needed for ranking: which
    tickers surfaced it (breadth) and how recent it is."""
    headline_map = {}  # title -> {link, pubDate, tickers: set()}

    for ticker in NEWS_SOURCE_TICKERS:
        try:
            items = yf.Ticker(ticker).news or []
        except Exception:
            continue
        for item in items:
            content = item.get("content", item)
            title = content.get("title") or item.get("title")
            if not title or _is_low_value_content(title):
                continue
            link = content.get("canonicalUrl", {}).get("url") or item.get("link")
            pub_date_raw = content.get("pubDate") or item.get("providerPublishTime")

            provider = content.get("provider") or content.get("publisher")
            if isinstance(provider, dict):
                publisher = provider.get("displayName") or provider.get("name") or ""
            elif isinstance(provider, str):
                publisher = provider
            else:
                publisher = ""

            pub_dt = None
            if isinstance(pub_date_raw, str):
                try:
                    pub_dt = datetime.fromisoformat(pub_date_raw.replace("Z", "+00:00"))
                except ValueError:
                    pub_dt = None
            elif isinstance(pub_date_raw, (int, float)):
                pub_dt = datetime.fromtimestamp(pub_date_raw, tz=timezone.utc)

            if title not in headline_map:
                headline_map[title] = {"title": title, "link": link, "pub_dt": pub_dt, "tickers": set(), "publisher": publisher}
            elif publisher and not headline_map[title]["publisher"]:
                headline_map[title]["publisher"] = publisher
            headline_map[title]["tickers"].add(ticker)

    return list(headline_map.values())


def _score(headline):
    score = 0.0
    has_breadth = len(headline["tickers"]) > 1

    if headline["pub_dt"]:
        age_hours = (datetime.now(timezone.utc) - headline["pub_dt"]).total_seconds() / 3600
        if age_hours <= RECENCY_WINDOW_HOURS:
            score += (RECENCY_WINDOW_HOURS - age_hours) / RECENCY_WINDOW_HOURS * 10
    elif has_breadth:
        score += 1  # unknown date, tightened from a flat +2 — only credited when breadth corroborates it
    else:
        score -= 5  # unknown date AND no corroborating breadth — likely stale/low-quality, keep it out

    score += len(headline["tickers"]) * 3  # breadth across tracked tickers

    if _has_macro_signal(headline["title"]):
        score += MACRO_SIGNAL_BOOST  # rates/inflation/major indices/oil/USD/mega-cap

    if _is_top_tier_publisher(headline.get("publisher", "")):
        score += PUBLISHER_BOOST  # Reuters/Bloomberg/WSJ/FT/CNBC

    return score


def _build_summary(headlines):
    scored = [(h, _score(h)) for h in headlines]
    scored.sort(key=lambda pair: pair[1], reverse=True)

    grouped = defaultdict(list)
    combined_cap_count = 0
    for h, s in scored:
        themes = _classify(h["title"])
        for theme in themes:
            if s < MIN_SCORE_BY_THEME.get(theme, 0):
                continue
            if theme in COMBINED_CAP_THEMES and combined_cap_count >= COMBINED_CAP_LIMIT:
                continue
            if len(grouped[theme]) < MAX_PER_THEME:
                grouped[theme].append({"title": h["title"], "link": h["link"]})
                if theme in COMBINED_CAP_THEMES:
                    combined_cap_count += 1

    theme_order = [
        "Rates & Fed", "Markets", "Earnings", "Capital Markets",
        "Commodities", "Geopolitics", "GCC / Middle East",
    ]
    summary = []
    for theme in theme_order:
        if grouped[theme]:
            summary.append({"theme": theme, "headlines": grouped[theme]})
    return summary


def _fetch_all():
    headlines = _fetch_raw_headlines()
    summary = _build_summary(headlines)
    return {
        "date": datetime.now().strftime("%B %d, %Y"),
        "summary": summary,
    }


@router.get("/brief")
def get_brief():
    now = time.time()
    if _cache["data"] is not None and (now - _cache["fetched_at"]) < CACHE_TTL_SECONDS:
        return _cache["data"]

    data = _fetch_all()
    _cache["data"] = data
    _cache["fetched_at"] = now
    return data
