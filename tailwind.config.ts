import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      /* ── Custom Lavender-based color palette ── */
      colors: {
        primary: {
          DEFAULT: "#B57EDC", // Lavender — main brand color
          light: "#E6E6FA",  // Light lavender for backgrounds/highlights
          dark: "#9B59B6",   // Darker lavender for hover states
        },
        secondary: "#F3F4F6", // Light Gray — cards, secondary backgrounds
        accent: "#1F2937",    // Charcoal — primary text color (WCAG AA on white)
        surface: "#FFFFFF",   // White — page background
        muted: "#6B7280",    // Gray-500 — secondary text, placeholders
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      /* ── Ensures consistent spacing for touch targets ── */
      minHeight: {
        touch: "44px",
      },
      minWidth: {
        touch: "44px",
      },
    },
  },
  plugins: [],
};
export default config;
