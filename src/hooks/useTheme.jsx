import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "morning-brief-theme";

/**
 * Theme state + persistence. Respects the user's saved preference
 * across visits (localStorage), falling back to system preference
 * (prefers-color-scheme) on first load if nothing's saved yet.
 *
 * Applies/removes the `dark` class on <html>, which is what all the
 * `html.dark ...` CSS rules and Tailwind's `dark:` variants key off.
 */
export function useTheme() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
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
