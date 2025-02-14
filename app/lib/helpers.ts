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
import getUserLocale from 'get-user-locale'
import { extendTailwindMerge } from 'tailwind-merge'
import defaultTheme from 'tailwindcss/defaultTheme'

import { LOCAL_STORAGE_KEY } from '@/config/constants/local-storage'
import {
  CURRENCY_CODE,
  DEFAULT_CATEGORY,
  DEFAULT_LANG,
  DEFAULT_TIME_ZONE,
} from '@/config/constants/main'
import {
  DEFAULT_PAGE_NUMBER,
  SEARCH_PARAM,
} from '@/config/constants/navigation'
import { ROUTE } from '@/config/constants/routes'

import type {
  TApproxCategory,
  TCategoriesItem,
  TCategoryData,
  TGetTransactions,
  THTMLElement,
  TRawTransaction,
  TTransaction,
} from './types'

const customTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': Object.keys(config?.theme?.extend?.fontSize || '').map(
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
): TTransaction['category'] => {
  const regex = emojiRegex()
  const match = category.match(regex)

  return match ? match[0] : ''
}

export const getCategoryWithoutEmoji = (
  category: TTransaction['category'],
): TTransaction['category'] => {
  const regex = emojiRegex()

  // Replace the emoji(s) at the beginning of the category with an empty string.
  return category.replace(regex, '').trim()
}

export const getCategoryWithEmoji = (
  category: FormDataEntryValue | null | undefined,
  categories: TTransaction['categories'],
): TTransaction['category'] => {
  if (!category || typeof category !== 'string') {
    return DEFAULT_CATEGORY
  }
  for (const { items } of categories) {
    const foundCategory = items.find((item) => item.name === category)
    if (foundCategory) {
      return `${foundCategory.emoji} ${category}`
    }
  }

  return category
}

export const toLowerCase = (str: string) => str.toLowerCase()

export const getSlicedCurrencyCode = (code: CURRENCY_CODE): string => {
  return toLowerCase(code).slice(0, 2)
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
    } catch {
      // Do not throw any error, it is auto-handle to avoid showing a user error page.
    }
  })
}

export const formatDate = (dateStr: Date, withoutDay: boolean = false) => {
  const date = new Date(dateStr)
  const currYear = new Date().getFullYear()
  const dateYear = date.getFullYear()

  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  if (dateYear !== currYear) {
    return withoutDay
      ? format(date, 'MMMM d, yyyy')
      : format(date, 'EEEE, MMMM d, yyyy')
  }

  return withoutDay ? format(date, 'MMMM d') : format(date, 'EEEE, MMMM d')
}

export const formatTime = (dateStr: Date): string => {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const date = new Date(dateStr)
  const formatStr = userTimeZone.includes('America') ? 'hh:mm a' : 'HH:mm'

  return formatInTimeZone(date, userTimeZone || DEFAULT_TIME_ZONE, formatStr)
}

export const toNumber = (value: number | string | null) => {
  return value === null ? NaN : Number(value)
}

export const isLocalStorageAvailable = (): boolean => {
  return typeof localStorage !== 'undefined'
}

export const getBooleanFromLocalStorage = (
  key: string,
): boolean | undefined => {
  if (!isLocalStorageAvailable()) return

  return localStorage.getItem(key) === 'true'
}

export const toggleBooleanInLocalStorage = (key: string) => {
  if (!isLocalStorageAvailable()) return

  localStorage.setItem(key, (!getBooleanFromLocalStorage(key)).toString())
}

export const setInLocalStorage = (key: string, value: string) => {
  if (!isLocalStorageAvailable()) return

  localStorage.setItem(key, value)
}

export const removeFromLocalStorage = (key: string) => {
  if (!isLocalStorageAvailable()) return

  localStorage.removeItem(key)
}

export const getFromLocalStorage = (key: string): string | null => {
  if (!isLocalStorageAvailable()) return null

  return localStorage.getItem(key)
}

export const getFormattedCurrency = (
  value: number | string | null,
  isAmountHidden: boolean = getBooleanFromLocalStorage(
    LOCAL_STORAGE_KEY.IS_AMOUNT_HIDDEN,
  ) || false,
) => {
  const numericValue = toNumber(value)
  if (isNaN(numericValue)) return ''
  if (isAmountHidden) return '✱'.repeat(numericValue.toString().length)

  const formattedNumber = new Intl.NumberFormat('de-DE').format(numericValue)

  return formattedNumber.replace(/\./g, ' ')
}

export const getFormattedBalance = (balance: TTransaction['balance']) => {
  const formattedCurrency = getFormattedCurrency(balance)

  return Number(balance) < 0
    ? `- ${formattedCurrency.slice(1)}`
    : formattedCurrency
}

export const formatAmount = (value: string): string => {
  const rawAmount = value
    ?.replace(/\s/g, '')
    ?.replace(',', '.')
    ?.replace(/^0+/, '')

  return rawAmount
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
  ref?: React.RefObject<THTMLElement | null>,
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
  } catch {
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

const deepEqual = <T>(obj1: T, obj2: T): boolean => {
  if (obj1 === obj2) return true // If both values are strictly equal, they are deeply equal.

  if (
    typeof obj1 !== 'object' ||
    obj1 === null ||
    typeof obj2 !== 'object' ||
    obj2 === null
  ) {
    return false // If either value is not an object or is null, they are not deeply equal.
  }

  const keys1 = Object.keys(obj1 as object)
  const keys2 = Object.keys(obj2 as object)

  if (keys1.length !== keys2.length) {
    return false // If the objects have different numbers of keys, they are not deeply equal.
  }

  for (const key of keys1) {
    if (
      !keys2.includes(key) ||
      !deepEqual(
        (obj1 as Record<string, unknown>)[key],
        (obj2 as Record<string, unknown>)[key],
      )
    ) {
      return false // If the keys or their values are not deeply equal, return false.
    }
  }

  return true // If all keys and values are deeply equal, return true.
}
export const deepCompareArrays = <T>(arr1: T[], arr2: T[]): boolean => {
  if (arr1.length !== arr2.length) {
    return false // If the arrays have different lengths, they are not identical.
  }

  for (let i = 0; i < arr1.length; i++) {
    if (!deepEqual(arr1[i], arr2[i])) {
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
  const pluralRules = new Intl.PluralRules(DEFAULT_LANG)
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

export const getCategoryItemNames = (
  categories: TTransaction['categories'],
) => {
  if (!categories) return []

  return categories
    .flatMap((subject) => subject.items.map((item) => item.name))
    .filter(Boolean) // Remove empty strings
}

export const findApproxCategoryByValue = (
  value: string,
  categories: TTransaction['categories'],
): TApproxCategory | null => {
  if (!value || !categories) return null

  const countCategoryItems = categories.flatMap(
    (subject) => subject.items,
  ).length
  const compareCharactersUntil = Math.round(countCategoryItems * 0.1)
  const searchValue = toLowerCase(value.slice(0, compareCharactersUntil))
  const rawSearchValue = toLowerCase(value)

  for (const category of categories) {
    for (let idx = 0; idx < category.items.length; idx++) {
      const item = category.items[idx]
      const itemName = toLowerCase(item.name)

      if (
        rawSearchValue.includes(itemName) ||
        itemName.startsWith(searchValue)
      ) {
        return {
          subject: category.subject,
          item,
          itemIndex: idx,
        }
      }
    }
  }

  return null
}

export const userLocale = getUserLocale({
  fallbackLocale: DEFAULT_LANG,
})

export const getExpenseCategoriesList = (
  categoriesData: TCategoryData[],
  isGetTheFirstThree = true,
) => {
  return isGetTheFirstThree
    ? categoriesData.slice(0, 3).map((c) => c.category)
    : categoriesData.map((c) => c.category)
}

export const createSearchHrefWithKeyword = (keyword: string): string => {
  return `${ROUTE.HOME}?${SEARCH_PARAM.PAGE}=${DEFAULT_PAGE_NUMBER}&${SEARCH_PARAM.QUERY}=${encodeURIComponent(keyword)}`
}

export const isValidArrayWithKeys = (
  data: unknown,
  requiredKeys: string[],
): boolean => {
  // Check if it's an array.
  if (!Array.isArray(data)) return false
  // Check if it's not empty.
  if (data.length === 0) return false

  // Validate each object in the array.
  return data.every((item) => {
    if (typeof item !== 'object' || !item) return false

    // Ensure all required keys are present and their values are strings.
    return requiredKeys.every(
      (key) => key in item && typeof item[key] === 'string',
    )
  })
}

export const sortArrayByKeyByReferenceArray = <
  T extends object,
  U extends object,
>(
  arrToSort: T[],
  refArr: U[],
  key: keyof T & keyof U, // Ensure the key exists in both types.
): T[] => {
  // Create a map of key values to their index in refArr.
  const keyOrderMap = new Map(
    refArr.map((item, idx) => [String(item[key]), idx]),
  )

  return arrToSort.toSorted((a, b) => {
    const aKey = String(a[key])
    const bKey = String(b[key])
    const aIdx = keyOrderMap.get(aKey) ?? Number.MAX_SAFE_INTEGER
    const bIdx = keyOrderMap.get(bKey) ?? Number.MAX_SAFE_INTEGER

    return aIdx - bIdx
  })
}

export const formatObjectIdToString = (
  _id: NonNullable<TRawTransaction['_id']>,
) => {
  return _id.toString()
}

export const getCategoriesMap = (
  categories: TTransaction['categories'],
): Map<string, TCategoriesItem> => {
  return new Map(
    categories.flatMap((category) =>
      category.items.map((item) => [item.name, item]),
    ),
  )
}

export const getRandomValue = <T>(
  input: T[] | Iterable<T> | string | number | boolean,
): T | null => {
  // Check for falsy input
  if (!input) return null

  // Handle boolean case
  if (typeof input === 'boolean') {
    return (Math.random() < 0.5 ? true : false) as T // Cast to T
  }

  // Handle number case
  if (typeof input === 'number') {
    return Math.floor(Math.random() * input) as T // Cast to T
  }

  // Handle string case
  if (typeof input === 'string') {
    return input[Math.floor(Math.random() * input.length)] as T // Cast to T
  }

  // Handle iterable cases
  const array = Array.from(input) // Convert iterable to array
  if (array.length === 0) return null // Handle empty iterable

  return array[Math.floor(Math.random() * array.length)]
}

export const createFormData = (data: Record<string, unknown>): FormData => {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, String(value)) // Convert non-string values to strings
  })

  return formData
}
