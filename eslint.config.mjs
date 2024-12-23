import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import typescriptEslintEslintPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import prettier from 'eslint-plugin-prettier'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

const config = [
  ...compat.extends('next', 'next/core-web-vitals', 'prettier'),
  {
    plugins: {
      prettier,
    },

    rules: {
      'prettier/prettier': 'error',
      camelcase: 'off',
      'import/prefer-default-export': 'error',
      'react/jsx-filename-extension': 'off',
      'react/jsx-props-no-spreading': 'off',
      'react/no-unused-prop-types': 'off',
      'react/require-default-props': 'off',

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
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'no-use-before-define': [0],
      '@typescript-eslint/no-use-before-define': [1],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
  {
    ignores: [
      // Node modules
      'node_modules/',

      // Build directories
      '.next/',
      '.turbo/',
      '_next/',
      '__tmp__/',
      'dist/',
      'target/',
      'compiled/',
      'build/',
      'public/',
      'out/',

      // Configuration files
      'config/',
      '.husky/',
      '.vscode/',
      '.idea/',
      '.DS_Store',

      // Lock files
      'yarn.lock',
      'package-lock.json',
      'pnpm-lock.yaml',
      'composer.lock',

      // Logs
      'logs/',
      '*.log',

      // Environment files
      '.env',
      '.env.*',

      // Tests
      '__tests__/',
      'coverage/',

      // Other
      'instrumentation.ts',
    ],
  },
]

export default config
