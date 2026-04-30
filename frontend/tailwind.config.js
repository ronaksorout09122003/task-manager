/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "sans-serif"],
      },
      colors: {
        ink: "#172033",
        slateLine: "#D9E1EE",
        mist: "#F5F8FC",
        ocean: "#0F766E",
        oceanDark: "#115E59",
        iris: "#4F46E5",
        amberSoft: "#F59E0B",
        roseSoft: "#E11D48",
      },
      boxShadow: {
        soft: "0 18px 50px rgba(23, 32, 51, 0.08)",
      },
    },
  },
  plugins: [],
};
