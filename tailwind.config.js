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
        primary: {
          DEFAULT: "#E07A5F",
          hover: "#C96A52",
          light: "#FCEAE7",
        },
        secondary: {
          DEFAULT: "#81B29A",
          hover: "#6A9B82",
          light: "#E8F3ED",
        },
        accent: {
          DEFAULT: "#F2CC8F",
          hover: "#E5BD7A",
        },
        background: {
          primary: "#FFFBF8",
          secondary: "#FFF5EE",
          card: "#FFFFFF",
        },
        foreground: {
          primary: "#3D405B",
          secondary: "#6B6E8A",
          muted: "#9A9CB8",
        },
        border: {
          DEFAULT: "#EDE8E4",
          focus: "#E07A5F",
        },
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
        "3xl": "20px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(61, 64, 91, 0.05)",
        md: "0 4px 12px rgba(61, 64, 91, 0.08)",
        lg: "0 8px 24px rgba(61, 64, 91, 0.12)",
        glow: "0 0 20px rgba(224, 122, 95, 0.2)",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
