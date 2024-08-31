'use client'

import { Fragment, useCallback, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { PiArrowCircleDownFill, PiArrowCircleUpFill } from 'react-icons/pi'

import { getLocalTimeZone } from '@internationalized/date'
import { Button, DateValue, Divider, RangeValue } from '@nextui-org/react'
import {
  endOfMonth,
  endOfToday,
  format,
  startOfMonth,
  startOfToday,
} from 'date-fns'

import {
  DEFAULT_CURRENCY_CODE,
  DEFAULT_CURRENCY_SIGN,
} from '@/config/constants/main'

import { getCachedExpenseTipsAI } from '@/app/lib/actions'
import {
  calculateMonthlyReportData,
  filterTransactions,
  filterTransactionsByDateRange,
  getMinMaxTransactionsByDate,
} from '@/app/lib/data'
import {
  getExpenseCategoriesList,
  getFormattedCurrency,
  toCalendarDate,
} from '@/app/lib/helpers'
import { useAttemptTracker } from '@/app/lib/hooks'
import type { TExpenseAdvice, TTransaction } from '@/app/lib/types'

import AILogo from '../ai-logo'
import MonthPicker from './month-picker'
import TipsList from './tips-list'

type TProps = {
  transactions: TTransaction[]
  currency: TTransaction['currency']
}

function MonthlyReport({ transactions, currency }: TProps) {
  const [tipsDataAI, setTipsDataAI] = useState<TExpenseAdvice[] | null>(null)
  const [isLoadingTips, setIsLoadingTips] = useState(false)
  const { canAttempt, registerAttempt } = useAttemptTracker('expense-ai-tips')
  const { minTransaction, maxTransaction } = useMemo(
    () => getMinMaxTransactionsByDate(transactions),
    [transactions],
  )
  const minTransactionCalendarDate = toCalendarDate(minTransaction?.createdAt!)
  const startOfMonthCalendarDate = toCalendarDate(startOfMonth(startOfToday()))
  const endOfMonthCalendarDate = toCalendarDate(endOfMonth(endOfToday()))
  const isMinTransactionAfterStartOfMonth =
    minTransactionCalendarDate.day > 1 &&
    minTransactionCalendarDate.month === startOfMonthCalendarDate.month
  const [selectedDate, setSelectedDate] = useState<RangeValue<DateValue>>({
    start: isMinTransactionAfterStartOfMonth
      ? minTransactionCalendarDate
      : startOfMonthCalendarDate,
    end: endOfMonthCalendarDate,
  })
  const startDate = selectedDate?.start.toDate(getLocalTimeZone())
  const endDate = selectedDate?.end.toDate(getLocalTimeZone())
  const formattedDateRange = useMemo(
    () => `${format(startDate, 'MMMM d')} — ${format(endDate, 'MMMM d')}`,
    [startDate, endDate],
  )

  const onDateSelection = useCallback((dateRange: RangeValue<DateValue>) => {
    setSelectedDate(dateRange)
    toast.success('Date range updated.')
  }, [])

  const filteredTransactions = useMemo(
    () => filterTransactionsByDateRange(transactions, startDate, endDate),
    [transactions, startDate, endDate],
  )
  const { income, expense } = useMemo(
    () => filterTransactions(filteredTransactions),
    [filteredTransactions],
  )
  const { totalIncome, totalExpense, monthlyReportData } = useMemo(
    () => calculateMonthlyReportData(income, expense),
    [income, expense],
  )
  const expenseCategories = useMemo(
    () => getExpenseCategoriesList(monthlyReportData, false),
    [monthlyReportData],
  )

  const isTipsDataExist = tipsDataAI && tipsDataAI?.length > 0

  const getExpenseTipsAIData = useCallback(async () => {
    if (monthlyReportData.length === 0) {
      toast.error('No expenses found.')
      return
    }
    if (!canAttempt()) {
      toast.error('Try again later.')
      return
    }
    setIsLoadingTips(true)
    try {
      const res = await getCachedExpenseTipsAI(expenseCategories)
      setTipsDataAI(JSON.parse(res))
      registerAttempt()
      toast.success(isTipsDataExist ? 'Tips refreshed.' : 'Tips loaded.')
    } catch (err) {
      toast.error(
        isTipsDataExist ? 'Failed to refresh tips.' : 'Failed to load tips.',
      )
      throw err
    } finally {
      setIsLoadingTips(false)
    }
  }, [
    canAttempt,
    expenseCategories,
    isTipsDataExist,
    monthlyReportData.length,
    registerAttempt,
  ])

  const memorizedMonthlyReportData = useMemo(
    () =>
      monthlyReportData.map((category) => (
        <Fragment key={category.category}>
          <div className='text-md overflow-hidden text-ellipsis whitespace-nowrap md:text-lg'>
            {category.category}
          </div>
          <div className='text-md md:text-lg'>{category.percentage} %</div>
          <div className='text-md md:text-lg'>
            {getFormattedCurrency(category.spent)}{' '}
            {currency?.sign || DEFAULT_CURRENCY_SIGN}
          </div>
        </Fragment>
      )),
    [currency?.sign, monthlyReportData],
  )

  if (filteredTransactions.length === 0) {
    return (
      <div className='rounded-medium bg-content1 p-4 md:p-8'>
        <MonthPicker
          selectedDate={selectedDate}
          onDateSelection={onDateSelection}
          minTransaction={minTransaction}
          maxTransaction={maxTransaction}
        />
        <p className='text-default-500'>
          No transactions found from {formattedDateRange}
        </p>
      </div>
    )
  }

  return (
    <>
      <div className='rounded-medium bg-content1 p-4 md:p-8'>
        <MonthPicker
          selectedDate={selectedDate}
          onDateSelection={onDateSelection}
          minTransaction={minTransaction}
          maxTransaction={maxTransaction}
        />
        <div className='mb-3 flex-none items-end justify-between md:mb-6 md:flex'>
          <p className='mb-2 text-xl text-default-500 md:mb-0 md:text-2xl'>
            {formattedDateRange}
          </p>
          <div className='flex gap-4 md:gap-8'>
            <div>
              <p className='text-xs text-default-500 md:text-sm'>
                Total Income
              </p>
              <p className='flex items-center gap-1 text-lg font-semibold md:text-2xl'>
                <PiArrowCircleUpFill className='fill-success' />
                {getFormattedCurrency(totalIncome)}{' '}
                {currency?.code || DEFAULT_CURRENCY_CODE}
              </p>
            </div>
            <div>
              <p className='text-xs text-default-500 md:text-sm'>
                Total Expense
              </p>
              <p className='flex items-center gap-1 text-lg font-semibold md:text-2xl'>
                <PiArrowCircleDownFill className='fill-danger' />
                {getFormattedCurrency(totalExpense)}{' '}
                {currency?.code || DEFAULT_CURRENCY_CODE}
              </p>
            </div>
          </div>
        </div>
        {expense.length !== 0 ? (
          <>
            <Divider className='mx-auto mb-3 bg-divider md:mb-6' />
            <div className='grid grid-cols-3 gap-4'>
              <div className='text-xs text-default-500 md:text-sm'>
                Category
              </div>
              <div className='text-xs text-default-500 md:text-sm'>
                Percentage
              </div>
              <div className='text-xs text-default-500 md:text-sm'>Spent</div>
              {memorizedMonthlyReportData}
            </div>
          </>
        ) : (
          <p className='text-default-500'>No expense transactions found.</p>
        )}
      </div>
      <div className='mt-4 md:mt-8'>
        {tipsDataAI ? (
          <>
            <TipsList tipsDataAI={tipsDataAI} />
          </>
        ) : (
          <p className='text-center text-sm'>
            Discover helpful tips on managing expense categories.
          </p>
        )}
        <Button
          isLoading={isLoadingTips}
          variant='flat'
          onClick={getExpenseTipsAIData}
          className='mx-auto mt-2 flex'
        >
          {!isLoadingTips && <AILogo asIcon iconSize='sm' />}{' '}
          {isLoadingTips
            ? isTipsDataExist
              ? 'Refreshing...'
              : 'Getting...'
            : isTipsDataExist
              ? 'Refresh Tips'
              : 'Get Tips'}
        </Button>
      </div>
    </>
  )
}

export default MonthlyReport
