const config = {
  '*.{js,jsx,mjs,cjs,ts,tsx,md,html}': ['eslint --fix'],
  '**/*': ['prettier --write --ignore-unknown'],
}

export default config
