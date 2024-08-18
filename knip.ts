import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  ignore: ['./app/sw.{js,ts}', './config/constants/colors.ts'],
  ignoreDependencies: [
    // The react-is is used by Recharts.
    'react-is',
    '@types/react-is',
    '@testing-library/dom',
    '@testing-library/react',
    'postcss',
    'serwist',
    'postcss-load-config',
  ],
}

export default config