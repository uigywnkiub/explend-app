import { memo, useEffect, useState } from 'react'
import { useDebounce } from 'react-use'

import { DateRangePicker, DateValue, RangeValue } from '@nextui-org/react'

type TProps = {
  selectedDate: RangeValue<DateValue>
  onDateSelection: (dateRange: RangeValue<DateValue>) => void
}

function MonthPicker({ selectedDate, onDateSelection }: TProps) {
  const [dateRange, setDateRange] =
    useState<RangeValue<DateValue>>(selectedDate)

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
          onChange={(range) => setDateRange(range)}
        />
      </div>
    </div>
  )
}

export default memo(MonthPicker)
