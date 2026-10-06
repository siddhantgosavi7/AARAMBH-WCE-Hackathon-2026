/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          950: '#030b14',
          900: '#071829',
          800: '#0c2742',
          700: '#133a61',
          600: '#1b5084',
          500: '#276ea8',
        },
        aqua: {
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        },
        bio: {
          emerald: '#10b981',
          teal: '#14b8a6',
          cyan: '#06b6d4',
        }
      },
    },
  },
  plugins: [],
}
