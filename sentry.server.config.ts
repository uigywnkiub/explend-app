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

  // Enable logs to be sent to Sentry
  enableLogs: IS_PROD,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: IS_PROD,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
})
