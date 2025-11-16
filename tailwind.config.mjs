/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          25: '#F2F7FF',
          50: '#ECF3FF',
          100: '#DDE9FF',
          200: '#C2D6FF',
          300: '#9CB9FF',
          400: '#7592FF',
          500: '#465FFF',
          600: '#3641F5',
          700: '#2A31D8',
          800: '#252DAE',
          900: '#262E89',
          950: '#161950',
        },
        error: { 500: '#F04438' },
        gray: {
          25: '#FCFCFD', 50: '#F9FAFB', 100: '#F2F4F7', 200: '#E4E7EC', 300: '#D0D5DD', 400: '#98A2B3', 500: '#667085', 600: '#475467', 700: '#344054', 800: '#1D2939', 900: '#101828', 950: '#0C111D'
        },
      },
      boxShadow: {
        'theme-xs': '0px 1px 2px 0px rgba(16, 24, 40, 0.05)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};

