// import { relative } from 'path'

// const buildEslintCommand = (filenames) =>
//   `eslint --fix --file ${filenames
//     .map((f) => relative(process.cwd(), f))
//     .join(' --file ')}`

// const config = {
//   // '*.{js,jsx,ts,tsx}': [buildEslintCommand],
//   // '**/*': [buildEslintCommand],
//   '**/*': ['pnpm lint:fix'],
//   '**/*': ['pnpm prettier:fix'],
// }

// export default config
/**
 * Refactored config to run Prettier only on staged files,
 */
// const buildPrettierCommand = (filenames) =>
//   `pnpm prettier --write ${filenames.map((f) => `"${f}"`).join(' ')}`

// const buildEslintCommand = (filenames) =>
//   `pnpm eslint --fix ${filenames.map((f) => `"${f}"`).join(' ')}`

// const buildEslintCommand = (filenames) =>
//   `eslint --fix --file ${filenames
//     .map((f) => relative(process.cwd(), f))
//     .join(' --file ')}`

// const buildPrettierCommand = (filenames) =>
//   `prettier --write --file ${filenames
//     .map((f) => relative(process.cwd(), f))
//     .join(' --file ')}`

const config = {
  // '*.{js,jsx,ts,tsx}': [buildEslintCommand],
  // '*.{js,jsx,ts,tsx,json,css,md}': [buildPrettierCommand],
  // '**/*': [buildEslintCommand],
  // '**/*': [buildPrettierCommand],
  '**/*': ['tsc --noEmit'],
  '**/*': ['eslint --fix'],
  '**/*': ['prettier --write'],
}

export default config
