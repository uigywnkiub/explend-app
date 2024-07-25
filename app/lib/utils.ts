import toast from 'react-hot-toast'

import { CalendarDate } from '@internationalized/date'
import {
  format,
  getDate,
  getMonth,
  getYear,
  isToday,
  isYesterday,
} from 'date-fns'

import { CURRENCY_CODE, DEFAULT_CATEGORY } from '@/config/constants/main'

import type { TGetTransactions, THTMLElement, TTransaction } from './types'

export const capitalizeFirstLetter = (str: string) => {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const getEmojiFromCategory = (category: TTransaction['category']) => {
  return category.slice(0, 2)
}

export const getCategoryWithoutEmoji = (category: TTransaction['category']) => {
  return category.slice(3).trim()
}

export const getSlicedCurrencyCode = (code: CURRENCY_CODE) => {
  return code.toLocaleLowerCase().slice(0, 2)
}

export const getTransactionsWithChangedCategory = (
  transactions: TTransaction[],
): TTransaction[] => {
  return transactions.filter((t) => {
    return !t.categories.some((category) => {
      return category.items.some(
        (item) => `${item.emoji} ${item.name}` === t.category,
      )
    })
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
  category: FormDataEntryValue | null,
  categories: TTransaction['categories'],
): string => {
  if (typeof category !== 'string' || category === null) {
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
