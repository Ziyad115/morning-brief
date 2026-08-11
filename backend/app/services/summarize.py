import json
from datetime import date
from pathlib import Path

CACHE_PATH = Path(__file__).resolve().parents[1] / "cache" / "brief.json"


def fetch_headlines() -> list[str]:
    raise NotImplementedError


def summarize_headlines(headlines: list[str]) -> list[dict]:
    raise NotImplementedError


def run_daily_job():
    headlines = fetch_headlines()
    summary = summarize_headlines(headlines)
    payload = {
        "date": date.today().strftime("%B %d, %Y"),
        "sentiment": "Uncertain",
        "summary": summary,
    }
    CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
    CACHE_PATH.write_text(json.dumps(payload, indent=2))


if __name__ == "__main__":
    run_daily_job()
