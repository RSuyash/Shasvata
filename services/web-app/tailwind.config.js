/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        naya: {
          navy: "#0F3460",
          sky: "#0EA5E9",
        },
      },
    },
  },
  plugins: [],
};
