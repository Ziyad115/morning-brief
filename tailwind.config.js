/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "#FBF7F2",
          soft: "#F5EEE4",
        },
        ink: {
          DEFAULT: "#2B2A28",
          muted: "#6F6B63",
          faint: "#A6A199",
        },
        accent: {
          DEFAULT: "#3E6259",
          soft: "#E7EEEA",
        },
        rise: {
          DEFAULT: "#3E7A5E",
          soft: "#E6F1EB",
        },
        fall: {
          DEFAULT: "#B4544A",
          soft: "#F5E9E7",
        },
        line: "#EAE2D4",
        dawn: {
          amber: "#E8A33D",
          coral: "#E07856",
          rose: "#D9738A",
          violet: "#8B6FB0",
          sky: "#5B8FA8",
        },
        // Dark mode palette — deliberately NOT just inverted grays.
        // Deep navy/charcoal base (not pure black — easier on the eyes
        // at night, same philosophy as the light "not pure white" base)
        // with the SAME dawn accent hues pushed more saturated/vibrant,
        // since colors read as duller against dark backgrounds unless
        // boosted.
        night: {
          DEFAULT: "#14161C", // page background
          soft: "#1B1E26",    // card background
          border: "#2A2E38",
        },
        moon: {
          DEFAULT: "#E8E6E1", // primary text
          muted: "#9B9CA6",
          faint: "#6B6D78",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      backgroundImage: {
        sunrise: "linear-gradient(135deg, #FDF4E7 0%, #FBF7F2 40%, #F3EFE9 100%)",
        // Dark mode header wash — subtle deep violet-to-navy gradient
        // instead of a literal "sunrise," evoking night sky instead.
        nightsky: "linear-gradient(135deg, #1D1B2E 0%, #14161C 45%, #14161C 100%)",
      },
      boxShadow: {
        card: "0 1px 2px rgba(43, 42, 40, 0.04), 0 8px 24px rgba(43, 42, 40, 0.05)",
        cardHover: "0 2px 4px rgba(43, 42, 40, 0.06), 0 12px 32px rgba(43, 42, 40, 0.08)",
        cardDark: "0 1px 2px rgba(0, 0, 0, 0.3), 0 8px 24px rgba(0, 0, 0, 0.35)",
        cardDarkHover: "0 2px 6px rgba(0, 0, 0, 0.4), 0 12px 36px rgba(0, 0, 0, 0.5)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      letterSpacing: {
        tightish: "-0.01em",
      },
    },
  },
  plugins: [],
}
