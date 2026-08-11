import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "morning-brief-theme";

/**
 * Theme state + persistence.
 *
 * Default is always "light" for first-time visitors — deliberately
 * NOT following the OS/browser's prefers-color-scheme setting,
 * since the brand's default identity is the light "morning" theme.
 * Once a user actually toggles, their choice is saved to
 * localStorage and respected on every future visit, overriding this
 * default.
 */
export function useTheme() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
    return "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  return { theme, toggle };
}
