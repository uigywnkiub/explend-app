'use client'

import { useCallback, useEffect, useState } from 'react'
import { PiArrowCircleDownFill, PiArrowCircleUpFill } from 'react-icons/pi'

import { Card, CardHeader } from '@heroui/react'
import { motion } from 'framer-motion'

import { LOCAL_STORAGE_KEY } from '@/config/constants/local-storage'
import { DEFAULT_TIME_ZONE } from '@/config/constants/main'
import { DIV } from '@/config/constants/motion'

import { getAllTransactions } from '../lib/actions'
import { getTransactionsTotals } from '../lib/data'
import {
  cn,
  getBooleanFromLocalStorage,
  getGreeting,
  setInLocalStorage,
} from '../lib/helpers'
import type { TTransaction, TUser } from '../lib/types'
import Loading from '../loading'
import AnimatedNumber from './animated-number'

type TProps = {
  user: TUser | undefined
  balance: TTransaction['balance']
  currency: TTransaction['currency']
  hasTransactions: boolean
}

function BalanceCard({ user, balance, currency, hasTransactions }: TProps) {
  const [isShowTotals, setIsChangeInfo] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [total, setTotal] = useState<{
    income: number
    expense: number
  }>({
    income: 0,
    expense: 0,
  })

  const userId = user?.email
  const isTotalLoaded = Boolean(total.income) || Boolean(total.expense)
  const isPositiveBalance = Number(balance) > 0
  const isAmountHidden = getBooleanFromLocalStorage(
    LOCAL_STORAGE_KEY.IS_AMOUNT_HIDDEN,
  )
  const currentTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const greetingMsg = `${getGreeting(currentTimeZone || DEFAULT_TIME_ZONE)}, ${user?.name} 👋🏼`

  const onChangeInfo = () => {
    if (!hasTransactions) return
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
    if (isShowTotals && !isTotalLoaded) {
      getTotal()
    }
  }, [getTotal, isShowTotals, isTotalLoaded])

  useEffect(() => {
    setInLocalStorage(
      LOCAL_STORAGE_KEY.IS_POSITIVE_BALANCE,
      String(isPositiveBalance),
    )
  }, [isPositiveBalance])

  return (
    <Card
      className={cn(
        'p-2',
        isShowTotals && isTotalLoaded
          ? isPositiveBalance
            ? 'bg-gradient-radial from-success/10 to-content1'
            : 'bg-gradient-radial from-danger/10 to-content1'
          : 'bg-content1',
        isShowTotals && isTotalLoaded && isAmountHidden && 'bg-default/50',
      )}
      shadow='none'
    >
      <div className='pointer-events-none absolute -inset-px opacity-0 transition duration-300' />
      <CardHeader className='flex flex-col items-center justify-between gap-4 px-2 md:px-4'>
        <div
          className={cn(
            'text-center text-xl',
            hasTransactions && 'cursor-pointer',
          )}
          onClick={onChangeInfo}
        >
          <p className='mb-4 text-xs'>{greetingMsg}</p>
          {isShowTotals ? (
            <>
              {!isLoading && isTotalLoaded ? (
                <motion.div
                  className='flex select-none flex-wrap justify-center gap-0 text-lg md:gap-2'
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ ...DIV.TRANSITION_SPRING }}
                >
                  <p>
                    <PiArrowCircleUpFill className='mr-1 inline fill-success' />
                    <span className='text-sm text-default-500'>
                      Income:
                    </span>{' '}
                    <span className='font-semibold'>
                      <AnimatedNumber value={total.income} /> {currency.code}
                    </span>
                  </p>
                  <p>
                    <PiArrowCircleDownFill className='mr-1 inline fill-danger' />
                    <span className='text-sm text-default-500'>Expense:</span>{' '}
                    <span className='font-semibold'>
                      <AnimatedNumber value={total.expense} /> {currency.code}
                    </span>
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
                    isInline
                    wrapperClassName='flex flex-col items-center mb-1'
                    withoutText
                  />
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
              <AnimatedNumber value={balance} isFormattedBalance />{' '}
              {currency.code}
            </motion.p>
          )}
        </div>
      </CardHeader>
    </Card>
  )
}

export default BalanceCard
