import type { TCurrency } from '@/app/lib/types'

import {
  DEFAULT_CURRENCY_CODE,
  DEFAULT_CURRENCY_NAME,
  DEFAULT_CURRENCY_SIGN,
} from './main'

export enum CURRENCY_NAME {
  AED = 'United Arab Emirates Dirham',
  BRL = 'Brazilian Real',
  CAD = 'Canadian Dollar',
  CNY = 'Chinese Yuan',
  EUR = 'Euro',
  GBP = 'British Pound',
  HKD = 'Hong Kong Dollar',
  HUF = 'Hungarian Forint',
  IDR = 'Indonesian Rupiah',
  INR = 'Indian Rupee',
  JPY = 'Japanese Yen',
  PLN = 'Polish Zloty',
  UAH = 'Ukrainian Hryvnia',
  USD = 'United States Dollar',
}

export enum CURRENCY_CODE {
  AED = 'AED',
  BRL = 'BRL',
  CAD = 'CAD',
  CNY = 'CNY',
  EUR = 'EUR',
  GBP = 'GBP',
  HKD = 'HKD',
  HUF = 'HUF',
  IDR = 'IDR',
  INR = 'INR',
  JPY = 'JPY',
  PLN = 'PLN',
  UAH = 'UAH',
  USD = 'USD',
}

export enum CURRENCY_SIGN {
  AED = 'د.إ',
  BRL = 'R$',
  CAD = 'C$',
  CNY = '¥',
  EUR = '€',
  GBP = '£',
  HKD = 'HK$',
  HUF = 'Ft',
  IDR = 'Rp',
  INR = '₹',
  JPY = '¥',
  PLN = 'zł',
  UAH = '₴',
  USD = '$',
}

// Alphabetically sorted.
export const CURRENCIES_LIST: TCurrency[] = Object.keys(CURRENCY_CODE)
  .map((key) => ({
    name: CURRENCY_NAME[key as keyof typeof CURRENCY_NAME],
    code: CURRENCY_CODE[key as keyof typeof CURRENCY_CODE],
    sign: CURRENCY_SIGN[key as keyof typeof CURRENCY_SIGN],
  }))
  .toSorted((a, b) => a.name.localeCompare(b.name))

export const CURRENCIES_MAP: Record<CURRENCY_NAME, TCurrency> = Object.keys(
  CURRENCY_NAME,
).reduce(
  (acc, key) => {
    const name = CURRENCY_NAME[key as keyof typeof CURRENCY_NAME]
    const code = CURRENCY_CODE[key as keyof typeof CURRENCY_CODE]
    const sign = CURRENCY_SIGN[key as keyof typeof CURRENCY_SIGN]

    acc[name] = { name, code, sign }

    return acc
  },
  {} as Record<CURRENCY_NAME, TCurrency>,
)

export const getCurrencyData = (code: CURRENCY_NAME): TCurrency => {
  return (
    CURRENCIES_MAP[code] ?? {
      name: DEFAULT_CURRENCY_NAME,
      code: DEFAULT_CURRENCY_CODE,
      sign: DEFAULT_CURRENCY_SIGN,
    }
  )
}
