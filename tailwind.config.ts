import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "SF Pro Text",
          "Inter",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: ["SF Mono", "JetBrains Mono", "Fira Code", "monospace"],
      },
      colors: {
        lss: {
          bg:        "#EDE4CC",
          surface:   "#FAF6EE",
          surface2:  "#E8DCC4",
          border:    "#C8B090",
          text:      "#1A0800",
          secondary: "#604428",
          tertiary:  "#9C7850",
          accent:    "#E05818",
          "accent-dim": "rgba(224,88,24,0.15)",
          green:     "#1E7A30",
          red:       "#B82020",
          blue:      "#1850A0",
          purple:    "#6020A0",
          orange:    "#D04800",
          black:     "#0F0800",
        },
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
        "4xl": "32px",
      },
      boxShadow: {
        glass:       "0 2px 16px rgba(80,40,0,0.08), 0 1px 4px rgba(80,40,0,0.06)",
        "glass-lg":  "0 8px 40px rgba(80,40,0,0.14), 0 2px 8px rgba(80,40,0,0.09)",
        accent:      "0 0 20px rgba(224,88,24,0.3)",
        card:        "0 2px 16px rgba(80,40,0,0.08), 0 1px 3px rgba(80,40,0,0.05)",
        "card-hover":"0 8px 40px rgba(80,40,0,0.14), 0 2px 8px rgba(80,40,0,0.09)",
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%":   { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmerBg: {
          "0%":   { backgroundPosition: "200% center" },
          "100%": { backgroundPosition: "-200% center" },
        },
        orbFloat1: {
          "0%,100%": { transform: "translate(0,0) scale(1)" },
          "33%":     { transform: "translate(60px,-40px) scale(1.08)" },
          "66%":     { transform: "translate(-30px,50px) scale(0.95)" },
        },
        orbFloat2: {
          "0%,100%": { transform: "translate(0,0) scale(1)" },
          "40%":     { transform: "translate(-70px,30px) scale(1.1)" },
          "70%":     { transform: "translate(40px,-60px) scale(0.92)" },
        },
        orbFloat3: {
          "0%,100%": { transform: "translate(0,0) scale(1)" },
          "50%":     { transform: "translate(50px,60px) scale(1.06)" },
        },
        pulseGlow: {
          "0%,100%": { opacity: "0.6" },
          "50%":     { opacity: "1" },
        },
        slideRight: {
          "0%":   { opacity: "0", transform: "translateX(-12px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        ticker: {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-up":    "fadeUp 0.55s cubic-bezier(0.4,0,0.2,1) forwards",
        "fade-in":    "fadeIn 0.4s ease forwards",
        "scale-in":   "scaleIn 0.35s cubic-bezier(0.4,0,0.2,1) forwards",
        "orb-1":      "orbFloat1 14s ease-in-out infinite",
        "orb-2":      "orbFloat2 18s ease-in-out infinite",
        "orb-3":      "orbFloat3 22s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2.5s ease-in-out infinite",
        "slide-right":"slideRight 0.4s ease forwards",
        ticker:       "ticker 40s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
