import js from '@eslint/js';
import boundaries from 'eslint-plugin-boundaries';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * Feature layers (see CLAUDE.md): domain ← application ← infrastructure / presentation.
 * Each layer may import itself and the layers further in, never further out.
 */
const LAYER_RULES = [
  { from: 'domain', allow: ['domain'] },
  { from: 'application', allow: ['application', 'domain'] },
  { from: 'infrastructure', allow: ['infrastructure', 'application', 'domain'] },
  { from: 'presentation', allow: ['presentation', 'application', 'domain'] },
];

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
      boundaries,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true }],
      'boundaries/element-types': ['error', { default: 'disallow', rules: LAYER_RULES }],
    },
    settings: {
      // Resolve `@/...` and `@food-up/shared` aliases so layer rules can see where imports point
      'import/resolver': {
        typescript: { project: './tsconfig.app.json' },
      },
      'boundaries/elements': [
        { type: 'domain', pattern: 'src/features/*/domain', mode: 'folder' },
        { type: 'application', pattern: 'src/features/*/application', mode: 'folder' },
        { type: 'infrastructure', pattern: 'src/features/*/infrastructure', mode: 'folder' },
        { type: 'presentation', pattern: 'src/features/*/presentation', mode: 'folder' },
      ],
    },
  },
);
