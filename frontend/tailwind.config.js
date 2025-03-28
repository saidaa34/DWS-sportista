/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "dark-color": "var(--dark-color)",
        "red-color": "var(--red-color)",
        "orange-color": "var(--orange-color)",
        "gray-color": "var(--gray-color)",
        "white-color": "var(--white-color)",
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
}

