'use client'

import { useEffect, useState } from 'react'
import {
  PiArrowCircleDownFill,
  PiArrowCircleUpFill,
  PiWarningOctagonFill,
} from 'react-icons/pi'

import { useSearchParams } from 'next/navigation'

import { AnimatePresence, motion } from 'framer-motion'

import { MOTION_LIST } from '@/config/constants/motion'
import { SEARCH_PARAM } from '@/config/constants/navigation'

import { getTransactionsWithChangedCategoryIds } from '@/app/lib/actions'

import TransactionItem from '@/app/ui/home/transaction-item'

import { cn, pluralize } from '../../lib/helpers'
import type {
  TCategories,
  TCurrency,
  TGroupedTransactions,
  TTotalsTransaction,
  TTransaction,
  TUserId,
} from '../../lib/types'
import FlowValue from '../flow-value'
import InfoText from '../info-text'

type TProps = {
  groupedTransactionsByDate: TGroupedTransactions
  totalsTransactionsByDate: TTotalsTransaction
  userId: TUserId
  currency: TCurrency
  userCategories: TCategories[]
}

function TransactionList({
  groupedTransactionsByDate,
  totalsTransactionsByDate,
  userId,
  currency,
  userCategories,
}: TProps) {
  const searchParams = useSearchParams()
  const query = searchParams.get(SEARCH_PARAM.QUERY)?.toString() || ''
  const [
    transactionsWithChangedCategoryIds,
    setTransactionsWithChangedCategoryIds,
  ] = useState<TTransaction['id'][]>([])

  useEffect(() => {
    let isCurrent = true
    getTransactionsWithChangedCategoryIds(userId, userCategories)
      .then((ids) => {
        if (isCurrent) setTransactionsWithChangedCategoryIds(ids)
      })
      .catch(() => {})

    return () => {
      isCurrent = false
    }
  }, [userId, userCategories])

  const changedCategoryIds = new Set(transactionsWithChangedCategoryIds)

  return (
    <>
      <AnimatePresence>
        {Object.keys(groupedTransactionsByDate)?.map((date, idx) => {
          const { income, expense } = totalsTransactionsByDate[date]
          const transactionsCount = groupedTransactionsByDate[date]?.length || 0

          const incomeIcon = <PiArrowCircleUpFill className='fill-success' />
          const expenseIcon = <PiArrowCircleDownFill className='fill-danger' />
          const totalWrapper = 'flex items-center gap-1'

          return (
            <motion.div
              key={date}
              className={cn('mx-auto max-w-3xl', idx !== 0 && 'pt-4')}
              {...MOTION_LIST(idx)}
            >
              <div
                className={cn(
                  'bg-background/50 rounded-medium z-20 flex items-center justify-between px-4 py-2 backdrop-blur-xs backdrop-brightness-90',
                  transactionsCount >= 4 && 'sticky top-10 md:static',
                  transactionsCount >= 6 && 'md:sticky md:top-0',
                )}
              >
                <InfoText
                  text={date}
                  withAsterisk={false}
                  isSm
                  query={[query]}
                />
                <div className='flex gap-2 text-sm hover:cursor-none'>
                  <FlowValue
                    value={income}
                    currency={currency}
                    icon={incomeIcon}
                    wrapperClassName={totalWrapper}
                  />
                  <FlowValue
                    value={expense}
                    currency={currency}
                    icon={expenseIcon}
                    wrapperClassName={totalWrapper}
                  />
                </div>
              </div>
              <ul>
                <AnimatePresence>
                  {groupedTransactionsByDate[date].map((t, idx) => {
                    const hasCategoryChanged = changedCategoryIds.has(t.id)

                    return (
                      <motion.li
                        key={t.id}
                        className='mb-3 flex w-full justify-between text-sm'
                        {...MOTION_LIST(idx)}
                      >
                        <TransactionItem
                          hasCategoryChanged={hasCategoryChanged}
                          userCategories={userCategories}
                          currency={currency}
                          {...t}
                        />
                      </motion.li>
                    )
                  })}
                </AnimatePresence>
              </ul>
            </motion.div>
          )
        })}
      </AnimatePresence>
      {transactionsWithChangedCategoryIds.length > 0 && (
        <p className='text-warning mt-4 text-center text-sm'>
          <PiWarningOctagonFill className='inline animate-pulse' />{' '}
          {`You have ${transactionsWithChangedCategoryIds.length} ${pluralize(transactionsWithChangedCategoryIds.length, 'transaction', 'transactions')} with the old category.`}
        </p>
      )}
    </>
  )
}

export default TransactionList
