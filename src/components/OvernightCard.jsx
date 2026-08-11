import clsx from "clsx";
import { GlobeIcon } from "./icons.jsx";

export default function OvernightCard({ markets = [] }) {
  return (
    <div className="brief-card border-l-dawn-violet dark:border-l-dawn-violet">
      <p className="label-caps mb-4 flex items-center gap-1.5 text-ink-faint dark:text-moon-faint">
        <GlobeIcon /> While you were asleep — Asia
      </p>
      {markets.length === 0 ? (
        <p className="text-sm text-ink-muted dark:text-moon-muted">Overnight data unavailable.</p>
      ) : (
        <ul className="space-y-3">
          {markets.map((m) => {
            const positive = m.changePct >= 0;
            return (
              <li key={m.symbol} className="flex items-center justify-between text-sm">
                <span className="text-ink dark:text-moon">{m.name}</span>
                <span className={clsx("font-medium tabular-nums", positive ? "text-rise" : "text-fall")}>
                  {positive ? "+" : ""}
                  {m.changePct.toFixed(2)}%
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
