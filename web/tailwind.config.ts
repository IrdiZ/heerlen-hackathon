import type { Config } from "tailwindcss";

/**
 * 🇳🇱 WELKOM.AI TAILWIND CONFIGURATION
 * Dutch Orange & Royal Blue Premium Theme
 * 
 * Note: Most theming is handled via CSS custom properties in globals.css
 * This config extends Tailwind with additional utilities and theme values
 */

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      /* ─────────────────────────────────────────────────────────────────────
         COLOR PALETTE
         ───────────────────────────────────────────────────────────────────── */
      colors: {
        // Primary - Dutch Orange
        primary: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#FF6B35",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
          950: "#431407",
          DEFAULT: "#FF6B35",
        },
        // Secondary - Royal Blue
        secondary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1E3A8A",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
          DEFAULT: "#1E3A8A",
        },
        // Accent Colors
        coral: "#FF8C69",
        peach: "#FFAB91",
        rose: "#FF6B8A",
        pink: "#FF85A2",
        gold: "#FFD93D",
        // Semantic
        background: "var(--background)",
        foreground: "var(--foreground)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
      },

      /* ─────────────────────────────────────────────────────────────────────
         ANIMATIONS
         ───────────────────────────────────────────────────────────────────── */
      animation: {
        // Float
        "float": "float 3s ease-in-out infinite",
        "float-slow": "float-slow 6s ease-in-out infinite",
        "float-delayed": "float-delayed 4s ease-in-out 0.5s infinite",
        // Pulse
        "pulse-custom": "pulse 2s ease-in-out infinite",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "pulse-ring": "pulse-ring 1.5s ease-out infinite",
        // Shimmer
        "shimmer": "shimmer 2s infinite",
        // Glow
        "glow": "glow 2s ease-in-out infinite",
        "glow-blue": "glow-blue 2s ease-in-out infinite",
        "text-glow": "text-glow 2s ease-in-out infinite",
        // Bounce
        "bounce-custom": "bounce 1s infinite",
        "bounce-soft": "bounce-soft 2s ease-in-out infinite",
        "bounce-in": "bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
        // Entrance
        "fade-in": "fade-in 0.4s ease-out forwards",
        "fade-in-up": "fade-in-up 0.5s ease-out forwards",
        "fade-in-down": "fade-in-down 0.5s ease-out forwards",
        "slide-up": "slide-up 0.5s ease-out forwards",
        "slide-down": "slide-down 0.5s ease-out forwards",
        "slide-in-right": "slide-in-right 0.5s ease-out forwards",
        "slide-in-left": "slide-in-left 0.5s ease-out forwards",
        "scale-in": "scale-in 0.3s ease-out forwards",
        // Special
        "spin-slow": "spin-slow 8s linear infinite",
        "wiggle": "wiggle 0.5s ease-in-out infinite",
        "pop": "pop 0.3s ease-out",
        "gradient": "gradient-shift 3s ease infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-20px) rotate(2deg)" },
        },
        "float-delayed": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-15px)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.05)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.95)", boxShadow: "0 0 0 0 rgba(255, 107, 53, 0.7)" },
          "70%": { transform: "scale(1)", boxShadow: "0 0 0 10px rgba(255, 107, 53, 0)" },
          "100%": { transform: "scale(0.95)", boxShadow: "0 0 0 0 rgba(255, 107, 53, 0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(255, 107, 53, 0.4)" },
          "50%": { boxShadow: "0 0 40px rgba(255, 107, 53, 0.6), 0 0 60px rgba(255, 107, 53, 0.3)" },
        },
        "glow-blue": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(30, 58, 138, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(30, 58, 138, 0.5), 0 0 60px rgba(30, 58, 138, 0.2)" },
        },
        "text-glow": {
          "0%, 100%": { textShadow: "0 0 10px rgba(255, 107, 53, 0.5)" },
          "50%": { textShadow: "0 0 20px rgba(255, 107, 53, 0.8), 0 0 30px rgba(255, 107, 53, 0.4)" },
        },
        bounce: {
          "0%, 100%": { transform: "translateY(0)", animationTimingFunction: "cubic-bezier(0.8, 0, 1, 1)" },
          "50%": { transform: "translateY(-25%)", animationTimingFunction: "cubic-bezier(0, 0, 0.2, 1)" },
        },
        "bounce-soft": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "bounce-in": {
          "0%": { transform: "scale(0)", opacity: "0" },
          "50%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-down": {
          from: { opacity: "0", transform: "translateY(-20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          from: { opacity: "0", transform: "translateY(-30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(30px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-left": {
          from: { opacity: "0", transform: "translateX(-30px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.9)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        pop: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)" },
        },
        "gradient-shift": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },

      /* ─────────────────────────────────────────────────────────────────────
         SHADOWS
         ───────────────────────────────────────────────────────────────────── */
      boxShadow: {
        "orange": "0 10px 40px -10px rgba(255, 107, 53, 0.4)",
        "orange-sm": "0 4px 14px -3px rgba(255, 107, 53, 0.3)",
        "orange-lg": "0 25px 50px -12px rgba(255, 107, 53, 0.35)",
        "blue": "0 10px 40px -10px rgba(30, 58, 138, 0.3)",
        "blue-sm": "0 4px 14px -3px rgba(30, 58, 138, 0.25)",
        "soft": "0 4px 20px -2px rgba(0, 0, 0, 0.08)",
        "glow-orange": "0 0 40px rgba(255, 107, 53, 0.3)",
        "glow-blue": "0 0 40px rgba(30, 58, 138, 0.2)",
        "elevated": "0 0 0 1px rgba(0, 0, 0, 0.03), 0 2px 4px rgba(0, 0, 0, 0.03), 0 12px 24px rgba(0, 0, 0, 0.06)",
        "premium": "0 0 0 1px rgba(255, 107, 53, 0.05), 0 4px 6px -1px rgba(255, 107, 53, 0.1), 0 10px 20px -2px rgba(0, 0, 0, 0.1)",
        "glass": "0 8px 32px 0 rgba(31, 38, 135, 0.1)",
      },

      /* ─────────────────────────────────────────────────────────────────────
         BACKDROP BLUR
         ───────────────────────────────────────────────────────────────────── */
      backdropBlur: {
        xs: "2px",
        "3xl": "40px",
      },

      /* ─────────────────────────────────────────────────────────────────────
         BORDER RADIUS
         ───────────────────────────────────────────────────────────────────── */
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },

      /* ─────────────────────────────────────────────────────────────────────
         BACKGROUND IMAGE (Gradients)
         ───────────────────────────────────────────────────────────────────── */
      backgroundImage: {
        "gradient-orange": "linear-gradient(135deg, #FF6B35 0%, #FF8C69 50%, #FFAB91 100%)",
        "gradient-orange-pink": "linear-gradient(135deg, #FF6B35 0%, #FF6B8A 50%, #FF85A2 100%)",
        "gradient-sunset": "linear-gradient(135deg, #FF6B35 0%, #FF8C69 25%, #FF6B8A 50%, #FF85A2 75%, #E879F9 100%)",
        "gradient-royal": "linear-gradient(135deg, #1E3A8A 0%, #3b82f6 50%, #60a5fa 100%)",
        "gradient-radial-orange": "radial-gradient(ellipse at center, rgba(255, 107, 53, 0.15) 0%, transparent 70%)",
        "gradient-radial-blue": "radial-gradient(ellipse at center, rgba(30, 58, 138, 0.1) 0%, transparent 70%)",
        "gradient-hero": "linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(30, 58, 138, 0.05) 100%)",
      },

      /* ─────────────────────────────────────────────────────────────────────
         TIMING FUNCTIONS
         ───────────────────────────────────────────────────────────────────── */
      transitionTimingFunction: {
        "bounce": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
        "spring": "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      },

      /* ─────────────────────────────────────────────────────────────────────
         FONT FAMILY
         ───────────────────────────────────────────────────────────────────── */
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
