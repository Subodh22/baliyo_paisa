import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0A0A0B",
        surface: "#111113",
        "surface-alt": "#18181B",
        border: "#1F1F23",
        gold: "#C9A84C",
        "gold-dim": "rgba(201,168,76,0.12)",
        ink: "#F2EEE8",
        mid: "#6B6760",
        dim: "#2A2A2E",
        "green-muted": "#4ADE80",
        "red-muted": "#F87171",
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "monospace"],
        sans: ["'Inter'", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderWidth: {
        px: "1px",
      },
      fontSize: {
        "2xs": ["10px", { lineHeight: "1.5", letterSpacing: "0.08em" }],
      },
    },
  },
  plugins: [],
};
export default config;
