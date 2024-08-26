import { endOfDay, formatISO, isWithinInterval } from 'date-fns'

import type {
  TCategoryData,
  TChartData,
  TMinMaxTransactionByDate,
  TTransaction,
} from './types'

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

export const calculateTotalAmount = (transactions: TTransaction[]) => {
  return transactions.reduce(
    (total, { amount }) => total + parseFloat(amount),
    0,
  )
}

export const calculateMonthlyReportData = (
  income: TTransaction[],
  expense: TTransaction[],
) => {
  const totalIncome = calculateTotalAmount(income)
  const totalExpense = calculateTotalAmount(expense)

  const totalsByCategory = expense.reduce(
    (totals, { category, amount }) => {
      totals[category] = (totals[category] || 0) + parseFloat(amount)
      return totals
    },
    {} as Record<string, number>,
  )

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

export const getMinMaxTransactionsByDate = (
  transactions: TTransaction[],
): TMinMaxTransactionByDate => {
  return transactions.reduce<TMinMaxTransactionByDate>(
    (acc, transaction) => {
      if (
        !acc.minTransaction ||
        transaction.createdAt < acc.minTransaction.createdAt
      ) {
        acc.minTransaction = transaction
      }
      if (
        !acc.maxTransaction ||
        transaction.createdAt > acc.maxTransaction.createdAt
      ) {
        acc.maxTransaction = transaction
      }
      return acc
    },
    { minTransaction: null, maxTransaction: null },
  )
}
