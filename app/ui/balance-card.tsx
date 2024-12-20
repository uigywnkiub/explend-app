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
    getTotal()
  }, [balance, getTotal])

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
