/** @type {import('tailwindcss').Config} */
const {heroui} = require("@heroui/react");
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
      "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      container: {
        center: true,
        padding: "2rem",
        screens: {
          "2xl": "1400px",
        },
      },
      extend: {},
    },
    darkMode: "class",
    plugins: [heroui()],
  }