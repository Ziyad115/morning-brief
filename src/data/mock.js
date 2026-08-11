export const mockBrief = {
  date: "August 6, 2026",
  sentiment: "Uncertain",
  summary: [
    { theme: "Rates & Fed", text: "Markets are pricing in a wait-and-see Fed stance ahead of next week's inflation print; 10-year yields drifted lower overnight." },
    { theme: "Earnings", text: "A wave of mega-cap tech earnings beat on EPS but flagged softer forward guidance, pulling futures slightly lower pre-market." },
    { theme: "Commodities", text: "Oil edged up on renewed Middle East supply concerns; gold held steady near recent highs as a safe-haven hedge." },
    { theme: "Geopolitics", text: "Trade policy headlines continue to add volatility to industrials and semiconductor names tied to export exposure." },
  ],
};

export const mockEvents = [
  { time: "10:00", country: "US", title: "ISM Services PMI", impact: "medium" },
  { time: "12:30", country: "US", title: "Initial Jobless Claims", impact: "low" },
  { time: "16:00", country: "US", title: "Fed Speaker: Governor Waller", impact: "high" },
  { time: "—", country: "SA", title: "TASI Weekly Settlement", impact: "low" },
];

export const mockMovers = {
  gainers: [
    { symbol: "NVDA", changePct: 2.10 },
    { symbol: "AMD", changePct: 1.72 },
  ],
  losers: [
    { symbol: "INTC", changePct: -1.85 },
    { symbol: "BA", changePct: -0.94 },
  ],
};

/**
 * Feature #4 — forward-looking "what to watch" items, distinct from
 * the retrospective brief cards. Replace with real data once the
 * daily summarization job (backend/app/services/summarize.py) is
 * built out to also produce this shape.
 */
export const mockWatchToday = [
  { label: "10Y Treasury auction", detail: "results could move yields sharply either direction at 1pm ET" },
  { label: "CPI print, Thursday", detail: "markets likely to stay range-bound into the print" },
  { label: "NVDA guidance follow-through", detail: "watch for continued reaction across semis after this week's earnings" },
];
