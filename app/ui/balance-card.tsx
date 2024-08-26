'use client'

import { useCallback, useEffect, useState } from 'react'
import { PiArrowCircleDownFill, PiArrowCircleUpFill } from 'react-icons/pi'

import { Card, CardHeader } from '@nextui-org/react'

import {
  DEFAULT_CURRENCY_CODE,
  DEFAULT_TIME_ZONE,
} from '@/config/constants/main'

import { getAllTransactions } from '../lib/actions'
import { getTransactionsTotals } from '../lib/data'
import {
  getFormattedBalance,
  getFormattedCurrency,
  getGreeting,
} from '../lib/helpers'
import type { TTransaction, TUser } from '../lib/types'
import Loading from '../loading'

type TProps = {
  balance: TTransaction['balance']
  currency: TTransaction['currency']
  user: TUser | undefined
}

function BalanceCard({ balance, currency, user }: TProps) {
  const [isChangeInfo, setIsChangeInfo] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [total, setTotal] = useState<{
    income: string
    expense: string
  }>({
    income: '',
    expense: '',
  })
  // const [isFocused, setIsFocused] = useState(false)
  // const [position, setPosition] = useState({ x: 0, y: 0 })
  // const [opacity, setOpacity] = useState(0)
  // const divRef = useRef<HTMLDivElement>(null)
  // const isMd = useMedia(getBreakpointWidth('md'), false)

  // const isPositiveBalance = Number(balance) > 0
  const userId = user?.email
  const isTotalLoaded = total.income || total.income
  const currentTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const greetingMsg = `${getGreeting(currentTimeZone || DEFAULT_TIME_ZONE)}, ${user?.name} 👋🏼`

  const onChangeInfo = () => {
    setIsChangeInfo((prev) => !prev)
  }

  const getTotal = useCallback(async () => {
    setIsLoading(true)
    try {
      const transactions = await getAllTransactions(userId)
      setTotal({
        income: getFormattedCurrency(
          getTransactionsTotals(transactions).income,
        ),
        expense: getFormattedCurrency(
          getTransactionsTotals(transactions).expense,
        ),
      })
    } catch (err) {
      setTotal({
        income: '',
        expense: '',
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (isChangeInfo && !isTotalLoaded) {
      getTotal()
    }
  }, [getTotal, isChangeInfo, isTotalLoaded])

  // const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
  //   if (!isMd) return
  //   if (!divRef.current || isFocused) return
  //   const div = divRef.current
  //   const rect = div.getBoundingClientRect()
  //   setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  // }

  // const onFocus = () => {
  //   if (!isMd) return
  //   setIsFocused(true)
  //   setOpacity(1)
  // }

  // const onBlur = () => {
  //   if (!isMd) return
  //   setIsFocused(false)
  //   setOpacity(0)
  // }

  // const onMouseEnter = () => {
  //   if (!isMd) return
  //   setOpacity(1)
  // }

  // const onMouseLeave = () => {
  //   if (!isMd) return
  //   setOpacity(0)
  //   divRef.current?.blur()
  // }

  return (
    <Card
      // ref={divRef}
      // onMouseMove={onMouseMove}
      // onFocus={onFocus}
      // onBlur={onBlur}
      // onMouseEnter={onMouseEnter}
      // onMouseLeave={onMouseLeave}
      className='p-2'
      shadow='none'
    >
      <div
        className='pointer-events-none absolute -inset-px opacity-0 transition duration-300'
        // style={{
        //   opacity,
        //   background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${isPositiveBalance ? SUCCESS : DANGER}${OPACITY.O20}, transparent 40%)`,
        // }}
      />
      <CardHeader className='flex flex-col items-center justify-between gap-4 px-2 md:px-4'>
        <div
          className='text-center text-xl'
          onClick={onChangeInfo}
          aria-hidden='true'
        >
          <p className='mb-4 text-xs'>{greetingMsg}</p>
          {isChangeInfo ? (
            <>
              {!isLoading && isTotalLoaded ? (
                <div className='flex cursor-pointer flex-wrap justify-center gap-0 text-lg font-semibold md:gap-2'>
                  <p>
                    {
                      <PiArrowCircleUpFill className='mr-1 inline fill-success' />
                    }
                    Income: {total.income} {currency?.code}
                  </p>
                  <p>
                    {
                      <PiArrowCircleDownFill className='mr-1 inline fill-danger' />
                    }
                    Expense: {total.expense} {currency?.code}
                  </p>
                </div>
              ) : (
                <Loading
                  size='sm'
                  inline
                  wrapperCN='flex flex-col items-center py-1'
                />
              )}
            </>
          ) : (
            <p className='cursor-pointer font-semibold'>
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
