/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#eef1f8', 100: '#d5ddf0', 200: '#adbce0',
          300: '#7e96cc', 400: '#5875bb', 500: '#3a5aac',
          600: '#2d4a91', 700: '#1e3368', 800: '#132348', 900: '#0c1730', 950: '#070e1e',
        },
        civic: { green: '#22c55e', teal: '#0d9488' },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        display: ['"Fraunces"', 'serif'],
      },
    },
  },
  plugins: [],
}
