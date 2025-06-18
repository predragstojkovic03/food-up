const { defineConfig, globalIgnores } = require('eslint/config');

const tsParser = require('@typescript-eslint/parser');
const typescriptEslintEslintPlugin = require('@typescript-eslint/eslint-plugin');
const boundaries = require('eslint-plugin-boundaries');
const globals = require('globals');
const js = require('@eslint/js');

const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

module.exports = defineConfig([
  {
    languageOptions: {
      parser: tsParser,
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

    plugins: {
      '@typescript-eslint': typescriptEslintEslintPlugin,
      boundaries,
    },

    extends: compat.extends(
      'plugin:@typescript-eslint/recommended',
      'plugin:prettier/recommended',
    ),

    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',

      'boundaries/element-types': [
        2,
        {
          default: 'disallow',

          rules: [
            {
              from: 'domain',
              allow: [],
            },
            {
              from: 'application',
              allow: ['domain'],
            },
            {
              from: 'infrastructure',
              allow: ['application', 'domain'],
            },
            {
              from: 'presentation',
              allow: ['application'],
            },
          ],
        },
      ],
    },

    settings: {
      boundaries: {
        elements: [
          {
            type: 'domain',
            pattern: 'src/**/domain/*',
          },
          {
            type: 'application',
            pattern: 'src/**/application/*',
          },
          {
            type: 'infrastructure',
            pattern: 'src/**/infrastructure/*',
          },
          {
            type: 'presentation',
            pattern: 'src/**/presentation/*',
          },
        ],
      },
    },
  },
  globalIgnores(['**/.eslintrc.js']),
]);
