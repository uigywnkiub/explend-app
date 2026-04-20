import DEFAULT_CATEGORIES from '@/public/data/default-categories.json'
import { getLocalTimeZone } from '@internationalized/date'
import { parse } from 'csv-parse/sync'
import {
  endOfDay,
  endOfMonth,
  endOfToday,
  formatISO,
  isWithinInterval,
  startOfMonth,
  startOfToday,
  subMonths,
} from 'date-fns'
import * as XLSX from 'xlsx'

import {
  formatPercentage,
  getCategoryWithoutEmoji,
  toCalendarDate,
  toLowerCase,
} from './helpers'
import type {
  TBankParsedRow,
  TCategories,
  TChartData,
  TExpenseReport,
  TForecastData,
  TForecastReport,
  TImportTransactions,
  TIncomeReport,
  TMonobankCsvRow,
  TTransaction,
  TTransactionType,
} from './types'

export const calculateTotalAmount = (transactions: TTransaction[]) => {
  return transactions.reduce(
    (total, { amount }) => total + parseFloat(amount),
    0,
  )
}

export const filterTransactions = (transactions: TTransaction[]) => ({
  income: transactions.filter((t) => t.isIncome),
  expense: transactions.filter((t) => !t.isIncome),
})

export const getTransactionsTotals = (transactions: TTransaction[]) => {
  const { income, expense } = filterTransactions(transactions)

  return {
    income: calculateTotalAmount(income),
    expense: calculateTotalAmount(expense),
  }
}

export const calculateChartData = (
  income: TTransaction[],
  expense: TTransaction[],
) => {
  const accumulateByCategory = (transactions: TTransaction[]) =>
    transactions.reduce((totals, t) => {
      totals.set(
        t.category,
        (totals.get(t.category) || 0) + parseFloat(t.amount),
      )

      return totals
    }, new Map<string, number>())

  const categoryIncomeTotals = accumulateByCategory(income)
  const categoryExpenseTotals = accumulateByCategory(expense)

  const allCategories = new Set([
    ...categoryIncomeTotals.keys(),
    ...categoryExpenseTotals.keys(),
  ])

  const chartData: TChartData[] = Array.from(allCategories).map((category) => {
    const expense = categoryExpenseTotals.get(category) || 0
    const income = categoryIncomeTotals.get(category) || 0

    return {
      category,
      income,
      expense,
    }
  })

  return chartData
}

export const calculateTotalsByCategory = (
  transactions: TTransaction[],
  categoryWithoutEmoji: boolean = false,
) => {
  return transactions.reduce(
    (totals, { category, amount }) => {
      const modifiedCategory = categoryWithoutEmoji
        ? getCategoryWithoutEmoji(category)
        : category
      totals[modifiedCategory] =
        (totals[modifiedCategory] || 0) + parseFloat(amount)

      return totals
    },
    {} as Record<string, number>,
  )
}

export const calculateMonthlyReportData = (
  income: TTransaction[],
  expense: TTransaction[],
) => {
  const totalIncome = calculateTotalAmount(income)
  const totalExpense = calculateTotalAmount(expense)

  const totalsByExpenseCategory = calculateTotalsByCategory(expense)
  const totalsByIncomeCategory = calculateTotalsByCategory(income)

  // Do raw sorting data first to improve performance in some cases.
  const sortedExpenseEntries = Object.entries(totalsByExpenseCategory).sort(
    ([, spentA], [, spentB]) => spentB - spentA,
  )
  const sortedIncomeEntries = Object.entries(totalsByIncomeCategory).sort(
    ([, earnedA], [, earnedB]) => earnedB - earnedA,
  )

  const expenseReportData: TExpenseReport[] = sortedExpenseEntries.map(
    ([category, spent]) => {
      const percentage = formatPercentage((spent / totalExpense) * 100)

      return { category, spent, percentage }
    },
  )
  const incomeReportData: TIncomeReport[] = sortedIncomeEntries.map(
    ([category, earned]) => {
      const percentage = formatPercentage((earned / totalIncome) * 100)

      return { category, earned, percentage }
    },
  )

  return { totalIncome, totalExpense, expenseReportData, incomeReportData }
}

export const filterTransactionsByDateRange = (
  transactions: TTransaction[],
  startDate: Date,
  endDate: Date,
): TTransaction[] => {
  return transactions.filter((t) => {
    const transactionDate = formatISO(t.createdAt)

    return isWithinInterval(transactionDate, {
      start: startDate,
      end: endOfDay(endDate),
    })
  })
}

export const getTransactionsByCurrMonth = (transactions: TTransaction[]) => {
  const startOfMonthCalendarDate = toCalendarDate(startOfMonth(startOfToday()))
  const endOfMonthCalendarDate = toCalendarDate(endOfMonth(endOfToday()))
  const startDate = startOfMonthCalendarDate.toDate(getLocalTimeZone())
  const endDate = endOfMonthCalendarDate.toDate(getLocalTimeZone())

  return filterTransactionsByDateRange(transactions, startDate, endDate)
}

export const getTransactionsByPrevMonth = (transactions: TTransaction[]) => {
  const prevMonthStart = startOfMonth(subMonths(startOfToday(), 1))
  const prevMonthEnd = endOfMonth(subMonths(endOfToday(), 1))
  const startOfMonthCalendarDate = toCalendarDate(prevMonthStart)
  const endOfMonthCalendarDate = toCalendarDate(prevMonthEnd)
  const startDate = startOfMonthCalendarDate.toDate(getLocalTimeZone())
  const endDate = endOfMonthCalendarDate.toDate(getLocalTimeZone())

  return filterTransactionsByDateRange(transactions, startDate, endDate)
}

export const getFirstAndLastTransactions = (transactions: TTransaction[]) => {
  // Use for method O(n) complexity instead of sort method O(n log n).
  let firstTransaction: TTransaction | undefined = transactions[0]
  let lastTransaction: TTransaction | undefined = transactions[0]

  for (let i = 1; i < transactions.length; i++) {
    const currentTransaction = transactions[i]
    const currentCreatedAt = new Date(currentTransaction.createdAt)

    if (currentCreatedAt < new Date(firstTransaction.createdAt)) {
      firstTransaction = currentTransaction
    }

    if (currentCreatedAt > new Date(lastTransaction.createdAt)) {
      lastTransaction = currentTransaction
    }
  }

  if (typeof firstTransaction === 'undefined') firstTransaction = undefined
  if (typeof lastTransaction === 'undefined') lastTransaction = undefined

  return { firstTransaction, lastTransaction }
}

// Forecast related vars.
export const FORECAST_MONTHS_BACK = 6
const SMOOTHING_FACTOR = 0.4 // α for exponential smoothing (higher = more weight on recent).
const OUTLIER_CAP_MULTIPLIER = 2 // cap values at 2× the median.
const TREND_THRESHOLD = 0.05 // 5% change threshold for trend detection.

const getMedian = (values: number[]): number => {
  const sorted = [...values].filter((v) => v > 0).sort((a, b) => a - b)
  if (sorted.length === 0) return 0
  const mid = Math.floor(sorted.length / 2)

  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid]
}

const dampenOutliers = (values: number[]): number[] => {
  const median = getMedian(values)
  if (median === 0) return values
  const cap = median * OUTLIER_CAP_MULTIPLIER

  return values.map((v) => Math.min(v, cap))
}

const exponentialSmoothing = (values: number[]): number => {
  // values[0] = most recent, values[n] = oldest.
  // Reverse so we process from oldest to newest.
  const chronological = [...values].reverse()
  let smoothed = chronological[0]

  for (let i = 1; i < chronological.length; i++) {
    smoothed =
      SMOOTHING_FACTOR * chronological[i] + (1 - SMOOTHING_FACTOR) * smoothed
  }

  return smoothed
}

const detectTrend = (values: number[]): TForecastReport['trend'] => {
  // Simple linear regression on chronological values.
  const chronological = [...values].reverse()
  const n = chronological.length
  if (n < 2) return 'stable'

  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumX2 = 0
  for (let i = 0; i < n; i++) {
    sumX += i
    sumY += chronological[i]
    sumXY += i * chronological[i]
    sumX2 += i * i
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const avgValue = sumY / n

  if (avgValue === 0) return 'stable'

  // Normalize slope as percentage of average.
  const normalizedSlope = slope / avgValue

  return normalizedSlope > TREND_THRESHOLD
    ? 'up'
    : normalizedSlope < -TREND_THRESHOLD
      ? 'down'
      : 'stable'
}

export const calculateForecast = (
  transactions: TTransaction[],
  monthsBack: number = FORECAST_MONTHS_BACK,
): TForecastData => {
  const today = startOfToday()
  const currentMonthStart = startOfMonth(today)

  // Gather data for each of the last N complete months (excludes current month).
  const monthlyData: {
    expenseByCategory: Map<string, number>
    incomeByCategory: Map<string, number>
  }[] = []

  for (let i = 1; i <= monthsBack; i++) {
    const monthStart = startOfMonth(subMonths(currentMonthStart, i))
    const monthEnd = endOfMonth(monthStart)
    const startDate = toCalendarDate(monthStart).toDate(getLocalTimeZone())
    const endDate = toCalendarDate(monthEnd).toDate(getLocalTimeZone())
    const monthTransactions = filterTransactionsByDateRange(
      transactions,
      startDate,
      endDate,
    )

    const expenseByCategory = new Map<string, number>()
    const incomeByCategory = new Map<string, number>()

    for (const t of monthTransactions) {
      const amount = parseFloat(t.amount)
      const map = t.isIncome ? incomeByCategory : expenseByCategory
      map.set(t.category, (map.get(t.category) || 0) + amount)
    }

    monthlyData.push({ expenseByCategory, incomeByCategory })
  }

  const buildForecast = (
    type: TTransactionType,
  ): { forecast: TForecastReport[]; total: number } => {
    const key = type === 'expense' ? 'expenseByCategory' : 'incomeByCategory'
    const allCategories = new Set<string>()
    for (const md of monthlyData) {
      for (const cat of md[key].keys()) allCategories.add(cat)
    }

    let total = 0
    const forecasts: Omit<TForecastReport, 'percentage'>[] = []

    for (const category of allCategories) {
      // values[0] = most recent month, values[n] = oldest.
      const rawValues = monthlyData.map((md) => md[key].get(category) || 0)

      // Skip categories that only appeared once with a trivial amount.
      const nonZeroCount = rawValues.filter((v) => v > 0).length
      if (nonZeroCount === 0) continue

      // Dampen outliers before smoothing.
      const dampened = dampenOutliers(rawValues)

      // Exponential smoothing for prediction.
      const forecastAmount =
        Math.round(exponentialSmoothing(dampened) * 100) / 100

      // Linear regression trend on raw values (not dampened, to reflect real direction).
      const trend = detectTrend(rawValues)

      total += forecastAmount
      forecasts.push({ category, amount: forecastAmount, trend })
    }

    forecasts.sort((a, b) => b.amount - a.amount)

    const forecast: TForecastReport[] = forecasts.map(
      ({ category, amount, trend }) => ({
        category,
        amount,
        percentage: total > 0 ? formatPercentage((amount / total) * 100) : '0',
        trend,
      }),
    )

    return { forecast, total: Math.round(total * 100) / 100 }
  }

  const { forecast: expenseForecast, total: totalExpense } =
    buildForecast('expense')
  const { forecast: incomeForecast, total: totalIncome } =
    buildForecast('income')

  return { totalExpense, totalIncome, expenseForecast, incomeForecast }
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

export const getUserCategories = (
  transactions: TTransaction[],
): TCategories[] => {
  return (
    transactions.find(
      (t) => Array.isArray(t.categories) && t.categories.length > 0,
    )?.categories ?? DEFAULT_CATEGORIES
  )
}

export const deepCloneCategories = (
  categories: TCategories[],
): TCategories[] => {
  return categories.map((category) => ({
    ...category,
    items: category.items.map((item) => ({ ...item })),
  }))
}

export const getTransactionCountByCategory = (
  transactions: TTransaction[],
  category: TTransaction['category'],
): number => {
  const normalizedCategory = toLowerCase(getCategoryWithoutEmoji(category))

  return transactions.reduce((count, t) => {
    const normalizedTransactionCategory = toLowerCase(
      getCategoryWithoutEmoji(t.category),
    )

    return normalizedTransactionCategory === normalizedCategory
      ? count + 1
      : count
  }, 0)
}

export const parseMonobankCsv = (
  csvText: string,
): {
  rows: TBankParsedRow[]
  skipped: TImportTransactions['skipped']
} => {
  const raw: TMonobankCsvRow[] = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  })

  let skipped = 0
  const rows: TBankParsedRow[] = []

  for (const row of raw) {
    const rawAmount = parseFloat(
      row['Сума в валюті картки (UAH)']?.replace(/\s/g, '') || '',
    )
    const description = row['Деталі операції']?.trim()
    const dateStr = row['Дата i час операції']?.trim()

    if (isNaN(rawAmount) || !description || !dateStr) {
      skipped++
      continue
    }

    const [datePart, timePart] = dateStr.split(' ')
    const [day, month, year] = datePart.split('.')
    const createdAt = new Date(`${year}-${month}-${day}T${timePart}`)

    if (isNaN(createdAt.getTime())) {
      skipped++
      continue
    }

    rows.push({ rawAmount, description, createdAt, mcc: Number(row['MCC']) })
  }

  return { rows, skipped }
}

export const parsePrivat24Xlsx = (
  base64: string,
): { rows: TBankParsedRow[]; skipped: TImportTransactions['skipped'] } => {
  const buffer = Buffer.from(base64, 'base64')
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]

  // Row 0 = title, row 1 = headers, data starts at row 2.
  const raw: Record<string, string | number>[] = XLSX.utils.sheet_to_json(
    sheet,
    {
      range: 1,
      defval: '',
    },
  )

  let skipped = 0
  const rows: TBankParsedRow[] = []

  for (const row of raw) {
    const rawAmount = parseFloat(
      String(row['Сума в валюті картки'])?.replace(/\s/g, '') || '',
    )
    const description = String(row['Опис операції'])?.trim()
    const dateStr = String(row['Дата'])?.trim()

    if (isNaN(rawAmount) || !description || !dateStr) {
      skipped++
      continue
    }

    const [datePart, timePart] = dateStr.split(' ')
    const [day, month, year] = datePart.split('.')
    const createdAt = new Date(`${year}-${month}-${day}T${timePart}`)

    if (isNaN(createdAt.getTime())) {
      skipped++
      continue
    }

    rows.push({ rawAmount, description, createdAt })
  }

  return { rows, skipped }
}
