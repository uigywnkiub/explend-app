'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { PiCalendarBlank, PiCalendarBlankFill } from 'react-icons/pi'

import { Select, SelectItem } from '@heroui/react'
import { haptic } from 'ios-haptics'

import { DEFAULT_ICON_SIZE } from '@/config/constants/main'

import { updateForecastMonthsBack } from '@/app/lib/actions'
import { pluralize } from '@/app/lib/helpers'
import type { TUserId } from '@/app/lib/types'

import { HoverableElement } from '../hoverables'

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, idx) => ({
  key: String(idx + 1),
  months: idx + 1,
}))

type TProps = { userId: TUserId; forecastMonthsBack: number }

export default function ForecastMonthsBack({
  userId,
  forecastMonthsBack,
}: TProps) {
  const [monthsBack, setMonthsBack] = useState(forecastMonthsBack)
  const [isLoading, setIsLoading] = useState(false)

  const onChange = async (selectedMonths: number) => {
    setIsLoading(true)
    try {
      await updateForecastMonthsBack(userId, selectedMonths)
      setMonthsBack(selectedMonths)
      haptic.confirm()
      toast.success('Forecast period updated.')
    } catch (err) {
      haptic.error()
      toast.error('Failed to update forecast period.')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Select
      isVirtualized={false}
      label='Months to analyze'
      items={MONTH_OPTIONS}
      isLoading={isLoading}
      selectedKeys={new Set([String(monthsBack)])}
      onSelectionChange={(keys) => {
        if (keys === 'all') return
        const selectedMonths = Number(Array.from(keys)[0])
        if (Number.isInteger(selectedMonths) && selectedMonths !== monthsBack) {
          haptic()
          void onChange(selectedMonths)
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
