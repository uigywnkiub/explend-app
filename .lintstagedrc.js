// import { relative } from 'path'

// const buildEslintCommand = (filenames) =>
//   `eslint --fix --file ${filenames
//     .map((f) => relative(process.cwd(), f))
//     .join(' --file ')}`
// const a:string = 12

const a = 22

// const config = {
//   // '*.{js,jsx,ts,tsx}': [buildEslintCommand],
//   // '**/*': [buildEslintCommand],
//   '**/*': ['pnpm lint:fix'],
//   '**/*': ['pnpm prettier:fix'],
// }

// export default config
/**
 * Refactored config to run Prettier only on staged files,
 * and ESLint only on JS/TS files.
 */
const buildPrettierCommand = (filenames) =>
  `pnpm prettier --write ${filenames.map((f) => `"${f}"`).join(' ')}`

const buildEslintCommand = (filenames) =>
  `pnpm eslint --fix ${filenames.map((f) => `"${f}"`).join(' ')}`

const config = {
  // '*.{js,jsx,ts,tsx}': [buildEslintCommand],
  // '*.{js,jsx,ts,tsx,json,css,md}': [buildPrettierCommand],
  '**/*': [buildEslintCommand],
  '**/*': [buildPrettierCommand],
}

export default config
