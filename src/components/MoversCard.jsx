import clsx from "clsx";

function Row({ symbol, changePct }) {
  const positive = changePct >= 0;
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm font-medium text-ink">{symbol}</span>
      <span className={clsx("text-sm font-medium", positive ? "text-rise" : "text-fall")}>
        {positive ? "+" : ""}{changePct.toFixed(2)}%
      </span>
    </div>
  );
}

export default function MoversCard({ gainers = [], losers = [] }) {
  return (
    <div className="brief-card">
      <p className="label-caps mb-4">Movers</p>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="text-xs text-ink-faint mb-1">Gainers</p>
          {gainers.map((g) => <Row key={g.symbol} {...g} />)}
        </div>
        <div>
          <p className="text-xs text-ink-faint mb-1">Losers</p>
          {losers.map((l) => <Row key={l.symbol} {...l} />)}
        </div>
      </div>
    </div>
  );
}
