/**
 * Sun/moon toggle switch. Minimal line-icon style, consistent with
 * icons.jsx, rather than an emoji or a generic switch component.
 */
function SunIcon(props) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...props}>
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2.5v2.5M12 19v2.5M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2.5 12H5M19 12h2.5M4.2 19.8L6 18M18 6l1.8-1.8" />
    </svg>
  );
}

function MoonIcon(props) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a7 7 0 1 0 10.5 10.5z" />
    </svg>
  );
}

export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative w-12 h-7 rounded-full bg-white hairline shadow-card hover:shadow-cardHover transition-shadow flex items-center px-1 shrink-0
                 dark:bg-night-soft"
    >
      <span
        className="absolute top-1 left-1 w-5 h-5 rounded-full bg-paper-soft dark:bg-night flex items-center justify-center
                   transition-transform duration-300 text-ink-muted dark:text-dawn-amber"
        style={{ transform: isDark ? "translateX(20px)" : "translateX(0)" }}
      >
        {isDark ? <MoonIcon /> : <SunIcon />}
      </span>
    </button>
  );
}
