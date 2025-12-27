/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}', // if you’re using /app
  ],
  theme: {
    extend: {
      colors: {
        vscode: {
          bg: '#1e1e1e',
          panel: '#252526',
          gutter: '#2d2d2d',
          border: '#3c3c3c',
          text: '#d4d4d4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Orbitron', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
