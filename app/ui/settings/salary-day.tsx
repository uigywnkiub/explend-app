'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import {
  PiCalendar,
  PiCalendarFill,
  PiCalendarX,
  PiCalendarXFill,
} from 'react-icons/pi'

import { Select, SelectItem, SelectSection } from '@heroui/react'
import { haptic } from 'ios-haptics'

import { DEFAULT_ICON_SIZE, DEFAULT_SALARY_DAY } from '@/config/constants/main'

import { updateSalaryDay } from '@/app/lib/actions'
import { getOrdinal } from '@/app/lib/helpers'
import type { TGetTransactions, TTransaction, TUserId } from '@/app/lib/types'

import { HoverableElement } from '../hoverables'

const NO_SALARY_DAY_KEY = 'none' as const

type TSalaryDayKey = string | typeof NO_SALARY_DAY_KEY

const NO_SALARY_DAY_ITEM = {
  key: NO_SALARY_DAY_KEY,
  value: NO_SALARY_DAY_KEY,
  label: 'No salary day',
  icon: <PiCalendarX size={DEFAULT_ICON_SIZE} />,
  hoverIcon: <PiCalendarXFill size={DEFAULT_ICON_SIZE} />,
}

const SALARY_DAYS = Array.from({ length: 31 }, (_, i) => {
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
  userId: TUserId
  transactionsCount: TGetTransactions['totalEntries']
  userSalaryDay: TTransaction['salaryDay']
}

function SalaryDay({ userId, transactionsCount, userSalaryDay }: TProps) {
  const [isLoading, setIsLoading] = useState(false)

  const onChangeSalaryDay = async (key: TSalaryDayKey) => {
    setIsLoading(true)
    try {
      const dayValue = key === NO_SALARY_DAY_KEY ? null : Number(key)
      await updateSalaryDay(userId, dayValue)
      haptic.confirm()
      toast.success('Salary day updated.')
    } catch (err) {
      haptic.error()
      toast.error('Failed to update salary day.')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const selectedKey: TSalaryDayKey =
    userSalaryDay === null
      ? NO_SALARY_DAY_KEY
      : (userSalaryDay ?? DEFAULT_SALARY_DAY).toString()

  return (
    <Select
      isVirtualized={false}
      label='Select a salary day'
      isDisabled={!transactionsCount}
      isLoading={isLoading}
      disabledKeys={[selectedKey]}
      defaultSelectedKeys={[selectedKey]}
      onChange={(key) => {
        haptic()
        onChangeSalaryDay(key.target.value)
      }}
    >
      <SelectSection title='Options'>
        <SelectItem
          key={NO_SALARY_DAY_ITEM.key}
          startContent={
            <HoverableElement
              uKey={NO_SALARY_DAY_ITEM.key}
              element={NO_SALARY_DAY_ITEM.icon}
              hoveredElement={NO_SALARY_DAY_ITEM.hoverIcon}
            />
          }
        >
          {NO_SALARY_DAY_ITEM.label}
        </SelectItem>
      </SelectSection>
      <SelectSection title='Days of the month'>
        {SALARY_DAYS.map((day) => (
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
  )
}

export default SalaryDay
