import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#7C3AED", foreground: "#fff" },
        accent: { DEFAULT: "#3B82F6", foreground: "#fff" },
        surface: { DEFAULT: "#0F0F1A", card: "#161625", border: "#2A2A3D" },
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%)",
        "glass": "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
      },
      animation: {
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "slide-in": "slideIn 0.3s ease-out",
      },
      keyframes: {
        slideIn: { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
      },
      borderRadius: { lg: "12px", xl: "16px", "2xl": "20px" },
    },
  },
  plugins: [require("@tailwindcss/typography")],
} satisfies Config;
