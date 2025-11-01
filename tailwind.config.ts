import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: "#0d0d0f",
          light: "#16161a",
          lighter: "#202028"
        },
        accent: {
          DEFAULT: "#4f46e5",
          soft: "#6366f1",
          subtle: "#8b5cf6"
        },
        text: {
          primary: "#f9fafb",
          secondary: "#9ca3af",
          muted: "#6b7280"
        }
      }
    }
  },
  plugins: []
};

export default config;
