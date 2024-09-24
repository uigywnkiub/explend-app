export const IS_PROD = process.env.NODE_ENV === 'production'

export const DEFAULT_CATEGORY: string = 'Unknown'
export const DEFAULT_CATEGORY_EMOJI: string = '🤔'
export const DEFAULT_ICON_SIZE: number = 18
export const DEFAULT_TIME_ZONE: string = 'Europe/Kiev'
export const DEFAULT_LANG: string = 'en'
export const DEFAULT_DIR = 'ltr'

export const enum CURRENCY_NAME {
  UAH = 'Ukrainian Hryvnia',
  USD = 'United States Dollar',
  EUR = 'Euro',
}
export const enum CURRENCY_CODE {
  UAH = 'UAH',
  USD = 'USD',
  EUR = 'EUR',
}
export const enum CURRENCY_SIGN {
  UAH = '₴',
  USD = '$',
  EUR = '€',
}
export const DEFAULT_CURRENCY_CODE: string = CURRENCY_CODE.USD
export const DEFAULT_CURRENCY_SIGN: string = CURRENCY_SIGN.USD
export const DEFAULT_CURRENCY_NAME: string = CURRENCY_NAME.USD

export const enum APP_NAME {
  FULL = 'Explend App',
  SHORT = 'Explend',
}
export const APP_TITLE: string = 'Your Financial Wellness Journey'
export const APP_DESCRIPTION: string =
  'Stop wondering where your money goes. Track Income & Expense.'
export const APP_URL: string = process.env.APP_URL
export const APP_LOCALHOST_URL: string = process.env.APP_LOCALHOST_URL
// This regex will match any URL that starts with https://explend-, followed by any alphanumeric and hyphenated string, and ends with -projects.vercel.app.
// export const REGEX_APP_PREVIEW_PROD_URL: RegExp =
//   /^https:\/\/explend-[\w\d-]+-projects[\w\d-]*\.vercel\.app(\/.*)?$/

// export const FILTERED_SENTRY_ERROR_TEXT = {
//   // Skip error if the user has no authentication because on the sign-in page service worker can’t run.
//   SECURITY_ERROR: 'SecurityError: Failed to register a ServiceWorker for scope',
//   SECURITY_ERROR_SCRIPT: `Script ${APP_URL}/sw.js load failed`,
// }

export const AUTHOR_NAME: string = 'Volodymyr'
export const AUTHOR_URL: string = 'https://volodymyr-g.vercel.app'

const AI_SUFFIX_NAME = 'Intelligence'
export const enum AI_NAME {
  FULL = `${APP_NAME.SHORT} ${AI_SUFFIX_NAME}`,
  SUFFIX = AI_SUFFIX_NAME,
}
