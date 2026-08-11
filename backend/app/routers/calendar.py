"""
Real economic calendar — hardcoded from OFFICIAL published 2026
schedules (Federal Reserve, Bureau of Labor Statistics), since these
dates are set months in advance and don't require a live data feed:
  - FOMC meeting/decision dates: federalreserve.gov
  - CPI release dates: bls.gov/schedule/news_release/cpi.htm
  - Nonfarm Payrolls (jobs report) dates: BLS, first Friday of each
    month (with holiday adjustments)

GET /api/calendar returns the next N upcoming events from today,
sorted chronologically:
  [{ "date": "2026-08-12", "title": "CPI Release (July data)", "impact": "high" }]

Update this list annually — these are the ONLY hardcoded dates in the
whole project, everything else is live-fetched. If OpticOdds or a
paid calendar API is ever wired in, replace this file's static list
with a real feed.
"""
from datetime import datetime, date

from fastapi import APIRouter

router = APIRouter()

EVENTS_2026 = [
    # FOMC decision days (federalreserve.gov)
    {"date": "2026-01-28", "title": "FOMC Rate Decision", "impact": "high"},
    {"date": "2026-03-18", "title": "FOMC Rate Decision + Dot Plot", "impact": "high"},
    {"date": "2026-04-29", "title": "FOMC Rate Decision", "impact": "high"},
    {"date": "2026-06-17", "title": "FOMC Rate Decision + Dot Plot", "impact": "high"},
    {"date": "2026-07-29", "title": "FOMC Rate Decision", "impact": "high"},
    {"date": "2026-09-16", "title": "FOMC Rate Decision + Dot Plot", "impact": "high"},
    {"date": "2026-10-28", "title": "FOMC Rate Decision", "impact": "high"},
    {"date": "2026-12-09", "title": "FOMC Rate Decision + Dot Plot", "impact": "high"},
    # CPI releases (bls.gov)
    {"date": "2026-01-13", "title": "CPI Release (Dec data)", "impact": "high"},
    {"date": "2026-02-13", "title": "CPI Release (Jan data)", "impact": "high"},
    {"date": "2026-03-11", "title": "CPI Release (Feb data)", "impact": "high"},
    {"date": "2026-04-10", "title": "CPI Release (Mar data)", "impact": "high"},
    {"date": "2026-05-12", "title": "CPI Release (Apr data)", "impact": "high"},
    {"date": "2026-06-10", "title": "CPI Release (May data)", "impact": "high"},
    {"date": "2026-07-14", "title": "CPI Release (Jun data)", "impact": "high"},
    {"date": "2026-08-12", "title": "CPI Release (Jul data)", "impact": "high"},
    {"date": "2026-09-11", "title": "CPI Release (Aug data)", "impact": "high"},
    {"date": "2026-10-14", "title": "CPI Release (Sep data)", "impact": "high"},
    {"date": "2026-11-10", "title": "CPI Release (Oct data)", "impact": "high"},
    {"date": "2026-12-10", "title": "CPI Release (Nov data)", "impact": "high"},
    # Nonfarm Payrolls / jobs report (BLS)
    {"date": "2026-04-03", "title": "Nonfarm Payrolls", "impact": "medium"},
    {"date": "2026-05-08", "title": "Nonfarm Payrolls", "impact": "medium"},
    {"date": "2026-06-05", "title": "Nonfarm Payrolls", "impact": "medium"},
    {"date": "2026-07-02", "title": "Nonfarm Payrolls", "impact": "medium"},
    {"date": "2026-08-07", "title": "Nonfarm Payrolls", "impact": "medium"},
    {"date": "2026-09-04", "title": "Nonfarm Payrolls", "impact": "medium"},
    {"date": "2026-10-02", "title": "Nonfarm Payrolls", "impact": "medium"},
    {"date": "2026-11-06", "title": "Nonfarm Payrolls", "impact": "medium"},
    {"date": "2026-12-04", "title": "Nonfarm Payrolls", "impact": "medium"},
]

LOOKAHEAD_COUNT = 5


@router.get("/calendar")
def get_calendar():
    today = date.today()
    upcoming = [
        e for e in EVENTS_2026
        if datetime.strptime(e["date"], "%Y-%m-%d").date() >= today
    ]
    upcoming.sort(key=lambda e: e["date"])
    return upcoming[:LOOKAHEAD_COUNT]
