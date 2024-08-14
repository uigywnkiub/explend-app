export const IS_PROD = process.env.NODE_ENV === 'production'

export const DEFAULT_CATEGORY: string = 'Unknown'
export const DEFAULT_ICON_SIZE: number = 18
export const DEFAULT_TIME_ZONE: string = 'Europe/Kiev'

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
export const DEFAULT_CURRENCY_CODE: string = CURRENCY_CODE.UAH
export const DEFAULT_CURRENCY_SIGN: string = CURRENCY_SIGN.UAH
export const DEFAULT_CURRENCY_NAME: string = CURRENCY_NAME.UAH

export const enum APP_NAME {
  FULL = 'Explend App',
  SHORT = 'Explend',
}
export const APP_DESCRIPTION: string =
  'Stop wondering where your money goes. Track Income & Expense.'
export const APP_URL: string = process.env.APP_URL
export const APP_LOCALHOST_URL: string = process.env.APP_LOCALHOST_URL
// This regex will match the root URL (https://explend-app.vercel.app) and any paths under it, except for /sw.js.
export const REGEX_APP_URL: RegExp =
  /^https:\/\/explend-[\w\d-]+-projects[\w\d-]*\.vercel\.app(\/.*)?$/
