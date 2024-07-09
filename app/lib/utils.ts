import toast from 'react-hot-toast'

import categories from '@/public/data/categories.json'
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
  return category.slice(2).trim()
}

export const getSlicedCurrencyCode = (code: CURRENCY_CODE) => {
  return code.toLocaleLowerCase().slice(0, 2)
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
