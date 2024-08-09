import { relative } from 'path'

const buildEslintCommand = (filenames) =>
  `next lint --fix --file ${filenames
    .map((f) => relative(process.cwd(), f))
    .join(' --file ')}`

const config = {
  '*.{js,jsx,ts,tsx}': [buildEslintCommand],
  '**/*': ['pnpm prettier:fix'],
}

export default config
