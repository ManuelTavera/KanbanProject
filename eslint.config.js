//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

export default [
  ...tanstackConfig,
  {
    rules: {
      'import/no-cycle': 'off',
      'import/order': 'off',
      'sort-imports': 'off',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/require-await': 'off',
      'pnpm/json-enforce-catalog': 'off',
      // NFR-03: no `any`. Tests are held to the same rule.
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    ignores: [
      'eslint.config.js',
      'prettier.config.js',
      '.output/**',
      '.tanstack/**',
      'dist/**',
      'playwright-report/**',
      'test-results/**',
      'src/routeTree.gen.ts',
    ],
  },
]
