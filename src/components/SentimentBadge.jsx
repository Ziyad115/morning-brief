import clsx from "clsx";

const STYLES = {
  Bullish: "bg-rise-soft text-rise",
  Bearish: "bg-fall-soft text-fall",
  Uncertain: "bg-paper-soft text-ink-muted",
  Neutral: "bg-paper-soft text-ink-muted",
};

export default function SentimentBadge({ sentiment = "Uncertain" }) {
  return (
    <span className={clsx("inline-flex items-center px-3 py-1 rounded-full text-xs font-medium", STYLES[sentiment] || STYLES.Neutral)}>
      {sentiment}
    </span>
  );
}
