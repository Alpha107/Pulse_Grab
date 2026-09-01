/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "-apple-system", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        ink: "#07070b",
        surface: "#111117",
        surface2: "#191921",
        edge: "rgba(255,255,255,0.08)",
        edge2: "rgba(255,255,255,0.16)",
        accent: {
          DEFAULT: "#8b6cf6",
          hover: "#a68bff",
          soft: "rgba(139,108,246,0.15)",
        },
        accent2: "#22d3ee",
        success: "#34d399",
        warning: "#fbbf24",
        danger: "#f87171",
        muted: "#9696a3",
      },
      backgroundImage: {
        "accent-gradient": "linear-gradient(135deg, #8b6cf6 0%, #22d3ee 100%)",
        "page-glow":
          "radial-gradient(60% 40% at 50% 0%, rgba(139,108,246,0.18) 0%, rgba(139,108,246,0) 100%)",
        scanlines:
          "repeating-linear-gradient(to bottom, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 1px, transparent 1px, transparent 3px)",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(139,108,246,0.4), 0 8px 30px -8px rgba(139,108,246,0.5)",
        "glow-cyan": "0 0 0 1px rgba(34,211,238,0.35), 0 0 24px -6px rgba(34,211,238,0.55)",
        card: "0 1px 0 rgba(255,255,255,0.04) inset, 0 12px 30px -18px rgba(0,0,0,0.6)",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        popIn: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in-up": "fadeInUp .35s ease-out both",
        "fade-in": "fadeIn .2s ease-out both",
        "pop-in": "popIn .18s cubic-bezier(0.16,1,0.3,1) both",
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [],
};
