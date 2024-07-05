'use client'

import { Fragment, useCallback, useState } from 'react'
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
} from '../lib/data'
import { TTransaction } from '../lib/types'
import { getFormattedCurrency, toCalendarDate } from '../lib/utils'
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
  const formattedDateRange = `${format(startDate, 'MMMM d')} — ${format(endDate, 'MMMM d')}`

  const onDateSelection = useCallback((dateRange: RangeValue<DateValue>) => {
    setSelectedDate(dateRange)
    toast.success('Date range updated.')
  }, [])

  const filteredTransactions = filterTransactionsByDateRange(
    transactions,
    startDate,
    endDate,
  )

  if (filteredTransactions.length === 0) {
    return (
      <div className='mx-auto max-w-3xl rounded-medium bg-content1 p-8'>
        <MonthPicker
          selectedDate={selectedDate}
          onDateSelection={onDateSelection}
        />
        <p className='text-default-500'>
          No transactions from {formattedDateRange}
        </p>
      </div>
    )
  }

  const { income, expense } = filterTransactions(filteredTransactions)
  const { totalIncome, totalExpense, monthlyReportData } =
    calculateMonthlyReportData(income, expense)

  return (
    <div className='mx-auto max-w-3xl rounded-medium bg-content1 p-8'>
      <MonthPicker
        selectedDate={selectedDate}
        onDateSelection={onDateSelection}
      />
      <div className='mb-6 flex items-end justify-between'>
        <p className='text-2xl text-default-500'>{formattedDateRange}</p>
        <div className='flex gap-8'>
          <div>
            <p className='text-sm text-default-500'>Total Income</p>
            <p className='flex items-center gap-1 text-2xl font-semibold'>
              <PiArrowCircleUpFill className='fill-success' />
              {getFormattedCurrency(totalIncome)}{' '}
              {currency?.code || DEFAULT_CURRENCY_CODE}
            </p>
          </div>
          <div>
            <p className='text-sm text-default-500'>Total Expense</p>
            <p className='flex items-center gap-1 text-2xl font-semibold'>
              <PiArrowCircleDownFill className='fill-danger' />
              {getFormattedCurrency(totalExpense)}{' '}
              {currency?.code || DEFAULT_CURRENCY_CODE}
            </p>
          </div>
        </div>
      </div>
      <Divider className='mx-auto mb-6 bg-divider' />
      <div className='grid grid-cols-3 gap-4'>
        <div className='text-sm text-default-500'>Category</div>
        <div className='text-sm text-default-500'>Percentage</div>
        <div className='text-sm text-default-500'>Spent</div>
        {monthlyReportData
          .sort((c1, c2) => c2.spent - c1.spent)
          .map((category) => (
            <Fragment key={category.category}>
              <div className='text-lg'>{category.category}</div>
              <div className='text-lg'>{category.percentage} %</div>
              <div className='text-lg'>
                {getFormattedCurrency(category.spent)}{' '}
                {currency?.sign || DEFAULT_CURRENCY_SIGN}
              </div>
            </Fragment>
          ))}
      </div>
    </div>
  )
}

export default MonthlyReport
