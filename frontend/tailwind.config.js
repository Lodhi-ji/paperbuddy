/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        glass: {
          bg: "rgba(255, 255, 255, 0.75)",
          border: "rgba(255, 255, 255, 0.4)",
        },
        pastel: {
          blue: "#EBF3FF",
          pink: "#FFF0F5",
          purple: "#F3EFFF",
          green: "#E8F8F0",
          yellow: "#FFFDF0",
        },
        brand: {
          primary: "#4F46E5",
          accent: "#6366F1",
          success: "#22C55E",
          warning: "#F59E0B",
          danger: "#EF4444",
        }
      },
      boxShadow: {
        premium: "0 15px 45px rgba(31, 38, 135, 0.08)",
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.05)",
      },
      backdropBlur: {
        premium: "20px",
      }
    },
  },
  plugins: [],
}
