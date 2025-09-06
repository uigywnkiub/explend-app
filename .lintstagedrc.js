// import { relative } from 'path'

// const buildEslintCommand = (filenames) =>
//   `eslint --fix --file ${filenames
//     .map((f) => relative(process.cwd(), f))
//     .join(' --file ')}`
// const a:string = 12

const a = 2

const config = {
  // '*.{js,jsx,ts,tsx}': [buildEslintCommand],
  // '**/*': [buildEslintCommand],
  '**/*': ['pnpm lint:fix'],
  '**/*': ['pnpm prettier:fix'],
}

export default config
