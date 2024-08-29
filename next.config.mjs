// @ts-check
import withPWAInit from '@ducanh2912/next-pwa'
import { withSentryConfig } from '@sentry/nextjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com', // Google
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.githubusercontent.com', // GitHub
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, _options) => {
    // Grab the existing rule that handles SVG imports.
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.('.svg'),
    )

    config.module.rules.push(
      // Reapply the existing rule, but only for svg imports ending in ?url
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      // Convert all other *.svg imports to React components.
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
        use: ['@svgr/webpack'],
      },
    )

    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    fileLoaderRule.exclude = /\.svg$/i

    return config
  },
  experimental: {
    turbo: {
      resolveExtensions: [
        '.mdx',
        '.tsx',
        '.ts',
        '.jsx',
        '.js',
        '.mjs',
        '.json',
      ],
    },
    optimizePackageImports: [
      '@ducanh2912/next-pwa',
      '@nextui-org/react',
      '@sentry/nextjs',
      'framer-motion',
    ],
  },
}

const withPWA = withPWAInit({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  extendDefaultRuntimeCaching: true,
  disable: process.env.NODE_ENV === 'development',
})

const sentryConfig = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: 'explend-app',
  project: 'explend-app',

  // Only print logs for uploading source maps in CI.
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time).
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: '/monitoring',

  // Hides source maps from generated client bundles.
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size.
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  // automaticVercelMonitors: true,
}

export default withSentryConfig(withPWA(nextConfig), sentryConfig)
