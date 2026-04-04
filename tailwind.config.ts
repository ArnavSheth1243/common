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
        /* ─── Semantic tokens (CSS var driven) ─── */
        border:      "hsl(var(--border))",
        input:       "hsl(var(--input))",
        ring:        "hsl(var(--ring))",
        background:  "hsl(var(--background))",
        foreground:  "hsl(var(--foreground))",
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT:    "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },

        /* ─── Extended palette (direct use for badges, avatars, etc.) ─── */
        // Warm zinc — shifted with golden undertone
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
        parchment: "#ede9df",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "xl":  "var(--radius)",       /* 12px */
        "2xl": "1rem",                /* 16px */
        "3xl": "1.5rem",
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        "1":    "0 1px 2px rgba(26,24,20,0.04)",
        "2":    "0 4px 12px rgba(26,24,20,0.08)",
        "3":    "0 8px 24px rgba(26,24,20,0.12)",
        /* Keep legacy names for backward compat during migration */
        "soft":       "0 20px 40px -15px rgba(28,23,18,0.1)",
        "softer":     "0 1px 2px rgba(26,24,20,0.04)",
        "card":       "0 4px 12px rgba(26,24,20,0.08)",
        "card-hover": "0 8px 24px rgba(26,24,20,0.12)",
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
  plugins: [require("tailwindcss-animate")],
}

export default config
