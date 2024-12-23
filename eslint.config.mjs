import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import typescriptEslintEslintPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import prettier from 'eslint-plugin-prettier'
import unusedImports from 'eslint-plugin-unused-imports'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

export default [
  ...compat.extends('next', 'next/core-web-vitals', 'prettier'),
  {
    plugins: {
      prettier,
      jsxA11y,
      'unused-imports': unusedImports,
    },

    rules: {
      camelcase: 'off',
      'react/no-unused-prop-types': 'off',
      'react/jsx-filename-extension': 'off',
      'react/jsx-props-no-spreading': 'off',
      'react/require-default-props': 'off',
      'prettier/prettier': 'error',
      'import/prefer-default-export': 'error',
      'unused-imports/no-unused-imports': 'error',
      // "padding-line-between-statements": ["error", { blankLine: "always", prev: "*", next: "return" }],

      'import/extensions': [
        'error',
        'ignorePackages',
        {
          ts: 'never',
          tsx: 'never',
          js: 'never',
          jsx: 'never',
        },
      ],

      'jsx-a11y/anchor-is-valid': [
        'error',
        {
          components: ['Link'],
          specialLink: ['hrefLeft', 'hrefRight'],
          aspects: ['invalidHref', 'preferButton'],
        },
      ],
    },
  },
  ...compat
    .extends('plugin:@typescript-eslint/recommended', 'prettier')
    .map((config) => ({
      ...config,
      files: ['**/*.+(ts|tsx)'],
    })),
  {
    files: ['**/*.+(ts|tsx)'],

    plugins: {
      '@typescript-eslint': typescriptEslintEslintPlugin,
    },

    languageOptions: {
      parser: tsParser,
    },

    rules: {
      'no-use-before-define': [0],
      '@typescript-eslint/no-use-before-define': [1],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
]
