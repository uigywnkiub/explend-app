import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import typescriptEslintEslintPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import checkFile from 'eslint-plugin-check-file'
import importPlugin from 'eslint-plugin-import'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import prettier from 'eslint-plugin-prettier'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
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

const config = [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      '.turbo/**',
      '_next/**',
      'dist/**',
      'build/**',
      'out/**',
      'public/**',
      'coverage/**',
      '__tests__/**',
      '*.log',
      '.env',
      '.env.*',
      'instrumentation.ts',
      'instrumentation-client.ts',
      'next-env.d.ts',
    ],
  },
  ...compat.extends('prettier'),
  {
    plugins: {
      prettier,
      'check-file': checkFile,
      'unused-imports': unusedImports,
      'jsx-a11y': jsxA11y,
      'react-hooks': reactHooks,
      import: importPlugin,
      react: reactPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'prettier/prettier': 'error',
      camelcase: 'off',
      'import/prefer-default-export': 'off',
      'react/jsx-filename-extension': 'off',
      'react/jsx-props-no-spreading': 'off',
      'react/no-unused-prop-types': 'off',
      'react/require-default-props': 'off',
      'react/function-component-definition': [
        'error',
        { namedComponents: 'function-declaration' },
      ],
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: 'return' },
      ],
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': 'error',
      'check-file/no-index': 'error',
      'check-file/filename-blocklist': [
        'error',
        { '**/*.js': '*.ts', '**/*.jsx': '*.tsx' },
      ],
      'check-file/filename-naming-convention': [
        'error',
        {
          '**/*.{jsx,tsx}': 'KEBAB_CASE',
          '**/*.{js,ts}': 'KEBAB_CASE',
        },
        { ignoreMiddleExtensions: true },
      ],
      'check-file/folder-match-with-fex': [
        'error',
        { '*.test.ts': '**/__tests__/' },
      ],
      'no-console': 'error',
      eqeqeq: 'error',
      radix: 'error',
      'no-implicit-coercion': 'error',
      'prefer-object-has-own': 'error',
      'no-var': 'error',
      'prefer-template': 'error',
      'prefer-const': 'error',
      'no-unreachable': 'error',
      'no-undef': 'error',
      'no-fallthrough': 'error',
      'no-duplicate-imports': 'error',
      'prefer-spread': 'error',
      'import/extensions': 'off',
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
    .map((c) => ({ ...c, files: ['**/*.+(ts|tsx)'] })),
  {
    files: ['**/*.+(ts|tsx)'],
    plugins: { '@typescript-eslint': typescriptEslintEslintPlugin },
    languageOptions: { parser: tsParser },
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'no-use-before-define': [0],
      '@typescript-eslint/no-use-before-define': [1],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-var-requires': 'error',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
]

export default config
