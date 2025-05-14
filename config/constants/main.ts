import { MetadataRoute } from 'next/types'

import type { TTheme } from '@/app/lib/types'

export const IS_PROD = process.env.NODE_ENV === 'production'

export const DEFAULT_CATEGORY: string = 'Unknown'
export const DEFAULT_CATEGORY_EMOJI: string = '🤔'
export const DEFAULT_ICON_SIZE: number = 18
export const DEFAULT_TIME_ZONE: string = 'Europe/Kiev'
export const DEFAULT_LANG: string = 'en'
export const DEFAULT_DIR: MetadataRoute.Manifest['dir'] = 'ltr'
export const DEFAULT_THEME: TTheme = 'dark'
export const DEFAULT_LOADING_TEXT: string = 'Just a second...'

export const HIDDEN_AMOUNT_SIGN = '✱'

export const enum CURRENCY_NAME {
  UAH = 'Ukrainian Hryvnia',
  USD = 'United States Dollar',
  EUR = 'Euro',
  GBP = 'British Pound',
  CAD = 'Canadian Dollar',
  AED = 'United Arab Emirates',
  INR = 'Indian Rupee',
  IDR = 'Indonesian Rupiah',
  BRL = 'Brazilian Real',
  HKD = 'Hong Kong Dollar',
  CNY = 'Chinese Yuan',
  HUF = 'Hungarian Forint',
  PLN = 'Polish Zloty',
}
export const enum CURRENCY_CODE {
  UAH = 'UAH',
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  CAD = 'CAD',
  AED = 'AED',
  INR = 'INR',
  IDR = 'IDR',
  BRL = 'BRL',
  HKD = 'HKD',
  CNY = 'CNY',
  HUF = 'HUF',
  PLN = 'PLN',
}
export const enum CURRENCY_SIGN {
  UAH = '₴',
  USD = '$',
  EUR = '€',
  GBP = '£',
  CAD = 'C$',
  AED = 'د.إ',
  INR = '₹',
  IDR = 'Rp',
  BRL = 'R$',
  HKD = 'HK$',
  CNY = '¥',
  HUF = 'Ft',
  PLN = 'zł',
}
export const DEFAULT_CURRENCY_NAME = CURRENCY_NAME.USD
export const DEFAULT_CURRENCY_CODE = CURRENCY_CODE.USD
export const DEFAULT_CURRENCY_SIGN = CURRENCY_SIGN.USD

export const enum APP_NAME {
  FULL = 'Explend App',
  SHORT = 'Explend',
}
export const APP_TITLE: string = 'Your Financial Wellness Journey'
export const APP_DESCRIPTION: string =
  'Stop wondering where your money goes. Track Income & Expense with AI.'
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

export const enum AUTHOR {
  NAME = 'Volodymyr',
  URL = 'https://volodymyr-g.vercel.app',
}

const AI_SUFFIX_NAME = 'Intelligence'
export const enum AI_NAME {
  FULL = `${APP_NAME.SHORT} ${AI_SUFFIX_NAME}`,
  SUFFIX = AI_SUFFIX_NAME,
}
