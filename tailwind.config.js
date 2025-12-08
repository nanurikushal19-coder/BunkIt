// tailwind.config.js
const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Mapping primary to Zinc (Grayscale) to handle any lingering classes
        // primary-900 is black, primary-50 is white
        primary: colors.zinc,
        gray: colors.gray,
      }
    }
  },
  plugins: [],
};
