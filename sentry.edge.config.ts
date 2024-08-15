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
import { ROUTE } from './config/constants/routes'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Enable Sentry only in production mode
  enabled: true,

  // denyUrls: [
  //   REGEX_APP_PREVIEW_PROD_URL,
  //   APP_URL + '/sw.js',
  //   APP_URL + ROUTE.SIGNIN,
  // ],

  // @ts-ignore
  beforeSend(event, hint) {
    console.log('event', event)
    console.log('hint', hint)
    return event
  },

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
})
