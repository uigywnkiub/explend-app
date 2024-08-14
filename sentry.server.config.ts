// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
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

  denyUrls: [REGEX_APP_PREVIEW_PROD_URL, APP_URL + '/sw.js'],

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: process.env.NODE_ENV === 'development',
})
