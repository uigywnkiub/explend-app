import DEFAULT_CATEGORIES from '@/public/data/default-categories.json'
import { describe, expect, it } from 'vitest'

import {
  CURRENCY_CODE,
  CURRENCY_NAME,
  CURRENCY_SIGN,
} from '@/config/constants/main'

import { calculateMonthlyReportData } from '../../app/lib/data'
import type { TCategoryData, TTransaction } from '../../app/lib/types'

describe('calculateMonthlyReportData', () => {
  it('should calculate total income and total expense correctly', () => {
    const income: TTransaction[] = [
      {
        id: '1',
        userId: 'user1',
        category: 'Salary',
        categories: DEFAULT_CATEGORIES,
        categoryLimits: [
          {
            categoryName: 'Rent/Mortgage',
            limitAmount: '30 000',
          },
        ],
        subscriptions: [
          {
            category: '🛒 Groceries',
            description: 'Deezer Premium test',
            amount: '123',
            _id: 'test-id',
          },
        ],
        description: 'Monthly Salary',
        amount: '1000',
        isIncome: true,
        isEdited: false,
        balance: '1000',
        currency: {
          name: CURRENCY_NAME.UAH,
          code: CURRENCY_CODE.UAH,
          sign: CURRENCY_SIGN.UAH,
        },
        transactionLimit: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isSubscription: false,
      },
    ]

    const expense: TTransaction[] = [
      {
        id: '2',
        userId: 'user1',
        category: 'Groceries',
        categories: DEFAULT_CATEGORIES,
        categoryLimits: [
          {
            categoryName: 'Rent/Mortgage',
            limitAmount: '30 000',
          },
        ],
        subscriptions: [
          {
            category: '🛒 Groceries',
            description: 'Deezer Premium test',
            amount: '123',
            _id: 'test-id',
          },
        ],
        description: 'Weekly groceries',
        amount: '200',
        isIncome: false,
        isEdited: false,
        balance: '800',
        currency: {
          name: CURRENCY_NAME.UAH,
          code: CURRENCY_CODE.UAH,
          sign: CURRENCY_SIGN.UAH,
        },
        transactionLimit: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isSubscription: false,
      },
    ]

    const result = calculateMonthlyReportData(income, expense)
    expect(result.totalIncome).toBe(1000)
    expect(result.totalExpense).toBe(200)
  })

  it('should calculate totals by category correctly', () => {
    const income: TTransaction[] = []
    const expense: TTransaction[] = [
      {
        id: '1',
        userId: 'user1',
        category: 'Groceries',
        categories: DEFAULT_CATEGORIES,
        categoryLimits: [
          {
            categoryName: 'Rent/Mortgage',
            limitAmount: '30 000',
          },
        ],
        subscriptions: [
          {
            category: '🛒 Groceries',
            description: 'Deezer Premium test',
            amount: '123',
            _id: 'test-id',
          },
        ],
        description: 'Groceries',
        amount: '200',
        isIncome: false,
        isEdited: false,
        balance: '800',
        currency: {
          name: CURRENCY_NAME.UAH,
          code: CURRENCY_CODE.UAH,
          sign: CURRENCY_SIGN.UAH,
        },
        transactionLimit: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isSubscription: false,
      },
      {
        id: '2',
        userId: 'user1',
        category: 'Transport',
        categories: DEFAULT_CATEGORIES,
        categoryLimits: [
          {
            categoryName: 'Rent/Mortgage',
            limitAmount: '30 000',
          },
        ],
        subscriptions: [
          {
            category: '🛒 Groceries',
            description: 'Deezer Premium test',
            amount: '123',
            _id: 'test-id',
          },
        ],
        description: 'Bus fare',
        amount: '100',
        isIncome: false,
        isEdited: false,
        balance: '700',
        currency: {
          name: CURRENCY_NAME.UAH,
          code: CURRENCY_CODE.UAH,
          sign: CURRENCY_SIGN.UAH,
        },
        transactionLimit: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isSubscription: false,
      },
      {
        id: '3',
        userId: 'user1',
        category: 'Groceries',
        categories: DEFAULT_CATEGORIES,
        categoryLimits: [
          {
            categoryName: 'Rent/Mortgage',
            limitAmount: '30 000',
          },
        ],
        subscriptions: [
          {
            category: '🛒 Groceries',
            description: 'Deezer Premium test',
            amount: '123',
            _id: 'test-id',
          },
        ],
        description: 'More groceries',
        amount: '150',
        isIncome: false,
        isEdited: false,
        balance: '550',
        currency: {
          name: CURRENCY_NAME.UAH,
          code: CURRENCY_CODE.UAH,
          sign: CURRENCY_SIGN.UAH,
        },
        transactionLimit: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isSubscription: false,
      },
    ]

    const result = calculateMonthlyReportData(income, expense)
    const expectedMonthlyReportData: TCategoryData[] = [
      { category: 'Groceries', spent: 350, percentage: '77.78' },
      { category: 'Transport', spent: 100, percentage: '22.22' },
    ]

    expect(result.monthlyReportData).toEqual(expectedMonthlyReportData)
  })

  it('should handle zero expenses', () => {
    const income: TTransaction[] = [
      {
        id: '1',
        userId: 'user1',
        category: 'Salary',
        categories: DEFAULT_CATEGORIES,
        categoryLimits: [
          {
            categoryName: 'Rent/Mortgage',
            limitAmount: '30 000',
          },
        ],
        subscriptions: [
          {
            category: '🛒 Groceries',
            description: 'Deezer Premium test',
            amount: '123',
            _id: 'test-id',
          },
        ],
        description: 'Monthly Salary',
        amount: '1000',
        isIncome: true,
        isEdited: false,
        balance: '1000',
        currency: {
          name: CURRENCY_NAME.UAH,
          code: CURRENCY_CODE.UAH,
          sign: CURRENCY_SIGN.UAH,
        },
        transactionLimit: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isSubscription: false,
      },
    ]

    const expense: TTransaction[] = []

    const result = calculateMonthlyReportData(income, expense)
    expect(result.totalIncome).toBe(1000)
    expect(result.totalExpense).toBe(0)
    expect(result.monthlyReportData).toEqual([])
  })

  it('should handle zero income transactions', () => {
    const income: TTransaction[] = []
    const expense: TTransaction[] = [
      {
        id: '1',
        userId: 'user1',
        category: 'Groceries',
        categories: DEFAULT_CATEGORIES,
        categoryLimits: [
          {
            categoryName: 'Rent/Mortgage',
            limitAmount: '30 000',
          },
        ],
        subscriptions: [
          {
            category: '🛒 Groceries',
            description: 'Deezer Premium test',
            amount: '123',
            _id: 'test-id',
          },
        ],
        description: 'Groceries',
        amount: '200',
        isIncome: false,
        isEdited: false,
        balance: '800',
        currency: {
          name: CURRENCY_NAME.UAH,
          code: CURRENCY_CODE.UAH,
          sign: CURRENCY_SIGN.UAH,
        },
        transactionLimit: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isSubscription: false,
      },
    ]

    const result = calculateMonthlyReportData(income, expense)
    expect(result.totalIncome).toBe(0)
    expect(result.totalExpense).toBe(200)
  })

  it('should handle transactions with different currencies', () => {
    const income: TTransaction[] = [
      {
        id: '1',
        userId: 'user1',
        category: 'Salary',
        categories: DEFAULT_CATEGORIES,
        categoryLimits: [
          {
            categoryName: 'Rent/Mortgage',
            limitAmount: '30 000',
          },
        ],
        subscriptions: [
          {
            category: '🛒 Groceries',
            description: 'Deezer Premium test',
            amount: '123',
            _id: 'test-id',
          },
        ],
        description: 'Monthly Salary',
        amount: '1000',
        isIncome: true,
        isEdited: false,
        balance: '1000',
        currency: {
          name: CURRENCY_NAME.UAH,
          code: CURRENCY_CODE.UAH,
          sign: CURRENCY_SIGN.UAH,
        },
        transactionLimit: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isSubscription: false,
      },
    ]

    const expense: TTransaction[] = [
      {
        id: '2',
        userId: 'user1',
        category: 'Groceries',
        categories: DEFAULT_CATEGORIES,
        categoryLimits: [
          {
            categoryName: 'Rent/Mortgage',
            limitAmount: '30 000',
          },
        ],
        subscriptions: [
          {
            category: '🛒 Groceries',
            description: 'Deezer Premium test',
            amount: '123',
            _id: 'test-id',
          },
        ],
        description: 'Groceries',
        amount: '200',
        isIncome: false,
        isEdited: false,
        balance: '800',
        currency: {
          name: CURRENCY_NAME.UAH,
          code: CURRENCY_CODE.UAH,
          sign: CURRENCY_SIGN.UAH,
        },
        transactionLimit: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isSubscription: false,
      },
    ]

    const result = calculateMonthlyReportData(income, expense)
    expect(result.totalIncome).toBe(1000)
    expect(result.totalExpense).toBe(200)
  })

  it('should handle transactions with transaction limits', () => {
    const income: TTransaction[] = [
      {
        id: '1',
        userId: 'user1',
        category: 'Salary',
        categories: DEFAULT_CATEGORIES,
        categoryLimits: [
          {
            categoryName: 'Rent/Mortgage',
            limitAmount: '30 000',
          },
        ],
        subscriptions: [
          {
            category: '🛒 Groceries',
            description: 'Deezer Premium test',
            amount: '123',
            _id: 'test-id',
          },
        ],
        description: 'Monthly Salary',
        amount: '1000',
        isIncome: true,
        isEdited: false,
        balance: '1000',
        currency: {
          name: CURRENCY_NAME.UAH,
          code: CURRENCY_CODE.UAH,
          sign: CURRENCY_SIGN.UAH,
        },
        transactionLimit: 40,
        createdAt: new Date(),
        updatedAt: new Date(),
        isSubscription: false,
      },
    ]

    const expense: TTransaction[] = [
      {
        id: '2',
        userId: 'user1',
        category: 'Groceries',
        categories: DEFAULT_CATEGORIES,
        categoryLimits: [
          {
            categoryName: 'Rent/Mortgage',
            limitAmount: '30 000',
          },
        ],
        subscriptions: [
          {
            category: '🛒 Groceries',
            description: 'Deezer Premium test',
            amount: '123',
            _id: 'test-id',
          },
        ],
        description: 'Groceries',
        amount: '200',
        isIncome: false,
        isEdited: false,
        balance: '800',
        currency: {
          name: CURRENCY_NAME.UAH,
          code: CURRENCY_CODE.UAH,
          sign: CURRENCY_SIGN.UAH,
        },
        transactionLimit: 40,
        createdAt: new Date(),
        updatedAt: new Date(),
        isSubscription: false,
      },
    ]

    const result = calculateMonthlyReportData(income, expense)
    expect(result.totalIncome).toBe(1000)
    expect(result.totalExpense).toBe(200)
  })

  it('should handle transactions created in different time frames', () => {
    const income: TTransaction[] = [
      {
        id: '1',
        userId: 'user1',
        category: 'Salary',
        categories: DEFAULT_CATEGORIES,
        categoryLimits: [
          {
            categoryName: 'Rent/Mortgage',
            limitAmount: '30 000',
          },
        ],
        subscriptions: [
          {
            category: '🛒 Groceries',
            description: 'Deezer Premium test',
            amount: '123',
            _id: 'test-id',
          },
        ],
        description: 'Monthly Salary',
        amount: '1000',
        isIncome: true,
        isEdited: false,
        balance: '1000',
        currency: {
          name: CURRENCY_NAME.UAH,
          code: CURRENCY_CODE.UAH,
          sign: CURRENCY_SIGN.UAH,
        },
        transactionLimit: 30,
        createdAt: new Date('2024-07-01'),
        updatedAt: new Date('2024-07-01'),
        isSubscription: false,
      },
    ]

    const expense: TTransaction[] = [
      {
        id: '2',
        userId: 'user1',
        category: 'Groceries',
        categories: DEFAULT_CATEGORIES,
        categoryLimits: [
          {
            categoryName: 'Rent/Mortgage',
            limitAmount: '30 000',
          },
        ],
        subscriptions: [
          {
            category: '🛒 Groceries',
            description: 'Deezer Premium test',
            amount: '123',
            _id: 'test-id',
          },
        ],
        description: 'Groceries',
        amount: '200',
        isIncome: false,
        isEdited: false,
        balance: '800',
        currency: {
          name: CURRENCY_NAME.UAH,
          code: CURRENCY_CODE.UAH,
          sign: CURRENCY_SIGN.UAH,
        },
        transactionLimit: 30,
        createdAt: new Date('2024-08-01'),
        updatedAt: new Date('2024-08-01'),
        isSubscription: false,
      },
    ]

    const result = calculateMonthlyReportData(income, expense)
    expect(result.totalIncome).toBe(1000)
    expect(result.totalExpense).toBe(200)
  })
})
