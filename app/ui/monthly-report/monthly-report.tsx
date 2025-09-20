'use client'

import { useCallback, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { PiArrowCircleDownFill, PiArrowCircleUpFill } from 'react-icons/pi'
import { useLocalStorage } from 'react-use'

import Link from 'next/link'

import {
  Accordion,
  AccordionItem,
  Button,
  DateValue,
  Divider,
  RangeValue,
} from '@heroui/react'
import { getLocalTimeZone } from '@internationalized/date'
import {
  endOfMonth,
  endOfToday,
  format,
  startOfMonth,
  startOfToday,
} from 'date-fns'

import { LOCAL_STORAGE_KEY } from '@/config/constants/local-storage'

import { getCachedExpenseTipsAI } from '@/app/lib/actions'
import {
  calculateMonthlyReportData,
  filterTransactions,
  filterTransactionsByDateRange,
  getFirstAndLastTransactions,
} from '@/app/lib/data'
import {
  createSearchHrefWithKeyword,
  deepCompareArrays,
  formatDate,
  getExpenseCategories,
  isValidArrayWithKeys,
  sortArrayByKeyByReferenceArray,
  toCalendarDate,
} from '@/app/lib/helpers'
import { useAttemptTracker } from '@/app/lib/hooks'
import type { TExpenseAdvice, TTransaction } from '@/app/lib/types'

import AILogo from '../ai-logo'
import AnimatedNumber from '../animated-number'
import Magnetic from '../magnetic'
import WarningText from '../warning-text'
import MonthPicker from './month-picker'
import MonthlyReportData from './monthly-report-data'
import TipsList from './tips-list'

const ACCORDION_KEY = {
  EXPENSE: 'expense',
  INCOME: 'income',
}
const REFRESH_TIPS_BTN_TEXT = 'Refresh tips'

type TProps = {
  transactions: TTransaction[]
  currency: TTransaction['currency']
}

function MonthlyReport({ transactions, currency }: TProps) {
  const [tipsDataAI, setTipsDataAI] = useState<TExpenseAdvice[] | null>(null)
  const [isLoadingTips, setIsLoadingTips] = useState(false)

  const [expenseTipsAIDataLocalStorageRaw, setExpenseTipsAIDataLocalStorage] =
    useLocalStorage(LOCAL_STORAGE_KEY.AI_EXPENSE_TIPS_DATA)
  const isValidExpenseTipsAIDataLocalStorage = isValidArrayWithKeys(
    expenseTipsAIDataLocalStorageRaw,
    ['category', 'tip', 'savings'] satisfies readonly (keyof TExpenseAdvice)[],
  )
  const expenseTipsAIDataLocalStorage = useMemo(() => {
    return isValidExpenseTipsAIDataLocalStorage
      ? (expenseTipsAIDataLocalStorageRaw as TExpenseAdvice[])
      : []
  }, [isValidExpenseTipsAIDataLocalStorage, expenseTipsAIDataLocalStorageRaw])

  const { canAttempt, registerAttempt } = useAttemptTracker(
    LOCAL_STORAGE_KEY.ATTEMPT_AI_EXPENSE_TIPS,
  )
  const { firstTransaction: minTransaction, lastTransaction: maxTransaction } =
    useMemo(() => getFirstAndLastTransactions(transactions), [transactions])

  const minTransactionCalendarDate = minTransaction
    ? toCalendarDate(minTransaction.createdAt)
    : null
  const startOfMonthCalendarDate = toCalendarDate(startOfMonth(startOfToday()))
  const endOfMonthCalendarDate = toCalendarDate(endOfMonth(endOfToday()))

  const isMinTransactionAfterStartOfMonth =
    minTransactionCalendarDate &&
    minTransactionCalendarDate.day > 1 &&
    minTransactionCalendarDate.month === startOfMonthCalendarDate.month &&
    minTransactionCalendarDate.year === startOfMonthCalendarDate.year

  const [selectedDate, setSelectedDate] = useState<RangeValue<DateValue>>({
    start: isMinTransactionAfterStartOfMonth
      ? minTransactionCalendarDate
      : startOfMonthCalendarDate,
    end: endOfMonthCalendarDate,
  })

  const startDate = selectedDate.start?.toDate(getLocalTimeZone()) || null
  const endDate = selectedDate.end?.toDate(getLocalTimeZone()) || null

  const isTipsDataExist = Array.isArray(tipsDataAI) && tipsDataAI.length > 0

  const formattedDateRange = useMemo(() => {
    if (!startDate || !endDate) return ''

    return `${formatDate(startDate, true)} - ${formatDate(endDate, true)}`
  }, [startDate, endDate])

  const onDateSelection = useCallback(
    (dateRange: RangeValue<DateValue>) => {
      setSelectedDate(dateRange)
      if (isTipsDataExist) setTipsDataAI(null)
      toast.success('Date range updated.')
    },
    [isTipsDataExist],
  )

  const filteredTransactionsByDateRange = useMemo(
    () => filterTransactionsByDateRange(transactions, startDate, endDate),
    [transactions, startDate, endDate],
  )
  const { income, expense } = useMemo(
    () => filterTransactions(filteredTransactionsByDateRange),
    [filteredTransactionsByDateRange],
  )
  const { totalIncome, totalExpense, expenseReportData, incomeReportData } =
    useMemo(
      () => calculateMonthlyReportData(income, expense),
      [income, expense],
    )
  const expenseCategories = useMemo(
    () => getExpenseCategories(expenseReportData, false),
    [expenseReportData],
  )
  const isMissMatchLocalStorageAndCurrMonthExpenses = useMemo(
    () =>
      !deepCompareArrays(
        expenseTipsAIDataLocalStorage.map((e) => e.category).sort(),
        expenseReportData.map((e) => e.category).sort(),
      ),
    [expenseTipsAIDataLocalStorage, expenseReportData],
  )

  const getExpenseTipsAIData = useCallback(async () => {
    if (expenseReportData.length === 0) {
      toast.error('No expenses found.')

      return
    }
    if (isValidExpenseTipsAIDataLocalStorage && !isTipsDataExist) {
      const sortedExpenseTipsAIDataLocalStorage =
        sortArrayByKeyByReferenceArray(
          expenseTipsAIDataLocalStorage,
          expenseReportData,
          'category',
        )

      setTipsDataAI(sortedExpenseTipsAIDataLocalStorage)
      setExpenseTipsAIDataLocalStorage(sortedExpenseTipsAIDataLocalStorage)
      toast.success('Restored from memory.')

      return
    }
    if (!canAttempt()) {
      toast.error('Limit reached. Try later.')

      return
    }
    setIsLoadingTips(true)
    try {
      const res = await getCachedExpenseTipsAI(expenseCategories, currency)
      const parsedRes = JSON.parse(res)
      setTipsDataAI(parsedRes)
      setExpenseTipsAIDataLocalStorage(parsedRes)
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
    expenseReportData,
    isValidExpenseTipsAIDataLocalStorage,
    isTipsDataExist,
    canAttempt,
    expenseTipsAIDataLocalStorage,
    setExpenseTipsAIDataLocalStorage,
    expenseCategories,
    currency,
    registerAttempt,
  ])

  if (filteredTransactionsByDateRange.length === 0) {
    return (
      <div className='rounded-medium bg-content1 p-4 md:p-8'>
        <div className='mb-6'>
          <MonthPicker
            selectedDate={selectedDate}
            onDateSelection={onDateSelection}
            minTransaction={minTransaction}
            maxTransaction={maxTransaction}
          />
        </div>
        <p className='text-balance text-center text-default-500'>
          No transactions found from {formattedDateRange}
        </p>
      </div>
    )
  }

  return (
    <>
      <div className='relative rounded-medium bg-content1 p-4 md:p-8'>
        <div className='mb-6'>
          <MonthPicker
            selectedDate={selectedDate}
            onDateSelection={onDateSelection}
            minTransaction={minTransaction}
            maxTransaction={maxTransaction}
          />
        </div>
        <div className='mb-3 flex-none items-end justify-between md:mb-6 md:flex'>
          <Link
            href={createSearchHrefWithKeyword(format(startDate, 'MMMM'))}
            className='hover:opacity-hover'
          >
            <span className='mb-3 inline-block text-balance text-lg text-default-500 md:mb-0 md:text-xl'>
              {formattedDateRange}
            </span>
          </Link>
          <div className='flex gap-4 md:gap-8'>
            <div>
              <p className='text-xs text-default-500 md:text-sm'>
                Total Income
              </p>
              <p className='flex items-center gap-1 text-lg font-semibold md:text-xl'>
                <PiArrowCircleUpFill className='fill-success' />
                <AnimatedNumber value={totalIncome} /> {currency.code}
              </p>
            </div>
            <div>
              <p className='text-xs text-default-500 md:text-sm'>
                Total Expense
              </p>
              <p className='flex items-center gap-1 text-lg font-semibold md:text-xl'>
                <PiArrowCircleDownFill className='fill-danger' />
                <AnimatedNumber value={totalExpense} /> {currency.code}
              </p>
            </div>
          </div>
        </div>

        <Divider className='mx-auto mb-0 bg-divider md:mb-2' />

        <Accordion defaultExpandedKeys={[ACCORDION_KEY.EXPENSE]}>
          <AccordionItem
            key={ACCORDION_KEY.EXPENSE}
            aria-label='Expense'
            title='Expense'
            subtitle='Total Spending Overview'
            startContent={
              <PiArrowCircleDownFill className='fill-danger text-lg md:text-xl' />
            }
            classNames={{
              subtitle: 'text-default-500 text-xs md:text-sm',
            }}
          >
            {expense.length !== 0 ? (
              <MonthlyReportData
                type='expense'
                data={expenseReportData}
                currency={currency}
              />
            ) : (
              <p className='text-default-500'>No expense found</p>
            )}
          </AccordionItem>
        </Accordion>

        <Accordion
          defaultExpandedKeys={
            expense.length === 0 && income.length > 0
              ? [ACCORDION_KEY.INCOME]
              : []
          }
        >
          <AccordionItem
            key={ACCORDION_KEY.INCOME}
            aria-label='Income'
            title='Income'
            subtitle='Total Earnings Overview'
            startContent={
              <PiArrowCircleUpFill className='fill-success text-lg md:text-xl' />
            }
            classNames={{
              subtitle: 'text-default-500 text-xs md:text-sm',
            }}
          >
            {income.length !== 0 ? (
              <MonthlyReportData
                type='income'
                data={incomeReportData}
                currency={currency}
              />
            ) : (
              <p className='text-default-500'>No income found</p>
            )}
          </AccordionItem>
        </Accordion>
      </div>
      <div className='mt-4 md:mt-8'>
        {isTipsDataExist ? (
          <>
            {/* <p className='mb-2 text-xs text-default-500 md:text-sm'>
              Expense Tips
            </p> */}
            <TipsList tipsDataAI={tipsDataAI} />
          </>
        ) : (
          <p className='text-balance text-center text-sm'>
            Get useful tips for managing expenses.
          </p>
        )}

        {isMissMatchLocalStorageAndCurrMonthExpenses &&
          isTipsDataExist &&
          !isLoadingTips && (
            <div className='mb-4'>
              <WarningText
                text='Tips from memory do not match the tips for the current month or selected date expense.'
                actionText={`Press "${REFRESH_TIPS_BTN_TEXT}" button to update and sync them.`}
              />
            </div>
          )}

        <Magnetic>
          <Button
            isLoading={isLoadingTips}
            variant='flat'
            onPress={getExpenseTipsAIData}
            className='mx-auto mt-2 flex'
          >
            {!isLoadingTips && <AILogo asIcon iconSize='sm' />}{' '}
            {isLoadingTips
              ? isTipsDataExist
                ? 'Refreshing...'
                : 'Getting...'
              : isTipsDataExist
                ? REFRESH_TIPS_BTN_TEXT
                : 'Get tips'}
          </Button>
        </Magnetic>
      </div>
    </>
  )
}

export default MonthlyReport
