import { startOfMonth, subMonths } from 'date-fns'
import { describe, expect, it } from 'vitest'

import {
  DEFAULT_CURRENCY_CODE,
  DEFAULT_CURRENCY_NAME,
  DEFAULT_CURRENCY_SIGN,
  DEFAULT_SALARY_DAY,
} from '@/config/constants/main'

import { calculateForecast, FORECAST_MONTHS_BACK } from '../../app/lib/data'
import type { TForecastReport, TTransaction } from '../../app/lib/types'

// ─── Date helpers ─────────────────────────────────────────────────────────────

/**
 * Returns the 15th of the Nth most recent complete month.
 * Using the 15th avoids timezone edge-cases near month boundaries.
 */
const dateInPastMonth = (month: number): Date => {
  const start = startOfMonth(subMonths(new Date(), month))
  return new Date(start.getFullYear(), start.getMonth(), 15)
}

// ─── Transaction factory ──────────────────────────────────────────────────────

const buildTransaction = (
  overrides: Pick<TTransaction, 'id' | 'category' | 'amount' | 'isIncome'> & {
    date: Date
  },
): TTransaction => ({
  userId: 'user1@test.com',
  categories: [],
  categoryLimits: undefined,
  subscriptions: [],
  images: [],
  description: '',
  balance: '',
  transactionLimit: undefined,
  salaryDay: DEFAULT_SALARY_DAY,
  isEdited: false,
  isSubscription: false,
  isTest: false,
  currency: {
    name: DEFAULT_CURRENCY_NAME,
    code: DEFAULT_CURRENCY_CODE,
    sign: DEFAULT_CURRENCY_SIGN,
  },
  createdAt: overrides.date,
  updatedAt: overrides.date,
  id: overrides.id,
  category: overrides.category,
  amount: overrides.amount,
  isIncome: overrides.isIncome,
})

// ─── Series builders ──────────────────────────────────────────────────────────

/**
 * Fills every month 1..n with the same amount.
 * id uses the month number so combining multiple calls never produces duplicate ids.
 */
const expenseFilled = (
  category: string,
  monthsBack: number,
  amount: number,
): TTransaction[] =>
  Array.from({ length: monthsBack }, (_, i) =>
    buildTransaction({
      id: `${category}-m${i + 1}`,
      category,
      amount: String(amount),
      isIncome: false,
      date: dateInPastMonth(i + 1),
    }),
  )

/**
 * Builds expense transactions for explicit [month, amount] pairs.
 * id = category + month so mixing with expenseFilled never collides.
 */
const expensePerMonth = (
  category: string,
  entries: [month: number, amount: number][],
): TTransaction[] =>
  entries.map(([month, amount]) =>
    buildTransaction({
      id: `${category}-m${month}`,
      category,
      amount: String(amount),
      isIncome: false,
      date: dateInPastMonth(month),
    }),
  )

const incomePerMonth = (
  category: string,
  entries: [month: number, amount: number][],
): TTransaction[] =>
  entries.map(([month, amount]) =>
    buildTransaction({
      id: `${category}-income-m${month}`,
      category,
      amount: String(amount),
      isIncome: true,
      date: dateInPastMonth(month),
    }),
  )

/**
 * Builds a rising expense series of exactly FORECAST_MONTHS_BACK months.
 * month=1 (newest) = highAmount, month=N (oldest) = lowAmount.
 * No value exceeds 2× any other, so dampening is a no-op for any cap multiplier ≥ 1.5.
 */
const risingExpense = (
  category: string,
  { low = 100, high = 500 } = {},
): TTransaction[] =>
  Array.from({ length: FORECAST_MONTHS_BACK }, (_, i) => {
    const month = i + 1
    const steps = Math.max(FORECAST_MONTHS_BACK - 1, 1)
    const amount = Math.round(high - ((high - low) / steps) * i)
    return buildTransaction({
      id: `${category}-m${month}`,
      category,
      amount: String(amount),
      isIncome: false,
      date: dateInPastMonth(month),
    })
  })

/**
 * Builds a falling expense series of exactly FORECAST_MONTHS_BACK months.
 * month=1 (newest) = lowAmount, month=N (oldest) = highAmount.
 */
const fallingExpense = (
  category: string,
  { low = 100, high = 500 } = {},
): TTransaction[] =>
  Array.from({ length: FORECAST_MONTHS_BACK }, (_, i) => {
    const month = i + 1
    const steps = Math.max(FORECAST_MONTHS_BACK - 1, 1)
    const amount = Math.round(low + ((high - low) / steps) * i)
    return buildTransaction({
      id: `${category}-m${month}`,
      category,
      amount: String(amount),
      isIncome: false,
      date: dateInPastMonth(month),
    })
  })

// ─── Shared assertions ────────────────────────────────────────────────────────

const isSortedDesc = (entries: TForecastReport[]): boolean =>
  entries.every((e, i) => i === 0 || entries[i - 1].amount >= e.amount)

const sumPercentages = (entries: TForecastReport[]): number =>
  entries.reduce((sum, e) => sum + parseFloat(e.percentage), 0)

const sumAmounts = (entries: TForecastReport[]): number =>
  entries.reduce((sum, e) => sum + e.amount, 0)

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('calculateForecast', () => {
  // ── Parameterised over monthsBack 1–FORECAST_MONTHS_BACK ─────────────────
  //
  // Core contract: every value from 1 to FORECAST_MONTHS_BACK must work correctly.
  // Change the constant in source → these tests adapt automatically.

  describe('parameterised over monthsBack 1–N', () => {
    const VALID_MONTHS_BACK = Array.from(
      { length: FORECAST_MONTHS_BACK },
      (_, i) => i + 1,
    )

    it.each(VALID_MONTHS_BACK)(
      'monthsBack=%i — forecast entry present with a positive amount',
      (monthsBack) => {
        const result = calculateForecast(
          expenseFilled('Groceries', monthsBack, 300),
          monthsBack,
        )

        expect(result.expenseForecast).toHaveLength(1)
        expect(result.expenseForecast[0].category).toBe('Groceries')
        expect(result.expenseForecast[0].amount).toBeGreaterThan(0)
      },
    )

    it.each(VALID_MONTHS_BACK)(
      'monthsBack=%i — constant series forecasts to that constant',
      // α·C + (1-α)·C = C for any α — flat data is always a fixed point.
      (monthsBack) => {
        const amount = 300
        const result = calculateForecast(
          expenseFilled('Utilities', monthsBack, amount),
          monthsBack,
        )

        expect(result.expenseForecast[0].amount).toBeCloseTo(amount, 1)
      },
    )

    it.each(VALID_MONTHS_BACK)(
      'monthsBack=%i — totalExpense equals sum of forecast entry amounts',
      (monthsBack) => {
        const transactions = [
          ...expenseFilled('Groceries', monthsBack, 300),
          ...expenseFilled('Rent', monthsBack, 800),
        ]
        const result = calculateForecast(transactions, monthsBack)

        expect(result.totalExpense).toBeCloseTo(
          sumAmounts(result.expenseForecast),
          2,
        )
      },
    )

    it.each(VALID_MONTHS_BACK)(
      'monthsBack=%i — expense percentages sum to ~100',
      (monthsBack) => {
        const transactions = [
          ...expenseFilled('Groceries', monthsBack, 300),
          ...expenseFilled('Transport', monthsBack, 100),
          ...expenseFilled('Rent', monthsBack, 600),
        ]
        const result = calculateForecast(transactions, monthsBack)

        expect(sumPercentages(result.expenseForecast)).toBeCloseTo(100, 0)
      },
    )

    it.each(VALID_MONTHS_BACK)(
      'monthsBack=%i — entries sorted by amount descending',
      (monthsBack) => {
        const transactions = [
          ...expenseFilled('Transport', monthsBack, 100),
          ...expenseFilled('Rent', monthsBack, 800),
          ...expenseFilled('Groceries', monthsBack, 300),
        ]

        expect(
          isSortedDesc(
            calculateForecast(transactions, monthsBack).expenseForecast,
          ),
        ).toBe(true)
      },
    )

    it.each(VALID_MONTHS_BACK)(
      'monthsBack=%i — month N included, month N+1 excluded',
      (monthsBack) => {
        // Out-of-window spike is 30× normal — if the window leaked, the forecast
        // would be orders of magnitude higher than 300.
        const transactions = [
          ...expenseFilled('Groceries', monthsBack, 300),
          ...expensePerMonth('Groceries', [[monthsBack + 1, 9000]]),
        ]
        const result = calculateForecast(transactions, monthsBack)

        expect(result.expenseForecast[0].amount).toBeLessThan(300 * 3)
      },
    )
  })

  // ── Empty / boundary inputs ───────────────────────────────────────────────

  describe('empty / boundary inputs', () => {
    it('returns zeros and empty arrays for no transactions', () => {
      expect(calculateForecast([])).toEqual({
        totalExpense: 0,
        totalIncome: 0,
        expenseForecast: [],
        incomeForecast: [],
      })
    })

    it('ignores transactions in the current month', () => {
      const tx = buildTransaction({
        id: '1',
        category: 'Groceries',
        amount: '500',
        isIncome: false,
        date: new Date(),
      })

      const result = calculateForecast([tx])

      expect(result.totalExpense).toBe(0)
      expect(result.expenseForecast).toEqual([])
    })

    it('ignores transactions beyond the default window', () => {
      // Month FORECAST_MONTHS_BACK+1 is always outside the window
      const tx = buildTransaction({
        id: '1',
        category: 'Groceries',
        amount: '500',
        isIncome: false,
        date: dateInPastMonth(FORECAST_MONTHS_BACK + 1),
      })

      expect(calculateForecast([tx]).totalExpense).toBe(0)
    })

    it('skips a category that has only zero-amount transactions', () => {
      const tx = buildTransaction({
        id: '1',
        category: 'Ghost',
        amount: '0',
        isIncome: false,
        date: dateInPastMonth(1),
      })

      expect(calculateForecast([tx]).expenseForecast).toEqual([])
    })
  })

  // ── Income / expense separation ───────────────────────────────────────────

  describe('income / expense separation', () => {
    it('routes income and expense to separate forecasts without cross-contamination', () => {
      const transactions = [
        buildTransaction({
          id: '1',
          category: 'Salary',
          amount: '2000',
          isIncome: true,
          date: dateInPastMonth(1),
        }),
        buildTransaction({
          id: '2',
          category: 'Groceries',
          amount: '400',
          isIncome: false,
          date: dateInPastMonth(1),
        }),
      ]

      const { incomeForecast, expenseForecast } =
        calculateForecast(transactions)

      expect(incomeForecast.map((e) => e.category)).toContain('Salary')
      expect(expenseForecast.map((e) => e.category)).toContain('Groceries')
      expect(expenseForecast.map((e) => e.category)).not.toContain('Salary')
      expect(incomeForecast.map((e) => e.category)).not.toContain('Groceries')
    })
  })

  // ── Aggregation ───────────────────────────────────────────────────────────

  describe('aggregation', () => {
    it('two transactions in the same month+category equal one combined transaction', () => {
      const split = [
        buildTransaction({
          id: '1',
          category: 'Groceries',
          amount: '200',
          isIncome: false,
          date: dateInPastMonth(1),
        }),
        buildTransaction({
          id: '2',
          category: 'Groceries',
          amount: '150',
          isIncome: false,
          date: dateInPastMonth(1),
        }),
      ]
      const combined = expensePerMonth('Groceries', [[1, 350]])

      expect(calculateForecast(split).expenseForecast[0].amount).toBeCloseTo(
        calculateForecast(combined).expenseForecast[0].amount,
        2,
      )
    })
  })

  // ── Exponential smoothing ─────────────────────────────────────────────────
  //
  // Tests check algebraic properties that hold for any α ∈ (0,1),
  // so changing SMOOTHING_FACTOR within that range never breaks them.

  describe('exponential smoothing', () => {
    it('constant series converges to the constant for any α', () => {
      // α·C + (1-α)·C = C — flat data is always a fixed point.
      const transactions = expenseFilled('Utilities', FORECAST_MONTHS_BACK, 300)

      expect(
        calculateForecast(transactions).expenseForecast[0].amount,
      ).toBeCloseTo(300, 1)
    })

    it('result lies strictly between the oldest and newest value for any α', () => {
      // risingExpense: newest=500 (month 1), oldest=100 (month N).
      // No outliers so dampening is a no-op.
      // For any α ∈ (0,1): smoothed ∈ (100, 500).
      const { amount } = calculateForecast(risingExpense('Dining'))
        .expenseForecast[0]

      expect(amount).toBeGreaterThan(100)
      expect(amount).toBeLessThan(500)
    })

    it('recent-high series always forecasts higher than recent-low series', () => {
      // risingExpense: newest months are high.
      // fallingExpense: newest months are low (same values, reversed order).
      // For any α > 0 the most-recent value has the highest weight, so rising > falling.
      const risingAmount = calculateForecast(risingExpense('Dining'))
        .expenseForecast[0].amount
      const fallingAmount = calculateForecast(fallingExpense('Dining'))
        .expenseForecast[0].amount

      expect(risingAmount).toBeGreaterThan(fallingAmount)
    })
  })

  // ── Output shape ──────────────────────────────────────────────────────────

  describe('output shape', () => {
    it('rounds forecast amounts to at most 2 decimal places', () => {
      const transactions = expenseFilled('Groceries', FORECAST_MONTHS_BACK, 300)

      for (const entry of calculateForecast(transactions).expenseForecast) {
        const decimals = (entry.amount.toString().split('.')[1] ?? '').length
        expect(decimals).toBeLessThanOrEqual(2)
      }
    })

    it('percentage is a numeric string', () => {
      const { percentage } = calculateForecast(
        expensePerMonth('Groceries', [[1, 300]]),
      ).expenseForecast[0]

      expect(typeof percentage).toBe('string')
      expect(isNaN(parseFloat(percentage))).toBe(false)
    })

    it('expense percentages sum to ~100', () => {
      const transactions = [
        ...expenseFilled('Groceries', FORECAST_MONTHS_BACK, 300),
        ...expenseFilled('Transport', FORECAST_MONTHS_BACK, 100),
        ...expenseFilled('Rent', FORECAST_MONTHS_BACK, 600),
      ]

      expect(
        sumPercentages(calculateForecast(transactions).expenseForecast),
      ).toBeCloseTo(100, 0)
    })

    it('income percentages sum to ~100', () => {
      const transactions = [
        ...incomePerMonth('Salary', [[1, 3000]]),
        ...incomePerMonth('Freelance', [[1, 1000]]),
      ]

      expect(
        sumPercentages(calculateForecast(transactions).incomeForecast),
      ).toBeCloseTo(100, 0)
    })

    it('expense entries sorted by amount descending', () => {
      const transactions = [
        ...expenseFilled('Transport', FORECAST_MONTHS_BACK, 100),
        ...expenseFilled('Rent', FORECAST_MONTHS_BACK, 800),
        ...expenseFilled('Groceries', FORECAST_MONTHS_BACK, 300),
      ]

      expect(
        isSortedDesc(calculateForecast(transactions).expenseForecast),
      ).toBe(true)
    })

    it('income entries sorted by amount descending', () => {
      const transactions = [
        ...incomePerMonth('Freelance', [[1, 500]]),
        ...incomePerMonth('Salary', [[1, 3000]]),
        ...incomePerMonth('Dividends', [[1, 200]]),
      ]

      expect(isSortedDesc(calculateForecast(transactions).incomeForecast)).toBe(
        true,
      )
    })
  })

  // ── Totals integrity ──────────────────────────────────────────────────────

  describe('totals integrity', () => {
    it('totalExpense and totalIncome are independent of each other', () => {
      const transactions = [
        ...expenseFilled('Groceries', FORECAST_MONTHS_BACK, 400),
        ...incomePerMonth('Salary', [[1, 3000]]),
      ]
      const result = calculateForecast(transactions)

      expect(result.totalExpense).toBeGreaterThan(0)
      expect(result.totalIncome).toBeGreaterThan(0)
      // Income must not bleed into expense total
      expect(result.totalExpense).toBeLessThan(result.totalIncome)
    })
  })

  // ── Trend detection ───────────────────────────────────────────────────────
  //
  // risingExpense / fallingExpense produce a ~400% slope (low=100, high=500).
  // The normalised slope ≈ 4× avg — well above any TREND_THRESHOLD ≤ 0.2.
  // Flat data has zero slope — always below any positive threshold.

  describe('trend detection', () => {
    it('reports "up" for a strongly rising series', () => {
      const entry = calculateForecast(
        risingExpense('Dining'),
      ).expenseForecast.find((e) => e.category === 'Dining')

      expect(entry?.trend).toBe('up')
    })

    it('reports "down" for a strongly falling series', () => {
      const entry = calculateForecast(
        fallingExpense('Dining'),
      ).expenseForecast.find((e) => e.category === 'Dining')

      expect(entry?.trend).toBe('down')
    })

    it('reports "stable" for a perfectly flat series', () => {
      // Zero slope is always below any positive TREND_THRESHOLD.
      const entry = calculateForecast(
        expenseFilled('Utilities', FORECAST_MONTHS_BACK, 250),
      ).expenseForecast.find((e) => e.category === 'Utilities')

      expect(entry?.trend).toBe('stable')
    })
  })

  // ── Outlier dampening ─────────────────────────────────────────────────────
  //
  // Spike = normal × 10. After capping at cap multiplier × median:
  //   - spike is reduced but not eliminated → forecast > baseline
  //   - spike is capped enough → forecast stays well below the raw mean
  // Both properties hold for any cap multiplier ∈ [1.5, 5].

  describe('outlier dampening', () => {
    it('spike is capped: forecast stays below raw uncapped mean', () => {
      const normal = 200
      const spikeMonth = FORECAST_MONTHS_BACK
      const totalMonths = FORECAST_MONTHS_BACK

      const transactions = [
        ...expenseFilled('Entertainment', totalMonths - 1, normal),
        ...expensePerMonth('Entertainment', [[spikeMonth, normal * 10]]),
      ]

      const entry = calculateForecast(transactions).expenseForecast.find(
        (e) => e.category === 'Entertainment',
      )

      // Raw uncapped mean if spike wasn't dampened:
      const rawMean = (normal * (totalMonths - 1) + normal * 10) / totalMonths
      expect(entry!.amount).toBeLessThan(rawMean)
    })

    it('spike is not eliminated: forecast is higher than baseline without spike', () => {
      const normal = 200
      const spikeMonth = FORECAST_MONTHS_BACK

      const withSpike = [
        ...expenseFilled('Entertainment', FORECAST_MONTHS_BACK - 1, normal),
        ...expensePerMonth('Entertainment', [[spikeMonth, normal * 10]]),
      ]
      const withoutSpike = expenseFilled(
        'Entertainment',
        FORECAST_MONTHS_BACK,
        normal,
      )

      const spikeAmount = calculateForecast(withSpike).expenseForecast[0].amount
      const baseAmount =
        calculateForecast(withoutSpike).expenseForecast[0].amount

      expect(spikeAmount).toBeGreaterThan(baseAmount)
    })

    it('constant series is unaffected by dampening', () => {
      // All values equal → cap = cap multiplier × value, no value exceeds it.
      const amount = 300
      const transactions = expenseFilled('Rent', FORECAST_MONTHS_BACK, amount)

      expect(
        calculateForecast(transactions).expenseForecast[0].amount,
      ).toBeCloseTo(amount, 1)
    })
  })
})
