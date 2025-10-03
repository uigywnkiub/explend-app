'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { PiCalendar, PiCalendarFill } from 'react-icons/pi'

import { Select, SelectItem, SelectSection } from '@heroui/react'

import { DEFAULT_ICON_SIZE, DEFAULT_SALARY_DAY } from '@/config/constants/main'

import { updateSalaryDay } from '@/app/lib/actions'
import type { TGetTransactions, TTransaction, TUserId } from '@/app/lib/types'

import { HoverableElement } from '../hoverables'

const SALARY_DAYS = Array.from({ length: 31 }, (_, i) => {
  const day = (i + 1).toString()

  return {
    key: day,
    value: day,
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

  const onChangeSalaryDay = async (key: string) => {
    setIsLoading(true)
    try {
      await updateSalaryDay(userId, Number(key))
      toast.success('Salary day updated.')
    } catch (err) {
      toast.error('Failed to update salary day.')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const disableState =
    userSalaryDay?.toString() || DEFAULT_SALARY_DAY.toString()

  return (
    <Select
      isVirtualized={false}
      label='Select a salary day'
      items={SALARY_DAYS}
      isDisabled={!transactionsCount}
      isLoading={isLoading}
      disabledKeys={disableState ? [disableState] : []}
      defaultSelectedKeys={disableState ? [disableState] : []}
      onChange={(key) => onChangeSalaryDay(key.target.value)}
    >
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
            {day.value}
          </SelectItem>
        ))}
      </SelectSection>
    </Select>
  )
}

export default SalaryDay
