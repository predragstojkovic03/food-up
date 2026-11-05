const { defineConfig, globalIgnores } = require('eslint/config');
const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const prettierRecommended = require('eslint-plugin-prettier/recommended');
const boundaries = require('eslint-plugin-boundaries');
const globals = require('globals');

/**
 * DDD layers (see CLAUDE.md): domain ← application ← infrastructure / presentation.
 * Each layer may import itself and the layers further in, never further out.
 */
const LAYER_RULES = [
  { from: 'domain', allow: ['domain'] },
  { from: 'application', allow: ['application', 'domain'] },
  { from: 'infrastructure', allow: ['infrastructure', 'application', 'domain'] },
  { from: 'presentation', allow: ['presentation', 'application', 'domain'] },
];

module.exports = defineConfig([
  globalIgnores(['dist', 'coverage', 'eslint.config.js']),
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettierRecommended,
  {
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: __dirname,
      },
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // Repository interfaces deliberately extend IRepository<T> without adding members
      '@typescript-eslint/no-empty-object-type': ['error', { allowInterfaces: 'with-single-extends' }],
    },
  },
  {
    files: ['src/**/*.ts'],
    plugins: { boundaries },
    settings: {
      // Resolve `src/...` path aliases so layer rules can see where imports point
      'import/resolver': {
        typescript: { project: `${__dirname}/tsconfig.json` },
      },
      'boundaries/elements': [
        { type: 'domain', pattern: '**/domain', mode: 'folder' },
        { type: 'application', pattern: '**/application', mode: 'folder' },
        { type: 'infrastructure', pattern: '**/infrastructure', mode: 'folder' },
        { type: 'presentation', pattern: '**/presentation', mode: 'folder' },
      ],
    },
    rules: {
      'boundaries/element-types': ['error', { default: 'disallow', rules: LAYER_RULES }],
    },
  },
]);
