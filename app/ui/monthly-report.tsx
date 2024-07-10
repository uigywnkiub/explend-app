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
      <div className='mx-auto max-w-3xl rounded-medium bg-content1 p-4 md:p-8'>
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
    <div className='mx-auto max-w-3xl rounded-medium bg-content1 p-4 md:p-8'>
      <MonthPicker
        selectedDate={selectedDate}
        onDateSelection={onDateSelection}
      />
      <div className='mb-3 flex items-end justify-between md:mb-6'>
        <p className='hidden text-2xl text-default-500 md:block'>
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
      <Divider className='mx-auto mb-3 bg-divider md:mb-6' />
      <div className='grid grid-cols-3 gap-4'>
        <div className='text-xs text-default-500 md:text-sm'>Category</div>
        <div className='text-xs text-default-500 md:text-sm'>Percentage</div>
        <div className='text-xs text-default-500 md:text-sm'>Spent</div>
        {monthlyReportData
          .sort((c1, c2) => c2.spent - c1.spent)
          .map((category) => (
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
          ))}
      </div>
    </div>
  )
}

export default MonthlyReport
