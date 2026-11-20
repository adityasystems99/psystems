/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#05060a",
        card: "#0b0d14",
        "card-border": "#1c2132",
        brand: {
          cyan: "#00f0ff",
          blue: "#38bdf8",
          violet: "#8b5cf6",
          purple: "#a855f7",
          orange: "#f97316",
          coral: "#ff5722",
        }
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      animation: {
        'glow-pulse': 'glow 3s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        }
      }
    },
  },
  plugins: [],
}

