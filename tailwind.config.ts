import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      colors: {
        // Warm zinc palette — all tones shifted to have subtle golden/olive undertone
        zinc: {
          "50":  "#f9f8f5",
          "100": "#f3f1ed",
          "200": "#e8e4dc",
          "300": "#d2cec5",
          "400": "#a8a49b",
          "500": "#797470",
          "600": "#5d5a56",
          "700": "#44413e",
          "800": "#2d2b28",
          "900": "#1e1c18",
          "950": "#131110",
        },
        // Pure white → warm surface
        white: "#faf8f4",
        // Amber stays warm (used for streaks)
        amber: {
          "50":  "#fffbeb",
          "100": "#fef3c7",
          "200": "#fde68a",
          "300": "#fcd34d",
          "400": "#fbbf24",
          "500": "#f59e0b",
          "600": "#d97706",
          "700": "#b45309",
          "800": "#92400e",
          "900": "#78350f",
        },
        // Forest green — pods growth theme
        forest: {
          "50":  "#f0f7f1",
          "100": "#dbeee0",
          "200": "#b8ddc4",
          "300": "#88c49f",
          "400": "#52a577",
          "500": "#30875a",
          "600": "#226c47",
          "700": "#1c573a",
          "800": "#184630",
          "900": "#143a28",
          "950": "#0b2016",
        },
        // Parchment surface for backgrounds
        parchment: "#ede9df",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        "soft":       "0 20px 40px -15px rgba(28,23,18,0.1)",
        "softer":     "0 8px 24px -8px rgba(28,23,18,0.06)",
        "card":       "0 1px 3px 0 rgba(28,23,18,0.04), 0 8px 24px -8px rgba(28,23,18,0.08)",
        "card-hover": "0 4px 6px -2px rgba(28,23,18,0.05), 0 16px 40px -8px rgba(28,23,18,0.12)",
        "amber":      "0 8px 24px -4px rgba(245,158,11,0.35)",
        "forest":     "0 8px 24px -4px rgba(48,135,90,0.3)",
        "inner-sm":   "inset 0 1px 0 rgba(255,255,255,0.08)",
      },
      animation: {
        "fade-up":    "fadeUp 0.55s cubic-bezier(0.16,1,0.3,1) forwards",
        "fade-in":    "fadeIn 0.4s cubic-bezier(0.16,1,0.3,1) forwards",
        "pulse-slow": "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        "slide-in":   "slideIn 0.45s cubic-bezier(0.16,1,0.3,1) forwards",
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%":   { opacity: "0", transform: "translateX(-8px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
      transitionTimingFunction: {
        "spring": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
}

export default config
