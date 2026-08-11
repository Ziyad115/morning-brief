import clsx from "clsx";
import { CalendarIcon } from "./icons.jsx";

const IMPACT_DOT = { high: "bg-fall", medium: "bg-accent", low: "bg-ink-faint dark:bg-moon-faint" };

export default function EventsList({ events = [] }) {
  return (
    <div className="brief-card border-l-dawn-sky dark:border-l-dawn-sky">
      <p className="label-caps mb-4 flex items-center gap-1.5 text-ink-faint dark:text-moon-faint">
        <CalendarIcon /> Upcoming events
      </p>
      {events.length === 0 ? (
        <p className="text-sm text-ink-muted dark:text-moon-muted">No major scheduled events found.</p>
      ) : (
        <ul className="space-y-3">
          {events.map((e, i) => (
            <li key={i} className="flex items-center gap-3 text-sm">
              <span
                className={clsx("w-1.5 h-1.5 rounded-full shrink-0", IMPACT_DOT[e.impact])}
                aria-hidden
              />
              <span className="text-ink-muted dark:text-moon-muted w-20 tabular-nums">
                {new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
              <span className="text-ink dark:text-moon">{e.title}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
