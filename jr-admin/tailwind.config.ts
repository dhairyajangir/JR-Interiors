import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        sand: "#f5efe4",
        mist: "#fffaf1",
        mint: "#0f766e",
        coral: "#dd6b20",
        line: "#d5c7af",
        panel: "#fffdf8",
        steel: "#425466",
      },
      boxShadow: {
        card: "0 20px 60px rgba(17, 24, 39, 0.08)",
        soft: "0 12px 30px rgba(15, 118, 110, 0.12)",
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(17,24,39,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(17,24,39,0.07) 1px, transparent 1px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        serif: ["var(--font-serif)", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
