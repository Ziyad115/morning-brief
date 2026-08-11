/**
 * Shared brand mark — a small sunrise/peak glyph (rays over a rising
 * line), used at header wordmark size and reused at footer size.
 * Uses currentColor so it inherits the amber accent in the header
 * and the muted footer tone automatically.
 */
export function LogoMark({ size = 22, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.2" opacity="0.35" />
      <path d="M6.5 13.5L10 6.5L13.5 13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="11" r="1" fill="currentColor" />
    </svg>
  );
}

/**
 * Full wordmark: mark + "Morning Brief" text. Amber in light mode
 * (matches the dawn palette), warm gold in dark mode to stay legible
 * and on-brand against the navy background.
 */
export default function Logo({ className = "" }) {
  return (
    <div className={`flex items-center gap-1.5 text-dawn-amber dark:text-dawn-amber ${className}`}>
      <LogoMark />
      <span className="text-[15px] font-semibold tracking-tightish text-ink dark:text-moon">
        Morning<span className="text-dawn-amber"> Brief</span>
      </span>
    </div>
  );
}
