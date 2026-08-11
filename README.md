# Morning Brief — Finance Dashboard Scaffold

A calm, low-clutter dashboard you read once in the morning to get a sense
of the market: a quiet ticker strip, theme-grouped news briefs, today's
key economic events, and top movers.

## Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: FastAPI (`/api/brief`, `/api/tickers`, `/api/calendar`)
- Daily job: `backend/app/services/summarize.py`

## Ticker strip (15 symbols, TradingView free widget limit)
S&P 500, Nasdaq 100, Dow Jones, TASI, Bitcoin, VIX, Gold, WTI Crude Oil,
Russell 2000, US Dollar Index, US 10Y Yield, Ethereum, Apple, Nvidia,
Saudi Aramco.

## How to run

### 1. Unzip this file
Double-click the zip (or `unzip morning-brief-scaffold.zip` in a terminal).
You'll get a folder called `finance-dashboard`.

### 2. Frontend
```bash
cd finance-dashboard
npm install
npm run dev
```
Open http://localhost:5173 — renders instantly with mock data.

### 3. Backend (optional at first)
```bash
cd finance-dashboard/backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 4. Wiring real data (do this later)
1. Fill in `fetch_headlines()` / `summarize_headlines()` in
   `backend/app/services/summarize.py`.
2. Replace placeholder logic in `routers/tickers.py`.
3. Point `routers/calendar.py` at a real economic calendar feed.
4. Swap mock imports in `src/pages/Dashboard.jsx` for `src/services/api.js`.

## Design language
Warm off-white background, charcoal text, one muted accent color,
restrained rise/fall colors (no neon red/green), generous whitespace,
a handful of large cards instead of a dense widget grid.
