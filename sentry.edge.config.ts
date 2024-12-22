// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
import * as Sentry from '@sentry/nextjs'

import { IS_PROD } from './config/constants/main'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  enabled: IS_PROD,

  autoSessionTracking: IS_PROD,

  // Docs https://docs.sentry.io/platforms/javascript/configuration/filtering/#using-before-send
  // beforeSend(event) {
  //   if (
  //     event.message &&
  //     Object.values(FILTERED_SENTRY_ERROR_TEXT).some((errText) =>
  //       event.message?.startsWith(errText),
  //     )
  //   ) {
  //     return null
  //   }

  //   return event
  // },

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
})
