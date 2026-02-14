import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  ignore: ['./app/sw.{js,ts}'],
  ignoreDependencies: [
    '@testing-library/dom',
    '@testing-library/react',
    // 'postcss',
    'postcss-load-config',
    '@svgr/webpack',
    // Libs are needed for nextjs 15 running dev mode with turbopack START
    'import-in-the-middle',
    'require-in-the-middle',
    // Libs are needed for nextjs 15 running dev mode with turbopack END,
    'eslint-config-next',
  ],
}

export default config
