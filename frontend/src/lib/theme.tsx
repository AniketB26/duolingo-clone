"use client";

import { createContext, useContext, useEffect, useState, useSyncExternalStore } from "react";

export type Theme = "light" | "dark";
const KEY = "lingo-theme";

function readTheme(): Theme {
  try {
    return localStorage.getItem(KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

const ThemeContext = createContext<{ theme: Theme; setTheme: (t: Theme) => void }>({
  theme: "light",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    const next = readTheme();
    setThemeState(next);
    applyTheme(next);
  }, []);

  function setTheme(next: Theme) {
    setThemeState(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* ignore */
    }
    applyTheme(next);
  }

  return <ThemeContext.Provider value={{ theme: mounted ? theme : "light", setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
