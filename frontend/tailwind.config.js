/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#0f0f0f',
          50: '#1a1a2e',
          100: '#16213e',
          200: '#1e1e30',
          300: '#2a2a3d',
          400: '#3a3a50',
        },
        accent: {
          red: '#ff0033',
          gold: '#f5a623',
          blue: '#3b82f6',
          purple: '#7c3aed',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
