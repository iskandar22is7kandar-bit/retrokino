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
        cinema: {
          950: "#F1E9D2",
          900: "#EAE0C6",
          800: "#E6DAC0",
          750: "#E2D4B8",
          700: "#DECCAF",
          650: "#D9C9A8",
          600: "#D4C4A0",
          500: "#CABB96",
          400: "#C0B08A",
          300: "#B0A07A",
          200: "#9A8A68",
          100: "#764838",
        },
        gold: {
          DEFAULT: "#D9A441",
          light:   "#F0C56A",
          dim:     "#A07830",
          subtle:  "#7A5A20",
          50:      "#FDF8EE",
          100:     "#FAF0D0",
          200:     "#F5E0A0",
          300:     "#F0C56A",
          400:     "#D9A441",
          500:     "#B8852A",
          600:     "#A07830",
          700:     "#7A5A20",
          800:     "#543C12",
          900:     "#2E2008",
        },
      },
      fontFamily: {
        display: ["'Cinzel'", "'Playfair Display'", "Georgia", "serif"],
        body:    ["'Inter'", "-apple-system", "sans-serif"],
        mono:    ["'VCR OSD Mono'", "'Courier New'", "monospace"],
        serif:   ["'Playfair Display'", "Georgia", "serif"],
      },
      backgroundImage: {
        "cinema-gradient": "linear-gradient(135deg, #F1E9D2 0%, #EAE0C6 50%, #F1E9D2 100%)",
        "gold-gradient":   "linear-gradient(135deg, #F0C56A 0%, #D9A441 50%, #A07830 100%)",
        "hero-gradient":   "linear-gradient(to right, rgba(241,233,210,0.98) 0%, rgba(241,233,210,0.7) 50%, rgba(241,233,210,0.1) 100%)",
        "card-overlay":    "linear-gradient(to top, rgba(241,233,210,1) 0%, rgba(241,233,210,0.6) 40%, transparent 100%)",
        "vignette":        "radial-gradient(ellipse at center, transparent 40%, rgba(200,185,155,0.4) 100%)",
      },
      boxShadow: {
        "card":     "0 4px 16px rgba(0,0,0,0.12)",
        "card-lg":  "0 8px 32px rgba(0,0,0,0.16)",
        "hover":    "0 20px 48px rgba(0,0,0,0.18), 0 0 0 1px rgba(217,164,65,0.2)",
        "gold":     "0 0 20px rgba(217,164,65,0.25), 0 0 40px rgba(217,164,65,0.1)",
        "gold-sm":  "0 0 12px rgba(217,164,65,0.2)",
        "glass":    "0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.4)",
        "nav":      "0 1px 0 rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.1)",
      },
      borderRadius: {
        "sm": "4px",
        "md": "6px",
        "lg": "8px",
        "xl": "12px",
        "2xl":"16px",
      },
      animation: {
        "fade-in":     "fadeIn 0.4s ease forwards",
        "fade-in-up":  "fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards",
        "fade-in-down":"fadeInDown 0.4s ease forwards",
        "scale-in":    "scaleIn 0.4s cubic-bezier(0.16,1,0.3,1) forwards",
        "shimmer":     "shimmer 1.6s ease-in-out infinite",
        "spin":        "spin 0.7s linear infinite",
        "pulse-gold":  "pulseGold 2.5s ease-in-out infinite",
        "tv-on":       "tvOn 0.6s ease-out forwards",
      },
      keyframes: {
        fadeIn:    { from: { opacity: "0" }, to: { opacity: "1" } },
        fadeInUp:  { from: { opacity: "0", transform: "translateY(24px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        fadeInDown:{ from: { opacity: "0", transform: "translateY(-16px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        scaleIn:   { from: { opacity: "0", transform: "scale(0.95)" }, to: { opacity: "1", transform: "scale(1)" } },
        shimmer:   { "0%": { backgroundPosition: "200% 0" }, "100%": { backgroundPosition: "-200% 0" } },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(217,164,65,0)" },
          "50%":      { boxShadow: "0 0 0 6px rgba(217,164,65,0.1)" },
        },
        tvOn: {
          "0%":   { opacity: "0", transform: "scaleY(0.01)" },
          "40%":  { opacity: "0.8", transform: "scaleY(1.005)" },
          "100%": { opacity: "1", transform: "scaleY(1)" },
        },
      },
      screens: {
        "xs": "360px",
        "sm": "480px",
        "md": "768px",
        "lg": "1024px",
        "xl": "1280px",
        "2xl": "1440px",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
