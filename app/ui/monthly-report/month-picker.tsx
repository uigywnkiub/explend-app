import { memo, useEffect, useState } from 'react'
import { useDebounce } from 'react-use'

import { DateRangePicker, DateValue, RangeValue } from '@heroui/react'
import { getDaysInMonth } from 'date-fns'

import { toCalendarDate } from '@/app/lib/helpers'
import type { TMinMaxTransactionByDate } from '@/app/lib/types'

type TProps = {
  selectedDate: RangeValue<DateValue>
  onDateSelection: (dateRange: RangeValue<DateValue>) => void
  minTransaction: TMinMaxTransactionByDate['minTransaction']
  maxTransaction: TMinMaxTransactionByDate['maxTransaction']
}

function MonthPicker({
  selectedDate,
  onDateSelection,
  minTransaction,
  maxTransaction,
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

  return (
    <div className='flex justify-between'>
      <div>
        <DateRangePicker
          showMonthAndYearPickers
          aria-label='Select a date range'
          label='Select a date range'
          labelPlacement='outside'
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
