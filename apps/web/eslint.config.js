import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'boundaries/element-types': [
        2,
        {
          default: 'disallow',
          rules: [
            { from: 'domain', allow: [] },
            { from: 'application', allow: ['domain'] },
            { from: 'infrastructure', allow: ['application', 'domain'] },
            { from: 'presentation', allow: ['application'] },
          ],
        },
      ],
    },
    settings: {
      boundaries: {
        elements: [
          { type: 'domain', pattern: 'src/**/domain/*' },
          { type: 'application', pattern: 'src/**/application/*' },
          { type: 'infrastructure', pattern: 'src/**/infrastructure/*' },
          { type: 'presentation', pattern: 'src/**/presentation/*' },
        ],
      },
    },
  },
);
