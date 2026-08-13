"use client";

import { useTheme } from "@/lib/theme";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme();
  const dark = theme === "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      className="rounded-2xl border-2 border-b-4 border-line px-3 py-2 text-sm font-extrabold text-fg"
      aria-pressed={dark}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {compact ? (dark ? "Light" : "Dark") : dark ? "Dark mode on" : "Dark mode off"}
    </button>
  );
}
