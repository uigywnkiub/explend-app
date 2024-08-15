// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
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

  // Uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: process.env.NODE_ENV === 'development',
})
