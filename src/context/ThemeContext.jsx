import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);

function initialTheme() {
  const fromUrl = new URLSearchParams(window.location.search).get("theme"); // handy for demos: ?theme=night
  if (fromUrl === "day" || fromUrl === "night") return fromUrl;
  try {
    const saved = localStorage.getItem("theme");
    if (saved === "day" || saved === "night") return saved;
  } catch { /* storage can be blocked (private mode): fall through */ }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "night" : "day";
}

/** Holds "day" | "night" for the whole app and mirrors it onto <html data-theme>. */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(initialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem("theme", theme); } catch { /* ignore */ }
  }, [theme]);

  // useMemo so consumers only re-render when the theme actually changes
  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme: () => setTheme((t) => (t === "night" ? "day" : "night")) }),
    [theme]
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
