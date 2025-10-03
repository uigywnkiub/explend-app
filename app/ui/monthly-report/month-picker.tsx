import { memo, useEffect, useState } from 'react'
import { useDebounce } from 'react-use'

import { DateRangePicker, DateValue, RangeValue } from '@heroui/react'
import { getDaysInMonth } from 'date-fns'

import { toCalendarDate } from '@/app/lib/helpers'
import type { TMinMaxTransactionByDate, TTransaction } from '@/app/lib/types'

type TProps = {
  selectedDate: RangeValue<DateValue>
  onDateSelection: (dateRange: RangeValue<DateValue>) => void
  minTransaction: TMinMaxTransactionByDate['minTransaction']
  maxTransaction: TMinMaxTransactionByDate['maxTransaction']
  userSalaryDay: TTransaction['salaryDay']
}

function MonthPicker({
  selectedDate,
  onDateSelection,
  minTransaction,
  maxTransaction,
  userSalaryDay,
}: TProps) {
  const [dateRange, setDateRange] = useState<RangeValue<DateValue> | null>(
    selectedDate,
  )

  const daysInMonth = getDaysInMonth(new Date())
  const maxTransactionDayOfMonth = maxTransaction?.createdAt
    ? toCalendarDate(maxTransaction.createdAt).day
    : 1

  const minTransactionValue = minTransaction
    ? toCalendarDate(minTransaction.createdAt)
    : null
  // eslint-disable-next-line unused-imports/no-unused-vars
  const maxTransactionValue = maxTransaction
    ? toCalendarDate(maxTransaction.createdAt).add({
        days: daysInMonth - maxTransactionDayOfMonth,
      })
    : null

  // Docs https://github.com/streamich/react-use/blob/master/docs/useDebounce.md
  const [isReady, cancel] = useDebounce(
    () => dateRange && onDateSelection(dateRange),
    300,
    [dateRange],
  )

  useEffect(() => {
    if (!isReady()) cancel()
  }, [cancel, isReady])

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
        if (!btn || typeof userSalaryDay === 'undefined') return
        const txt = (btn.textContent || '').trim()
        if (txt === String(userSalaryDay)) {
          btn.classList.add('salary-calendar-day')
          btn.setAttribute('title', `Your salary day`)
        } else {
          btn.classList.remove('salary-calendar-day')
          btn.removeAttribute('title')
        }
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
  }, [userSalaryDay])

  return (
    <div className='flex justify-between'>
      <div>
        <DateRangePicker
          showMonthAndYearPickers
          aria-label='Select a date range'
          label='Select a date range'
          labelPlacement='outside'
          classNames={{ popoverContent: 'my-date-range-picker-popover' }}
          value={dateRange}
          minValue={minTransactionValue}
          // maxValue={maxTransactionValue}
          onChange={(range: RangeValue<DateValue> | null) =>
            range && setDateRange(range)
          }
        />
      </div>
    </div>
  )
}

export default memo(MonthPicker)
