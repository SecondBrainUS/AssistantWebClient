/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gray: {
          50: '#fafafa',
          100: '#d2d2d2',
          200: '#aaaaaa',
          300: '#828282',
          400: '#5a5a5a',
          500: '#474747',
          600: '#313131',
          700: '#212121',
          800: '#171717',
          900: '#111827',
        },
      },
    },
  },
  plugins: [],
}