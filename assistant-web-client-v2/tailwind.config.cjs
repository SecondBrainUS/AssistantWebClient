/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
	  "./src/**/*.{js,jsx,ts,tsx}"
	],
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
			  600: '#303030',
			  700: '#212121',
			  800: '#171717',
			  900: '#111827',
			  // 303030
			},
		  },
		},
	},
	plugins: [],
  };