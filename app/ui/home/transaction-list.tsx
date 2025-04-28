'use client'

import { PiArrowCircleDownFill, PiArrowCircleUpFill } from 'react-icons/pi'

import { useSearchParams } from 'next/navigation'

import { AnimatePresence, motion } from 'framer-motion'

import { MOTION_LIST } from '@/config/constants/motion'
import { SEARCH_PARAM } from '@/config/constants/navigation'

import TransactionItem from '@/app/ui/home/transaction-item'

import { cn } from '../../lib/helpers'
import type {
  TGroupedTransactions,
  TTotalsTransaction,
  TTransaction,
} from '../../lib/types'
import FlowValue from '../flow-value'
import InfoText from '../info-text'

type TProps = {
  groupedTransactionsByDate: TGroupedTransactions
  totalsTransactionsByDate: TTotalsTransaction
  transactionsWithChangedCategory: TTransaction[]
  currency: TTransaction['currency']
}

function TransactionList({
  groupedTransactionsByDate,
  totalsTransactionsByDate,
  transactionsWithChangedCategory,
  currency,
}: TProps) {
  const searchParams = useSearchParams()
  const query = searchParams.get(SEARCH_PARAM.QUERY)?.toString() || ''

  const changedCategoryIds = new Set(
    transactionsWithChangedCategory.map((t) => t.id),
  )

  return (
    <>
      <AnimatePresence>
        {Object.keys(groupedTransactionsByDate)?.map((date, idx) => {
          const { income, expense } = totalsTransactionsByDate[date]

          const incomeIcon = <PiArrowCircleUpFill className='fill-success' />
          const expenseIcon = <PiArrowCircleDownFill className='fill-danger' />
          const totalWrapper = 'flex items-center gap-1'

          return (
            <motion.div
              key={date}
              className={cn('mx-auto max-w-3xl', idx !== 0 && 'pt-4')}
              {...MOTION_LIST(idx)}
            >
              <div className='flex items-center justify-between py-2'>
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
    </>
  )
}

export default TransactionList
