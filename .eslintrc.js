module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['airbnb-base', 'prettier', 'plugin:node/recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'node/no-unsupported-features/es-syntax': [
      'off',
      {
        version: '>=16.14.0',
        ignores: [],
      },
    ],
    'node/no-unpublished-import': [
      'warn',
      {
        allowModules: ['morgan', 'pino', 'validator'],
      },
    ],
    'object-shorthand': 'off',
    'no-promise-executor-return': 'off',
    'node/no-unpublished-require': 'off',
    'import/no-extraneous-dependencies': 'off',
    'spaced-comment': 'off',
    'no-console': 'warn',
    'consistent-return': 'off',
    'func-names': 'off',
    ' object-shorthand': 'off',
    'no-process-exit': 'off',
    'no-param-reassign': 'off',
    'no-return-await': 'off',
    'no-underscore-dangle': 'off',
    'class-methods-use-this': 'off',
    'prefer-destructuring': [
      'error',
      {
        object: true,
        array: false,
      },
    ],
    'no-unused-vars': ['warn', { argsIgnorePattern: 'req|res|next|val' }],
  },
};
