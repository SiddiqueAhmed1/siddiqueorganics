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
        // Siddique Organics Brand Identity Colors
        brand: {
          green: "#0E3A24", // Primary Dark Forest Green (Buttons, Titles, Hero Focus)
          leaf: "#3B7A42", // Secondary Medium Leaf Green (Borders, Accents, Hover States)
          brown: "#6C4E31", // Accent Earthy Brown (Price Tags, Tracking Highlights)
          cream: "#F9F8F3", // Background Premium Soft Cream (Whole Website & Header BG)
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
