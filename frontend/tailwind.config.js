/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#00606e",
          container: "#007b8c",
          light: "#e0f9ff",
          dark: "#004751",
        },
        secondary: {
          DEFAULT: "#00677f",
          container: "#00ccf9",
          fixed: "#b7eaff",
          dim: "#4cd6ff",
        },
        tertiary: {
          DEFAULT: "#4c586b",
          container: "#657085",
        },
        surface: {
          DEFAULT: "#f8f9ff",
          dim: "#cbdbf5",
          bright: "#f8f9ff",
          container: "#e5eeff",
          "container-low": "#eff4ff",
          "container-lowest": "#ffffff",
          "container-high": "#dce9ff",
          "container-highest": "#d3e4fe",
        },
        "on-surface": "#0b1c30",
        "on-surface-variant": "#3e494b",
        outline: {
          DEFAULT: "#6e797c",
          variant: "#bdc8cb",
        },
        error: {
          DEFAULT: "#ba1a1a",
          container: "#ffdad6",
          on: "#93000a",
        },
        risk: {
          low: "#059669",
          moderate: "#d97706",
          high: "#ea580c",
          critical: "#ba1a1a",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        sans: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      fontSize: {
        "display-kpi": ["clamp(2rem, 4vw, 3.5rem)", { lineHeight: "0.95", letterSpacing: "-0.045em", fontWeight: "700" }],
        "page-title": ["clamp(1.5rem, 2.5vw, 2rem)", { lineHeight: "1.1", letterSpacing: "-0.03em", fontWeight: "700" }],
        "section-title": ["1rem", { lineHeight: "1.25", letterSpacing: "-0.015em", fontWeight: "600" }],
        "card-title": ["0.875rem", { lineHeight: "1.35", letterSpacing: "-0.01em", fontWeight: "600" }],
        "body-ui": ["0.875rem", { lineHeight: "1.55", letterSpacing: "0" }],
        "label-ui": ["0.6875rem", { lineHeight: "1.25", letterSpacing: "0.1em", fontWeight: "600" }],
        "data-ui": ["0.75rem", { lineHeight: "1.35", letterSpacing: "0.01em", fontWeight: "500" }],
      },
      borderRadius: {
        sm: "0.125rem",
        DEFAULT: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        full: "9999px",
      },
    },
  },
  plugins: [],
};
