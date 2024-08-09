# Usage of `.prettierrc`

## Introduction

Prettier is a code formatter that helps maintain consistent code style across your project. The `.prettierrc` file is a configuration file where you specify your Prettier settings.

## Setting Up `.prettierrc`

1. **Compatibility `prettier-plugin-tailwindcss` with other Prettier plugins**

This plugin uses Prettier APIs that can only be used by one plugin at a time, making it incompatible with other Prettier plugins implemented the same way. To solve this we've added explicit per-plugin workarounds that enable compatibility with the following Prettier plugins:

- `@ianvs/prettier-plugin-sort-imports`
- `@prettier/plugin-pug`
- `@shopify/prettier-plugin-liquid`
- `@trivago/prettier-plugin-sort-imports`
- `prettier-plugin-astro`
- `prettier-plugin-css-order`
- `prettier-plugin-import-sort`
- `prettier-plugin-jsdoc`
- `prettier-plugin-organize-attributes`
- `prettier-plugin-organize-imports`
- `prettier-plugin-style-order`
- `prettier-plugin-svelte`
- `prettier-plugin-sort-imports`

One limitation with this approach is that `prettier-plugin-tailwindcss` _must_ be loaded last.

```json5
// .prettierrc
{
  // ..
  plugins: [
    '@trivago/prettier-plugin-sort-imports',
    'prettier-plugin-tailwindcss', // MUST come last
  ],
  // ..
}
```

Also, if you use vscode, only the tailwindcss plugin will work on save (command + s) and the rest of the plugins will work after running `pnpm prettier` or `pnpm prettier:fix`.

However, all plugins may work correctly on the save (command + s). I guess it depends on their versions.
