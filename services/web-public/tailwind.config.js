const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        naya: {
          green: "#7BC143",
          teal: "#2BC4C3",
          blue: "#0066B3",
          sky: "#0EA5E9",
          "sky-muted": "#38BDF8",
          navy: "#0A1628",
          "navy-deep": "#060E1C",
          surface: "#0F1D2F",
          ink: "#1A1A2E",
          steel: "#334155",
          pale: "#F1F5F9",
          light: "#E2E8F0",
          ghost: "#F8FAFC",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
        mono: ["var(--font-mono)", ...fontFamily.mono],
        display: ["var(--font-sans)", ...fontFamily.sans],
      },
      fontSize: {
        "display-hero": ["clamp(3.5rem, 12vw, 9rem)", { lineHeight: "0.95", letterSpacing: "-0.05em" }],
        "display-2xl": ["clamp(3rem, 6vw, 5rem)", { lineHeight: "1.05", letterSpacing: "-0.04em" }],
        "display-xl": ["clamp(2.25rem, 4vw, 3.75rem)", { lineHeight: "1.1", letterSpacing: "-0.03em" }],
        "display-lg": ["clamp(1.875rem, 3vw, 3rem)", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
      },
      spacing: {
        section: "clamp(5rem, 10vw, 8rem)",
        "section-sm": "clamp(3rem, 6vw, 5rem)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        "glow-brand": "0 0 40px -10px rgba(43, 196, 195, 0.4)",
        "glow-brand-lg": "0 0 60px -10px rgba(43, 196, 195, 0.6)",
        "glow-sky": "0 0 40px -10px rgba(14, 165, 233, 0.4)",
        "glow-navy": "0 0 60px -15px rgba(15, 52, 96, 0.6)",
        "card-hover": "0 20px 60px -15px rgba(0,0,0,0.4)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-right": {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-ring": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.6" },
          "50%": { transform: "scale(1.08)", opacity: "0.3" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out forwards",
        "fade-in": "fade-in 0.4s ease-out forwards",
        "slide-right": "slide-right 0.5s ease-out forwards",
        "scale-in": "scale-in 0.3s ease-out forwards",
        shimmer: "shimmer 2.5s linear infinite",
        "pulse-ring": "pulse-ring 3s ease-in-out infinite",
        float: "float 4s ease-in-out infinite",
        marquee: "marquee 30s linear infinite",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-brand": "linear-gradient(135deg, #7BC143, #2BC4C3, #0EA5E9, #0066B3)",
        "noise": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
