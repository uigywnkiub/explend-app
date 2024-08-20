'use client'

import { useRef, useState } from 'react'
import { PiArrowCircleDownFill, PiArrowCircleUpFill } from 'react-icons/pi'

import { Card, CardHeader } from '@nextui-org/react'

import { DANGER, OPACITY, SUCCESS } from '@/config/constants/colors'
import {
  DEFAULT_CURRENCY_CODE,
  DEFAULT_TIME_ZONE,
} from '@/config/constants/main'

import type { TTransaction, TUser } from '../lib/types'
import {
  getFormattedBalance,
  getFormattedCurrency,
  getGreeting,
} from '../lib/utils'

type TProps = {
  balance: TTransaction['balance']
  currency: TTransaction['currency']
  user: TUser | undefined
  incomeAmount: number
  expenseAmount: number
}

function BalanceCard({
  balance,
  currency,
  user,
  incomeAmount,
  expenseAmount,
}: TProps) {
  const divRef = useRef<HTMLDivElement>(null)
  const [isChangeInfo, setIsChangeInfo] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)

  const isPositiveBalance = Number(balance) > 0
  const currentTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const greetingMsg = `${getGreeting(currentTimeZone || DEFAULT_TIME_ZONE)}, ${user?.name} 👋🏼`

  const onChangeInfo = () => {
    setIsChangeInfo((prev) => !prev)
  }

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current || isFocused) return
    const div = divRef.current
    const rect = div.getBoundingClientRect()
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const onFocus = () => {
    setIsFocused(true)
    setOpacity(1)
  }

  const onBlur = () => {
    setIsFocused(false)
    setOpacity(0)
  }

  const onMouseEnter = () => {
    setOpacity(1)
  }

  const onMouseLeave = () => {
    setOpacity(0)
    divRef.current?.blur()
  }

  return (
    <Card
      ref={divRef}
      onMouseMove={onMouseMove}
      onFocus={onFocus}
      onBlur={onBlur}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className='p-2'
      shadow='none'
    >
      <div
        className='pointer-events-none absolute -inset-px opacity-0 transition duration-300'
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${isPositiveBalance ? SUCCESS : DANGER}${OPACITY.O20}, transparent 40%)`,
        }}
      />
      <CardHeader className='flex flex-col items-center justify-between gap-4 px-2 md:px-4'>
        <div
          className='text-center text-xl font-semibold'
          onClick={onChangeInfo}
          aria-hidden='true'
        >
          <p className='mb-4 text-xs'>{greetingMsg}</p>
          {isChangeInfo ? (
            <div className='flex cursor-pointer flex-wrap justify-center gap-2'>
              <p>
                {<PiArrowCircleUpFill className='mr-1 inline fill-success' />}
                Income: {getFormattedCurrency(incomeAmount)} {currency?.code}
              </p>
              <p>
                {<PiArrowCircleDownFill className='mr-1 inline fill-danger' />}
                Expense: {getFormattedCurrency(expenseAmount)} {currency?.code}
              </p>
            </div>
          ) : (
            <p className='cursor-pointer'>
              {getFormattedBalance(balance)}{' '}
              {currency?.code || DEFAULT_CURRENCY_CODE}
            </p>
          )}
        </div>
      </CardHeader>
    </Card>
  )
}

export default BalanceCard
