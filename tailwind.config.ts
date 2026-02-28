import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      /* ── Art Gallery Color Palette (mapped to CSS variables for theming) ── */
      colors: {
        primary: {
          DEFAULT: "var(--primary)",
          light: "var(--primary-light)",
          dark: "var(--primary-dark)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          warm: "var(--secondary-warm)",
          deep: "var(--secondary-deep)",
        },
        accent: "var(--accent)",
        foreground: "var(--foreground)",
        background: "var(--background)",
        surface: "var(--surface)",
        muted: "var(--muted)",
        error: "var(--error)",
        success: "var(--success)",
        "text-light": "var(--text-light)",
      },
      fontFamily: {
        heading: ["var(--font-playfair)", "Playfair Display", "Cormorant Garamond", "serif"],
        sans: ["var(--font-dm-sans)", "DM Sans", "system-ui", "sans-serif"],
      },
      borderRadius: {
        gallery: "14px",
      },
      /* ── Ensures consistent spacing for touch targets ── */
      minHeight: {
        touch: "48px",
      },
      minWidth: {
        touch: "48px",
      },
    },
  },
  plugins: [],
};
export default config;
