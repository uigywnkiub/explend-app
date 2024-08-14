'use client'

import { useRef, useState } from 'react'

import { Card, CardHeader } from '@nextui-org/react'

import { DANGER, OPACITY, SUCCESS } from '@/config/constants/colors'
import {
  DEFAULT_CURRENCY_CODE,
  DEFAULT_TIME_ZONE,
} from '@/config/constants/main'

import type { TTransaction, TUser } from '../lib/types'
import { getFormattedBalance, getGreeting } from '../lib/utils'

type TProps = {
  balance: TTransaction['balance']
  currency: TTransaction['currency']
  user: TUser | undefined
}

function BalanceCard({ balance, currency, user }: TProps) {
  const divRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)

  const isPositiveBalance = Number(balance) > 0
  const currentTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const greetingMsg = `${getGreeting(currentTimeZone || DEFAULT_TIME_ZONE)}, ${user?.name} 👋🏼`

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
      <CardHeader className='flex items-center justify-between px-2 md:px-4'>
        <p className='text-xxs font-semibold md:text-xs md:font-semibold'>
          {greetingMsg}
        </p>
        <h4 className='text-lg font-semibold md:text-xl md:font-semibold'>
          {getFormattedBalance(balance)}{' '}
          {currency?.code || DEFAULT_CURRENCY_CODE}
        </h4>
      </CardHeader>
    </Card>
  )
}

export default BalanceCard
