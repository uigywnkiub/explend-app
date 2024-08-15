// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
import * as Sentry from '@sentry/nextjs'

import { FILTERED_SENTRY_ERROR_TEXT, IS_PROD } from './config/constants/main'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  enabled: IS_PROD,

  // Docs https://docs.sentry.io/platforms/javascript/configuration/filtering/#using-before-send
  beforeSend(event) {
    if (
      event.message &&
      Object.values(FILTERED_SENTRY_ERROR_TEXT).some((errText) =>
        event.message?.startsWith(errText),
      )
    ) {
      return null
    }

    return event
  },

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  replaysOnErrorSampleRate: 1.0,

  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration goes in here, for example:
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
})
