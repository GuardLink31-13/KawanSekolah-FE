/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          DEFAULT: '#2D6A4F',
          mid:    '#52B788',
          light:  '#95D5B2',
          pale:   '#D8F3DC',
        },
        cream: {
          DEFAULT: '#F8F4EC',
          dark:    '#EDE7D9',
          border:  '#C8C0A8',
        },
        gold: {
          DEFAULT: '#E9C46A',
          dark:    '#C9A227',
        },
        ink: {
          DEFAULT: '#3D405B',
          light:   '#6B6E8A',
          muted:   '#A0A3B8',
        },
      },
      fontFamily: {
        sans:    ['DM Sans', 'sans-serif'],
        display: ['DM Serif Display', 'serif'],
      },
      borderRadius: {
        xl: '16px',
      },
    },
  },
  plugins: [],
}