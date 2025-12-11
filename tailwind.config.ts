import type { Config } from "tailwindcss";

const config: Config = {
  // Tailwind v4 with @import "tailwindcss" uses CSS-based configuration
  // See app/globals.css for theme customization using @theme directive
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
};

export default config;
