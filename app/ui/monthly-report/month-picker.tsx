import { memo, useEffect, useState } from 'react'
import { useDebounce } from 'react-use'

import { DateRangePicker, DateValue, RangeValue } from '@nextui-org/react'
import { getDaysInMonth } from 'date-fns'

import { toCalendarDate } from '@/app/lib/helpers'
import { TMinMaxTransactionByDate } from '@/app/lib/types'

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
  const [dateRange, setDateRange] =
    useState<RangeValue<DateValue>>(selectedDate)

  const daysInMonth = getDaysInMonth(new Date())
  const maxTransactionDayOfMonth = toCalendarDate(
    maxTransaction?.createdAt!,
  ).day

  const minTransactionValue = toCalendarDate(minTransaction?.createdAt!)
  const maxTransactionValue = toCalendarDate(maxTransaction?.createdAt!).add({
    days: daysInMonth - maxTransactionDayOfMonth,
  })

  // Docs https://github.com/streamich/react-use/blob/master/docs/useDebounce.md
  const [isReady, cancel] = useDebounce(() => onDateSelection(dateRange), 300, [
    dateRange,
  ])

  useEffect(() => {
    if (!isReady()) cancel()
  }, [cancel, isReady])

  return (
    <div className='mb-6 flex justify-between'>
      <div>
        <DateRangePicker
          label='Select a date range'
          labelPlacement='outside'
          value={dateRange}
          minValue={minTransactionValue}
          maxValue={maxTransactionValue}
          onChange={(range) => setDateRange(range)}
        />
      </div>
    </div>
  )
}

export default memo(MonthPicker)
