import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: ['dist/**', 'dist-dev/**', 'node_modules/**'],
  },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        __VLC_ENV__: 'readonly',
        GM: 'readonly',
        GM_setClipboard: 'readonly',
        GM_getValue: 'readonly',
        GM_setValue: 'readonly',
        GM_xmlhttpRequest: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
];
