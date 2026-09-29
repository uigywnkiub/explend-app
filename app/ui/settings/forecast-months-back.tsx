'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { PiCalendarBlank, PiCalendarBlankFill } from 'react-icons/pi'

import { Select, SelectItem } from '@heroui/react'
import { haptic } from 'ios-haptics'

import { LOCAL_STORAGE_KEY } from '@/config/constants/local-storage'
import { DEFAULT_ICON_SIZE } from '@/config/constants/main'

import { FORECAST_MONTHS_BACK } from '@/app/lib/data'
import {
  getFromLocalStorage,
  pluralize,
  setInLocalStorage,
} from '@/app/lib/helpers'

import { HoverableElement } from '../hoverables'

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, idx) => ({
  key: String(idx + 1),
  months: idx + 1,
}))

export default function ForecastMonthsBack() {
  const [monthsBack, setMonthsBack] = useState(FORECAST_MONTHS_BACK)

  useEffect(() => {
    const storedMonths = Number(
      getFromLocalStorage(LOCAL_STORAGE_KEY.FORECAST_MONTHS_BACK),
    )
    if (
      Number.isInteger(storedMonths) &&
      storedMonths >= 1 &&
      storedMonths <= 12
    ) {
      setMonthsBack(storedMonths)
    }
  }, [])

  return (
    <Select
      isVirtualized={false}
      label='Months to analyze'
      items={MONTH_OPTIONS}
      selectedKeys={new Set([String(monthsBack)])}
      onSelectionChange={(keys) => {
        if (keys === 'all') return

        const selectedMonths = Number(Array.from(keys)[0])
        if (
          Number.isInteger(selectedMonths) &&
          selectedMonths >= 1 &&
          selectedMonths <= 12 &&
          selectedMonths !== monthsBack
        ) {
          haptic()
          setMonthsBack(selectedMonths)
          setInLocalStorage(
            LOCAL_STORAGE_KEY.FORECAST_MONTHS_BACK,
            String(selectedMonths),
          )
          haptic.confirm()
          toast.success('Forecast period updated.')
        }
      }}
    >
      {MONTH_OPTIONS.map(({ key, months }) => (
        <SelectItem
          key={key}
          textValue={`${months} ${pluralize(months, 'month', 'months')}`}
          startContent={
            <HoverableElement
              uKey={key}
              element={<PiCalendarBlank size={DEFAULT_ICON_SIZE} />}
              hoveredElement={<PiCalendarBlankFill size={DEFAULT_ICON_SIZE} />}
            />
          }
        >
          {months} {pluralize(months, 'month', 'months')}
        </SelectItem>
      ))}
    </Select>
  )
}
