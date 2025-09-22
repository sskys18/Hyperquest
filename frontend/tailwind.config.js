/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#8BDACC',
        accent: '#13C39A',
        accent2: '#0FAF98',
        highlight: '#95FCE4',
        bg900: '#0A2A26',
        bg800: '#0D332E',
        card800: '#0F3A33',
        card700: '#0A2F2A',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(0,229,255,0.2), 0 0 24px rgba(0,229,255,0.15)'
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px'
      }
    },
  },
  plugins: [],
}
