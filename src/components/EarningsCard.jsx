import { BriefcaseIcon } from "./icons.jsx";

export default function EarningsCard({ earnings = [] }) {
  return (
    <div className="brief-card border-l-dawn-amber dark:border-l-dawn-amber">
      <p className="label-caps mb-4 flex items-center gap-1.5 text-ink-faint dark:text-moon-faint">
        <BriefcaseIcon /> Upcoming earnings
      </p>
      {earnings.length === 0 ? (
        <p className="text-sm text-ink-muted dark:text-moon-muted">
          No earnings dates found for your tracked names.
        </p>
      ) : (
        <ul className="space-y-3">
          {earnings.map((e) => (
            <li key={e.symbol} className="flex items-center justify-between text-sm">
              <span className="text-ink dark:text-moon font-medium">{e.name}</span>
              <span className="text-ink-muted dark:text-moon-muted tabular-nums">
                {new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
