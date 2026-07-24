/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: { 
        mono: ['Space Mono', 'monospace'],
        sans: ['Inter', 'sans-serif']
      },
      colors: {
        surface: '#0d0d0d',
        surfaceCard: '#141414',
        inputbg: '#181818',
        dimBorder: '#262626',
        brightBorder: '#404040',
        dimText: '#737373',
        subText: '#a3a3a3',
      }
    },
  },
  plugins: [],
}
