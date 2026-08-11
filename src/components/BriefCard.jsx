import { BankIcon, PulseIcon, BriefcaseIcon, OilDropIcon, FlagIcon, NewsIcon } from "./icons.jsx";

const THEME_ICON = {
  "Rates & Fed": BankIcon,
  "Markets": PulseIcon,
  "Earnings": BriefcaseIcon,
  "Commodities": OilDropIcon,
  "Geopolitics": FlagIcon,
};

export default function BriefCard({ theme, headlines = [] }) {
  const Icon = THEME_ICON[theme] || NewsIcon;
  return (
    <div className="brief-card border-l-dawn-coral dark:border-l-dawn-coral">
      <p className="label-caps mb-3 flex items-center gap-1.5 text-ink-faint dark:text-moon-faint">
        <Icon /> {theme}
      </p>
      <ul className="space-y-2">
        {headlines.map((h, i) => (
          <li key={i} className="text-[15px] leading-snug text-ink dark:text-moon">
            {h.link ? (
              <a
                href={h.link}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent dark:hover:text-dawn-amber transition-colors"
              >
                {h.title}
              </a>
            ) : (
              h.title
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
