import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/**/*.{ts,tsx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        base: "#F7F6F2",
        panel: "#FFFFFF",
        sidebar: "#F4F2EB",
        muted: "#EAE7E1",
        heavy: "#D4CECE",
        bronze: "#9C6644",
        gold: "#D4AF37",
        primary: "#1F1F1F",
        secondary: "#737373",
        // status colors
        success: {
          DEFAULT: "hsl(142, 60%, 35%)",
          border: "hsl(142, 60%, 82%)",
          bg: "hsla(142, 60%, 96%, 0.5)",
        },
        warning: {
          DEFAULT: "hsl(38, 92%, 40%)",
          border: "hsl(38, 92%, 82%)",
          bg: "hsla(38, 92%, 96%, 0.5)",
        },
        error: {
          DEFAULT: "hsl(0, 84%, 50%)",
          border: "hsl(0, 84%, 85%)",
          bg: "hsla(0, 84%, 97%, 0.5)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        display: ["var(--font-outfit)", "Outfit", "sans-serif"],
      },
      boxShadow: {
        sm: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.03), 0 2px 4px -2px rgba(0, 0, 0, 0.03), 0 10px 15px -3px rgba(0, 0, 0, 0.05)",
      },
      borderRadius: {
        md: "6px",
      },
    },
  },
  plugins: [],
};

export default config;
