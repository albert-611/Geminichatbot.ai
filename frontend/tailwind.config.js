/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          main: "#0B0D12",
          sidebar: "#10131A",
          chat: "#0B0D12",
          input: "#171B24",
          card: "#141821",
        },
        accent: {
          primary: "#8B7CFF",
          secondary: "#6C63FF",
          hover: "#9D90FF",
        },
        text: {
          primary: "#F5F5F7",
          secondary: "#9298A5",
          muted: "#636A79",
        },
        border: {
          subtle: "#252A35",
          highlight: "#343A48",
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        heading: ["var(--font-manrope)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" }
        }
      },
      animation: {
        fadeIn: "fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        pulseGlow: "pulseGlow 2s ease-in-out infinite"
      }
    },
  },
  plugins: [],
};

