import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        feather: "#58CC02",
        mask: "#89E219",
        macaw: "#1CB0F6",
        cardinal: "#FF4B4B",
        bee: "#FFC800",
        fox: "#FF9600",
        beetle: "#CE82FF",
        eel: "#4B4B4B",
        hare: "#AFAFAF",
        wolf: "#777777",
        swan: "#E5E5E5",
        snow: "#FFFFFF",
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        fg: "var(--color-fg)",
        muted: "var(--color-muted)",
        line: "var(--color-line)",
        hover: "var(--color-hover)",
        select: "var(--color-select)",
        ok: "var(--color-ok)",
        bad: "var(--color-bad)",
      },
      fontFamily: {
        display: ["Varela Round", "system-ui", "sans-serif"],
        sans: ["Nunito", "system-ui", "sans-serif"],
      },
      boxShadow: {
        bump: "0 4px 0 0 #46A302",
        "bump-blue": "0 4px 0 0 #1899D6",
        "bump-red": "0 4px 0 0 #EA2B2B",
        "bump-gray": "0 4px 0 0 #AFAFAF",
      },
    },
  },
  plugins: [],
};

export default config;
