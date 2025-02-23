import { describe, expect, it } from 'vitest'

import {
  CURRENCY_CODE,
  CURRENCY_NAME,
  CURRENCY_SIGN,
} from '@/config/constants/main'

import { calculateMonthlyReportData } from '../../app/lib/data'
import type { TExpenseReport, TTransaction } from '../../app/lib/types'

describe('calculateMonthlyReportData', () => {
  const createTransaction = (
    id: TTransaction['id'],
    category: TTransaction['category'],
    amount: TTransaction['amount'],
    isIncome: TTransaction['isIncome'],
  ): TTransaction => ({
    id,
    userId: 'user1@test.com',
    category,
    amount,
    isIncome,
    currency: {
      name: CURRENCY_NAME.UAH,
      code: CURRENCY_CODE.UAH,
      sign: CURRENCY_SIGN.UAH,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    categories: [],
    categoryLimits: undefined,
    subscriptions: [],
    description: '',
    balance: '',
    transactionLimit: undefined,
    isEdited: false,
    isSubscription: false,
  })

  it('calculates total income and total expense correctly', () => {
    const income = [createTransaction('1', 'Salary', '1000', true)]
    const expense = [createTransaction('2', 'Groceries', '200', false)]

    const result = calculateMonthlyReportData(income, expense)
    expect(result.totalIncome).toBe(1000)
    expect(result.totalExpense).toBe(200)
  })

  it('calculates totals by category correctly', () => {
    const expense = [
      createTransaction('1', 'Groceries', '200', false),
      createTransaction('2', 'Transport', '100', false),
      createTransaction('3', 'Groceries', '150', false),
    ]

    const result = calculateMonthlyReportData([], expense)
    const expectedReportData: TExpenseReport[] = [
      { category: 'Groceries', spent: 350, percentage: '77.78' },
      { category: 'Transport', spent: 100, percentage: '22.22' },
    ]

    expect(result.expenseReportData).toEqual(expectedReportData)
  })

  it('handles zero expenses', () => {
    const income = [createTransaction('1', 'Salary', '1000', true)]

    const result = calculateMonthlyReportData(income, [])
    expect(result.totalIncome).toBe(1000)
    expect(result.totalExpense).toBe(0)
    expect(result.expenseReportData).toEqual([])
  })

  it('handles zero income transactions', () => {
    const expense = [createTransaction('1', 'Groceries', '200', false)]

    const result = calculateMonthlyReportData([], expense)
    expect(result.totalIncome).toBe(0)
    expect(result.totalExpense).toBe(200)
  })
})
