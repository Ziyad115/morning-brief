/**
 * "What to watch today" — now derived from REAL ticker data instead of
 * static mock text. Surfaces whichever tracked symbols moved most
 * since yesterday's close, framed as things worth watching for
 * continuation or reversal during today's session.
 *
 * This is a lightweight heuristic (biggest movers = worth watching),
 * not an LLM-generated insight — a genuinely predictive "what to
 * watch" would need an actual economic calendar feed (FOMC dates, CPI
 * release dates, etc.) merged in. That's a natural next upgrade once
 * a real calendar API is wired in to replace mock.js's events too.
 */
export default function WatchToday({ tickers = [] }) {
  const sorted = [...tickers].sort(
    (a, b) => Math.abs(b.changePct) - Math.abs(a.changePct)
  );
  const topMovers = sorted.slice(0, 3);

  return (
    <div className="brief-card">
      <p className="label-caps mb-4">What to watch today</p>
      {topMovers.length === 0 ? (
        <p className="text-sm text-ink-muted">No standout movers yet today.</p>
      ) : (
        <ul className="space-y-3">
          {topMovers.map((t) => {
            const positive = t.changePct >= 0;
            return (
              <li key={t.symbol} className="text-sm">
                <span className="font-medium text-ink">{t.name}</span>
                <span className="text-ink-muted">
                  {" "}
                  — {positive ? "up" : "down"} {Math.abs(t.changePct).toFixed(2)}%, watch for{" "}
                  {positive ? "continuation" : "a bounce"} through the session
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
