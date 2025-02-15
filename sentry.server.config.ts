// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
import * as Sentry from '@sentry/nextjs'

import { IS_PROD } from './config/constants/main'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  enabled: IS_PROD,

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

  // Uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: process.env.NODE_ENV === 'development',
})
