import js from '@eslint/js';
import globals from 'globals';

export default [
	{
		ignores: [ 'node_modules/**', 'coverage/**' ],
	},
	js.configs.recommended,
	{
		files: [ '**/*.mjs' ],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				...globals.browser,
			},
		},
	},
	{
		files: [ 'test/**/*.mjs', 'scripts/**/*.mjs', 'eslint.config.mjs' ],
		languageOptions: {
			globals: {
				...globals.node,
			},
		},
	},
	{
		// Changing copyWithQ.mjs changes its published SRI hash, so its existing issues are reported only as warnings
		files: [ 'copyWithQ.mjs' ],
		rules: {
			'no-unused-vars': 'warn',
		},
	},
];
