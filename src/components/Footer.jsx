import { LogoMark } from "./Logo.jsx";

export default function Footer() {
  return (
    <footer className="max-w-5xl mx-auto px-6 pt-6 pb-10">
      <div className="flex items-center justify-center gap-2 text-ink-faint dark:text-moon-faint">
        <LogoMark size={20} />
        <span className="text-xs tracking-wide">
          Made by <span className="font-medium text-ink-muted dark:text-moon-muted">Ziyad Alrefaei</span>
        </span>
      </div>
    </footer>
  );
}
