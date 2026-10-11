import { memo, useEffect, useMemo, useState } from 'react'
import { useDebounce } from 'react-use'

import { DateRangePicker, DateValue, RangeValue } from '@heroui/react'
import { endOfMonth, format } from 'date-fns'
import { haptic } from 'ios-haptics'

import { toCalendarDate, userLocale } from '@/app/lib/helpers'
import type {
  TMinMaxTransactionByDate,
  TTransaction,
  TUserSettings,
} from '@/app/lib/types'

const TRANSACTION_LEVEL_CLASSES = [
  'bg-danger-100!',
  'bg-danger-200!',
  'bg-danger-300!',
  'bg-danger-400!',
] as const

type TProps = {
  selectedDate: RangeValue<DateValue>
  onDateSelection: (dateRange: RangeValue<DateValue>) => void
  minTransaction: TMinMaxTransactionByDate['minTransaction']
  transactions: TTransaction[]
  currencySign: string
  userSalaryDay: TUserSettings['salaryDay']
}

function MonthPicker({
  selectedDate,
  onDateSelection,
  minTransaction,
  transactions,
  currencySign,
  userSalaryDay,
}: TProps) {
  const [dateRange, setDateRange] = useState<RangeValue<DateValue> | null>(
    selectedDate,
  )

  const minTransactionValue = minTransaction
    ? toCalendarDate(minTransaction.createdAt)
    : null
  const maxTransactionValue = toCalendarDate(endOfMonth(new Date()))
  const transactionTotals = useMemo(() => {
    const totals = new Map<
      string,
      {
        amount: number
        count: number
        level: number
      }
    >()

    transactions.forEach(({ amount, createdAt, isIncome }) => {
      if (isIncome) return

      const parsedAmount = Number.parseFloat(amount)
      if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return

      const dateKey = format(createdAt, 'yyyy-MM-dd')
      const current = totals.get(dateKey)

      totals.set(dateKey, {
        amount: (current?.amount ?? 0) + parsedAmount,
        count: (current?.count ?? 0) + 1,
        level: 0,
      })
    })

    const amounts = [...totals.values()].map(({ amount }) => amount)
    const maxAmount = Math.max(...amounts, 0)

    totals.forEach((day) => {
      if (maxAmount === 0) return

      // Logarithmic scaling makes large differences more visible.
      const normalized = Math.log1p(day.amount) / Math.log1p(maxAmount)

      day.level = Math.min(
        4,
        Math.max(1, Math.ceil(Math.pow(normalized, 2) * 4)),
      )
    })

    return new Map(
      [...totals.entries()].map(([dateKey, day]) => {
        const date = new Date(`${dateKey}T12:00:00`)

        const label = new Intl.DateTimeFormat(userLocale, {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }).format(date)

        return [label, day] as const
      }),
    )
  }, [transactions])

  // Docs https://github.com/streamich/react-use/blob/master/docs/useDebounce.md
  const [isReady, cancel] = useDebounce(
    () => dateRange && onDateSelection(dateRange),
    500,
    [dateRange],
  )

  useEffect(() => {
    if (!isReady()) cancel()
  }, [cancel, isReady])

  useEffect(() => {
    setDateRange(selectedDate)
  }, [selectedDate])

  useEffect(() => {
    const popoverSelector = '.my-date-range-picker-popover'

    const applyMark = (root: Element | null) => {
      if (!root) return
      // Calendar cells have slot="cell".
      const cells = Array.from(root.querySelectorAll('[data-slot="cell"]'))
      cells.forEach((cell) => {
        const btn = cell.querySelector<HTMLButtonElement>(
          'button, [role="button"], div',
        )
        if (!btn) return
        const dateLabel = btn.getAttribute('aria-label') || ''
        const transactionDay = Array.from(transactionTotals.entries()).find(
          ([label]) => dateLabel.includes(label),
        )?.[1]
        TRANSACTION_LEVEL_CLASSES.forEach((className) =>
          btn.classList.remove(className),
        )
        if (transactionDay?.level) {
          btn.classList.add(TRANSACTION_LEVEL_CLASSES[transactionDay.level - 1])
        }

        const titleParts: string[] = []
        if (transactionDay) {
          titleParts.push(
            `${transactionDay.amount.toLocaleString(userLocale)} ${currencySign} total across ${transactionDay.count} transaction${transactionDay.count === 1 ? '' : 's'}`,
          )
        }
        const txt = (btn.textContent || '').trim()
        const isSalaryDay =
          typeof userSalaryDay === 'number' && txt === String(userSalaryDay)
        if (isSalaryDay) {
          btn.classList.add('salary-calendar-day')
          titleParts.push('Your salary day')
        } else {
          btn.classList.remove('salary-calendar-day')
        }
        if (titleParts.length > 0)
          btn.setAttribute('title', titleParts.join(' · '))
        else btn.removeAttribute('title')
      })
    }

    // Observe DOM changes so month changes / navigation re-run our styling.
    const bodyObserver = new MutationObserver(() => {
      applyMark(document.querySelector(popoverSelector))
    })

    bodyObserver.observe(document.body, { childList: true, subtree: true })

    // Initial attempt (if popover already mounted).
    applyMark(document.querySelector(popoverSelector))

    return () => bodyObserver.disconnect()
  }, [currencySign, transactionTotals, userSalaryDay])

  return (
    <div className='flex justify-between'>
      <div>
        <DateRangePicker
          showMonthAndYearPickers
          aria-label='Select a date range'
          label='Select a date range'
          labelPlacement='outside'
          classNames={{ popoverContent: 'my-date-range-picker-popover' }}
          CalendarBottomContent={
            <div
              aria-label='Transaction amount legend'
              className='text-default-500 flex items-center justify-center gap-2 px-3 pb-3 text-xs'
            >
              <span>Less</span>
              {TRANSACTION_LEVEL_CLASSES.map((className) => (
                <span
                  key={className}
                  className={`${className} size-3 rounded-sm`}
                />
              ))}
              <span>More</span>
            </div>
          }
          value={dateRange}
          minValue={minTransactionValue}
          maxValue={maxTransactionValue}
          onChange={(range: RangeValue<DateValue> | null) => {
            if (range) {
              haptic()
              setDateRange(range)
            }
          }}
        />
      </div>
    </div>
  )
}

export default memo(MonthPicker)
