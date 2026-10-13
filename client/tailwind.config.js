/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
      },
      colors: {
        gdg: {
          blue: '#4285F4',
          red: '#EA4335',
          yellow: '#FBBC04',
          green: '#34A853',
          dark: '#1E293B',
          darker: '#0F172A',
        },
      },
    },
  },
  plugins: [],
};
