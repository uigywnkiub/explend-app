'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { PiArrowCircleDownFill, PiArrowCircleUpFill } from 'react-icons/pi'

import { Card, CardHeader } from '@nextui-org/react'
import { motion } from 'framer-motion'

import {
  DEFAULT_CURRENCY_CODE,
  DEFAULT_TIME_ZONE,
} from '@/config/constants/main'
import { DIV } from '@/config/constants/motion'

import { getAllTransactions } from '../lib/actions'
import { getTransactionsTotals } from '../lib/data'
import {
  cn,
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
  const hasMounted = useRef(false)
  const [isChangeInfo, setIsChangeInfo] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [total, setTotal] = useState<{
    income: number
    expense: number
  }>({
    income: 0,
    expense: 0,
  })

  const userId = user?.email
  const isTotalLoaded = total.income || total.income
  const isPositiveBalance = Number(balance) > 0
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
        income: getTransactionsTotals(transactions).income,
        expense: getTransactionsTotals(transactions).expense,
      })
    } catch (err) {
      setTotal({
        income: 0,
        expense: 0,
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

  useEffect(() => {
    if (hasMounted.current) {
      // Don't run on first render.
      getTotal()
    } else {
      hasMounted.current = true
    }
  }, [getTotal, balance])

  return (
    <Card
      className={cn(
        'p-2',
        isPositiveBalance
          ? 'bg-gradient-radial from-success/20 to-content1'
          : 'bg-gradient-radial from-danger/20 to-content1',
      )}
      shadow='none'
    >
      <div className='pointer-events-none absolute -inset-px opacity-0 transition duration-300' />
      <CardHeader className='flex flex-col items-center justify-between gap-4 px-2 md:px-4'>
        <div
          className='cursor-pointer text-center text-xl'
          onClick={onChangeInfo}
          aria-hidden='true'
        >
          <p className='mb-4 text-xs'>{greetingMsg}</p>
          {isChangeInfo ? (
            <>
              {!isLoading && isTotalLoaded ? (
                <motion.div
                  className='flex select-none flex-wrap justify-center gap-0 text-lg font-semibold md:gap-2'
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ ...DIV.TRANSITION_SPRING }}
                >
                  <p>
                    <PiArrowCircleUpFill className='mr-1 inline fill-success' />
                    <span className='text-sm text-default-500'>
                      Income:
                    </span>{' '}
                    {getFormattedCurrency(total.income)} {currency?.code}
                  </p>
                  <p>
                    <PiArrowCircleDownFill className='mr-1 inline fill-danger' />
                    <span className='text-sm text-default-500'>Expense:</span>{' '}
                    {getFormattedCurrency(total.expense)} {currency?.code}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  className='flex h-7 items-center justify-center gap-2'
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ ...DIV.TRANSITION_SPRING }}
                >
                  <Loading
                    size='sm'
                    inline
                    wrapperClassName='flex flex-col items-center mb-1'
                  />
                  <p className='text-sm'>Loading totals...</p>
                </motion.div>
              )}
            </>
          ) : (
            <motion.p
              className='select-none font-semibold'
              initial={
                isTotalLoaded
                  ? { opacity: 0, scale: 0 }
                  : { opacity: 1, scale: 1 }
              }
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...DIV.TRANSITION_SPRING }}
            >
              {getFormattedBalance(balance)}{' '}
              {currency?.code || DEFAULT_CURRENCY_CODE}
            </motion.p>
          )}
        </div>
      </CardHeader>
    </Card>
  )
}

export default BalanceCard
