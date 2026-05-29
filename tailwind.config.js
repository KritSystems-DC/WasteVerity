/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1f2937',
        accent: '#10b981',
        softblue: '#60a5fa'
      }
    }
  },
  plugins: [],
}
