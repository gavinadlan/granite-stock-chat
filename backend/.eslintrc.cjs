module.exports = {
  root: true,
  env: { node: true, es2022: true },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  ignorePatterns: ['.eslintrc.cjs', '.esbuild', '.serverless'],
  parser: '@typescript-eslint/parser',
};
