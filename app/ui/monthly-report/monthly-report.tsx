'use client'

import { Fragment, useCallback, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { PiArrowCircleDownFill, PiArrowCircleUpFill } from 'react-icons/pi'

import { getLocalTimeZone } from '@internationalized/date'
import { DateValue, Divider, RangeValue } from '@nextui-org/react'
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

import {
  calculateMonthlyReportData,
  filterTransactions,
  filterTransactionsByDateRange,
  getMinMaxTransactionsByDate,
} from '@/app/lib/data'
import { getFormattedCurrency, toCalendarDate } from '@/app/lib/helpers'
import type { TTransaction } from '@/app/lib/types'

import MonthPicker from './month-picker'

type TProps = {
  transactions: TTransaction[]
  currency: TTransaction['currency']
}

function MonthlyReport({ transactions, currency }: TProps) {
  const [selectedDate, setSelectedDate] = useState<RangeValue<DateValue>>({
    start: toCalendarDate(startOfMonth(startOfToday())),
    end: toCalendarDate(endOfMonth(endOfToday())),
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
  const { minTransaction, maxTransaction } = useMemo(
    () => getMinMaxTransactionsByDate(transactions),
    [],
  )

  const memorizedMonthlyReportData = useMemo(() => {
    return monthlyReportData.map((category) => (
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
    ))
  }, [currency?.sign, monthlyReportData])

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
            <p className='text-xs text-default-500 md:text-sm'>Total Income</p>
            <p className='flex items-center gap-1 text-lg font-semibold md:text-2xl'>
              <PiArrowCircleUpFill className='fill-success' />
              {getFormattedCurrency(totalIncome)}{' '}
              {currency?.code || DEFAULT_CURRENCY_CODE}
            </p>
          </div>
          <div>
            <p className='text-xs text-default-500 md:text-sm'>Total Expense</p>
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
            <div className='text-xs text-default-500 md:text-sm'>Category</div>
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
  )
}

export default MonthlyReport
