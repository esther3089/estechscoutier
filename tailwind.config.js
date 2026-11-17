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
        forest: {
          DEFAULT: '#2F6B2F',
          dark: '#245224',
          light: '#3C853C',
          50: '#F2F7F2',
          100: '#E1EDE1',
          800: '#2F6B2F',
          900: '#1F471F'
        },
        brandPurple: {
          DEFAULT: '#5B21B6',
          hover: '#4C1D95',
          light: '#7C3AED',
          50: '#F5F3FF',
          100: '#EDE9FE'
        },
        brandTeal: {
          DEFAULT: '#0D9488',
          hover: '#0F766E'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

