// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
import * as Sentry from '@sentry/nextjs'

import {
  APP_URL,
  IS_PROD,
  REGEX_APP_PREVIEW_PROD_URL,
} from './config/constants/main'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Enable Sentry only in production mode
  enabled: IS_PROD,

  denyUrls: [REGEX_APP_PREVIEW_PROD_URL.source, APP_URL + '/sw.js'],

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
})
