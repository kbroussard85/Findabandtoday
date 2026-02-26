import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        purple: {
          500: "#A855F7",
          600: "#9333EA",
        },
        blue: {
          500: "#3B82F6",
          600: "#2563EB",
        }
      },
    },
  },
  plugins: [],
};
export default config;
