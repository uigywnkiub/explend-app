import toast from 'react-hot-toast'

import config from '@/tailwind.config'
import { CalendarDate } from '@internationalized/date'
import { type ClassValue, clsx } from 'clsx'
import {
  format,
  getDate,
  getMonth,
  getYear,
  isToday,
  isYesterday,
} from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'
import emojiRegex from 'emoji-regex'
import { extendTailwindMerge } from 'tailwind-merge'
import defaultTheme from 'tailwindcss/defaultTheme'

import { CURRENCY_CODE, DEFAULT_CATEGORY } from '@/config/constants/main'

import type {
  TBrowserName,
  TGetTransactions,
  THTMLElement,
  TTransaction,
} from './types'

const customTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': Object.keys(config?.theme?.extend?.fontSize!).map(
        (key) => `text-${key}`,
      ),
    },
  },
})
export const cn = (...args: ClassValue[]) => {
  return customTwMerge(clsx(args))
}

export const getBreakpointWidth = (
  breakpoint: keyof typeof defaultTheme.screens,
): string => {
  return `(min-width: ${defaultTheme.screens[breakpoint]})`
}

export const capitalizeFirstLetter = (str: string): string => {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const getEmojiFromCategory = (
  category: TTransaction['category'],
): string => {
  const regex = emojiRegex()
  const match = category.match(regex)
  return match ? match[0] : ''
}

export const getCategoryWithoutEmoji = (
  category: TTransaction['category'],
): string => {
  const regex = emojiRegex()
  // Replace the emoji(s) at the beginning of the category with an empty string
  return category.replace(regex, '').trim()
}

export const getSlicedCurrencyCode = (code: CURRENCY_CODE): string => {
  return code.toLocaleLowerCase().slice(0, 2)
}

export const getTransactionsWithChangedCategory = (
  transactions: TTransaction[],
): TTransaction[] => {
  return transactions.filter((t) => {
    // This will throw an error on previous user transactions without a categories array. Catch and handle this approach achieves by resetCategories function uses before the current function.
    try {
      return !t.categories.some((category) => {
        return category.items.some(
          (item) => `${item.emoji} ${item.name}` === t.category,
        )
      })
    } catch (err) {
      // Do not throw any error, it is auto-handle to avoid showing a user error page.
    }
  })
}

export const formatDate = (dateStr: Date) => {
  const date = new Date(dateStr)
  const currentYear = new Date().getFullYear()
  const dateYear = date.getFullYear()

  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  if (dateYear !== currentYear) return format(date, 'EEEE, MMMM d, yyyy')
  return format(date, 'EEEE, MMMM d')
}

export const formatTime = (dateStr: Date) => {
  const date = new Date(dateStr)
  return format(date, 'HH:mm')
}

export const getCategoryWithEmoji = (
  category: FormDataEntryValue | null | undefined,
  categories: TTransaction['categories'],
): string => {
  if (
    typeof category !== 'string' ||
    category === null ||
    category === undefined
  ) {
    return DEFAULT_CATEGORY
  }
  for (const categoryGroup of categories) {
    const foundCategory = categoryGroup.items.find(
      (item) => item.name === category,
    )
    if (foundCategory) {
      return `${foundCategory.emoji} ${category}`
    }
  }
  return category
}

export const toNumber = (value: number | string | null) => {
  return value == null ? NaN : Number(value)
}

export const getFormattedCurrency = (value: number | string | null) => {
  const numericValue = toNumber(value)
  if (isNaN(numericValue)) return ''
  const formattedNumber = new Intl.NumberFormat('de-DE').format(numericValue)
  return formattedNumber.replace(/\./g, ' ')
}

export const getFormattedBalance = (balance: TTransaction['balance']) => {
  const formattedCurrency = getFormattedCurrency(balance)
  return Number(balance) < 0
    ? `- ${formattedCurrency.slice(1)}`
    : formattedCurrency
}

export const calculateEntryRange = (
  page: number | string | null,
  limit: number | string | null,
  totalEntries: TGetTransactions['totalEntries'] | string | null,
) => {
  const parsedPage = toNumber(page)
  const parsedLimit = toNumber(limit)
  const parsedTotalEntries = toNumber(totalEntries)
  const startEntry = (parsedPage - 1) * parsedLimit + 1
  const endEntry = Math.min(parsedPage * parsedLimit, parsedTotalEntries)
  return { startEntry, endEntry }
}

export const copyToClipboard = async (
  successTitle: string,
  errorTitle: string,
  ref?: React.RefObject<THTMLElement>,
  text?: string,
): Promise<void> => {
  const content = text || ref?.current?.textContent || ''

  if (!content) {
    toast.error(errorTitle)
    return
  }
  try {
    await navigator.clipboard.writeText(content)
    toast.success(successTitle)
  } catch (err) {
    toast.error(errorTitle)
  }
}

export const toCalendarDate = (date: Date) => {
  return new CalendarDate(getYear(date), getMonth(date) + 1, getDate(date))
}

export const getGreeting = (timeZoneIANA: string): string => {
  const currentHour = formatInTimeZone(new Date(), timeZoneIANA, 'HH')
  const parsedHour = parseInt(currentHour, 10)

  if (parsedHour < 12) {
    return 'Good morning'
  } else if (parsedHour < 18) {
    return 'Good afternoon'
  } else if (parsedHour < 22) {
    return 'Good evening'
  } else {
    return 'Good night'
  }
}

const deepEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return true // If both values are strictly equal, they are deeply equal.

  if (
    typeof obj1 !== 'object' ||
    obj1 === null ||
    typeof obj2 !== 'object' ||
    obj2 === null
  ) {
    return false // If either value is not an object or is null, they are not deeply equal.
  }

  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)

  if (keys1.length !== keys2.length) {
    return false // If the objects have different numbers of keys, they are not deeply equal.
  }

  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false // If the keys or their values are not deeply equal, return false.
    }
  }

  return true // If all keys and values are deeply equal, return true.
}
export const deepCompareArrays = (array1: any[], array2: any[]): boolean => {
  if (array1.length !== array2.length) {
    return false // If the arrays have different lengths, they are not identical.
  }

  for (let i = 0; i < array1.length; i++) {
    if (!deepEqual(array1[i], array2[i])) {
      return false // If any elements are not deeply equal, the arrays are not identical.
    }
  }

  return true // If all elements are deeply equal, the arrays are identical.
}

export const pluralize = (
  count: number,
  singular: string,
  plural: string,
): string => {
  const pluralRules = new Intl.PluralRules('en-US')
  const pluralCategory = pluralRules.select(count)
  return pluralCategory === 'one' || pluralCategory === 'zero' || count === 0
    ? singular
    : plural
}

// export const getBrowserName = (userAgent: string | null): TBrowserName => {
//   if (!userAgent) return 'Unknown'

//   if (/Edg/.test(userAgent)) {
//     return 'Edge' // Edge
//   } else if (/OPR/.test(userAgent) || /Opera/.test(userAgent)) {
//     return 'Opera' // Opera
//   } else if (/Firefox/.test(userAgent)) {
//     return 'Firefox' // Firefox
//   } else if (/Chrome/.test(userAgent) && !/Edg/.test(userAgent)) {
//     return 'Chrome' // Chrome
//   } else if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) {
//     return 'Safari' // Safari
//   } else {
//     return 'Unknown' // Unknown or unrecognized browser
//   }
// }
