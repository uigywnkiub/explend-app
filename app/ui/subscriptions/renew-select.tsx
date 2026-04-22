'use client'

import { memo } from 'react'
import { PiCalendar, PiCalendarFill } from 'react-icons/pi'

import { Select, SelectItem, SelectSection } from '@heroui/react'
import { motion } from 'framer-motion'
import { haptic } from 'ios-haptics'

import { DEFAULT_ICON_SIZE } from '@/config/constants/main'
import { MOTION_COLLAPSE } from '@/config/constants/motion'

import { getOrdinal } from '@/app/lib/helpers'
import { TSubscriptions } from '@/app/lib/types'

import { HoverableElement } from '../hoverables'
import InfoText from '../info-text'

const RENEW_DAYS = Array.from({ length: 28 }, (_, i) => {
  const day = (i + 1).toString()

  return {
    key: day,
    value: day,
    label: getOrdinal(i + 1),
    icon: <PiCalendar size={DEFAULT_ICON_SIZE} />,
    hoverIcon: <PiCalendarFill size={DEFAULT_ICON_SIZE} />,
  }
})

type TProps = {
  renewDay: NonNullable<TSubscriptions['renewDay']>
  onRenewDayChange: (day: NonNullable<TSubscriptions['renewDay']>) => void
}

function RenewSelect({ renewDay, onRenewDayChange }: TProps) {
  const selectedKey = renewDay.toString()

  return (
    <motion.div {...MOTION_COLLAPSE}>
      <Select
        isVirtualized={false}
        label='Select a renewal day'
        items={RENEW_DAYS}
        disabledKeys={[selectedKey]}
        defaultSelectedKeys={[selectedKey]}
        onChange={(e) => {
          haptic()
          const val = Number(e.target.value)
          if (!isNaN(val)) onRenewDayChange(val)
        }}
      >
        <SelectSection title='Days of the month'>
          {RENEW_DAYS.map((day) => (
            <SelectItem
              key={day.key}
              startContent={
                <HoverableElement
                  uKey={day.key + day.value}
                  element={day.icon}
                  hoveredElement={day.hoverIcon}
                />
              }
            >
              {day.label}
            </SelectItem>
          ))}
        </SelectSection>
      </Select>
      <div className='mt-2 flex flex-col gap-2'>
        <InfoText text='Renewal appears in background once a day at ~ 00:00 UTC.' />
      </div>
    </motion.div>
  )
}

export default memo(RenewSelect)
