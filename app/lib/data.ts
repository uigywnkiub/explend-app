import DEFAULT_CATEGORIES from '@/public/data/default-categories.json'
import { getLocalTimeZone } from '@internationalized/date'
import {
  endOfDay,
  endOfMonth,
  endOfToday,
  formatISO,
  isWithinInterval,
  startOfMonth,
  startOfToday,
} from 'date-fns'

import { getCategoryWithoutEmoji, toCalendarDate } from './helpers'
import type {
  TCategories,
  TCategoryData,
  TChartData,
  TTransaction,
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
  const totalsByCategory = calculateTotalsByCategory(expense)

  // Do raw sorting data first to improve performance in some cases.
  const sortedEntries = Object.entries(totalsByCategory).sort(
    ([, spentA], [, spentB]) => spentB - spentA,
  )

  const monthlyReportData: TCategoryData[] = sortedEntries.map(
    ([category, spent]) => {
      let percentage = ((spent / totalExpense) * 100).toFixed(2)
      if (percentage.endsWith('.00')) {
        percentage = percentage.slice(0, -3)
      }

      return {
        category,
        spent,
        percentage,
      }
    },
  )

  return { totalIncome, totalExpense, monthlyReportData }
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

export const getFirstAndLastTransactions = (transactions: TTransaction[]) => {
  // Use for method O(n) complexity instead of sort method O(n log n).
  let firstTransaction = transactions[0]
  let lastTransaction = transactions[0]

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

  return { firstTransaction, lastTransaction }
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

// export const getTransactionArrayByKey = <
//   TTransaction,
//   TKey extends keyof Pick<
//     TTransaction,
//     // @ts-expect-error - Type 'string' does not satisfy the constraint 'keyof TTransaction'
//     'categories' | 'categoryLimits' | 'subscriptions'
//   >,
// >(
//   transactions: TTransaction[],
//   key: TKey,
//   // @ts-expect-error - Type 'TKey' cannot be used to index type 'TTransaction'.
// ): TTransaction[TKey] extends Array<unknown> ? TTransaction[TKey] : never => {
//   return (
//     // @ts-expect-error - Type 'TKey' cannot be used to index type 'NonNullable<TTransaction>'.
//     transactions.find((t) => Array.isArray(t[key]) && t[key].length > 0)?.[
//       key
//     ] ?? [] // Default to an empty array if not found or not valid
//   )
// }
