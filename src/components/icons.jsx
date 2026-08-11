/**
 * Minimal line icons, hand-built as inline SVG — replaces emoji
 * (📅 📊 🌏 etc.) which read as generic/AI-templated. These use
 * `currentColor` so they inherit text color and stay in step with
 * the calm, muted palette instead of looking like decoration.
 */

const base = {
  width: 15,
  height: 15,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function CalendarIcon(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18" />
      <path d="M8 3v4M16 3v4" />
    </svg>
  );
}

export function PulseIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M3 12h4l2-7 4 14 2-7h6" />
    </svg>
  );
}

export function GlobeIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}

export function NewsIcon(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="4" width="18" height="16" rx="1.5" />
      <path d="M7 8h10M7 12h10M7 16h6" />
    </svg>
  );
}

export function BankIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M3 10l9-6 9 6" />
      <path d="M5 10v9M9 10v9M15 10v9M19 10v9" />
      <path d="M3 19h18" />
    </svg>
  );
}

export function BriefcaseIcon(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

export function OilDropIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3c3 4 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 3-7 6-11z" />
    </svg>
  );
}

export function FlagIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M5 21V4" />
      <path d="M5 4h13l-3 4 3 4H5" />
    </svg>
  );
}
