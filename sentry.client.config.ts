// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
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

    if (
      event.message &&
      event.message.startsWith(
        'SecurityError: Failed to register a ServiceWorker',
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
