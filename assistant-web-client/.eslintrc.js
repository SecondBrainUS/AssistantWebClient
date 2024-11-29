module.exports = {
	env: {
	  browser: true,
	  es2021: true,
	},
	extends: ['plugin:vue/vue3-essential', 'eslint:recommended', 'prettier'],
	parserOptions: {
	  ecmaVersion: 12,
	  sourceType: 'module',
	},
	plugins: ['vue', 'prettier'],
	rules: {
	  'prettier/prettier': 'error',
	},
  };
  