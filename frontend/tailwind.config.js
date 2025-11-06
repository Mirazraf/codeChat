/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366f1', // Indigo for dark mode
          light: '#0f766e',   // Teal for light mode
          dark: '#6366f1',    // Indigo for dark mode
        },
      },
    },
  },
  plugins: [],
}
