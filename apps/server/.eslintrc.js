module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'boundaries'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
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
};
