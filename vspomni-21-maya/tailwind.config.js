/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        nunito: ['Nunito', 'sans-serif'],
      },
      colors: {
        bg: '#f4f7fc',
        ink: '#16223a',
        muted: '#7c89a4',
        line: '#e6ecf5',
        blue: '#1b6deb',
        'blue-dk': '#1559c4',
        'blue-soft': '#e8f1ff',
        green: '#27c281',
        orange: '#ff7a2f',
        fire: '#ff5722',
        ice: '#39b9ff',
        'ice-soft': '#e4f6ff',
        purple: '#8b5cf6',
        'purple-soft': '#f0ebff',
        red: '#ef4757',
      },
      borderRadius: {
        card: '20px',
      },
      boxShadow: {
        card: '0 4px 20px rgba(27,109,235,.06)',
        'card-h': '0 10px 30px rgba(27,109,235,.14)',
      },
    },
  },
  plugins: [],
}
