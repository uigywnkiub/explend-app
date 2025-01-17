'use client'

import { PiArrowCircleDownFill, PiArrowCircleUpFill } from 'react-icons/pi'

import { DEFAULT_CURRENCY_CODE } from '@/config/constants/main'

import TransactionItem from '@/app/ui/home/transaction-item'

import { cn, getFormattedCurrency } from '../../lib/helpers'
import type {
  TGroupedTransactions,
  TTotalsTransaction,
  TTransaction,
} from '../../lib/types'
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
  return (
    <>
      {Object.keys(groupedTransactionsByDate)?.map((date, idx) => {
        const { income, expense } = totalsTransactionsByDate[date]

        const incomeIcon = <PiArrowCircleUpFill className='fill-success' />
        const expenseIcon = <PiArrowCircleDownFill className='fill-danger' />
        const totalsWrapper = 'flex items-center gap-1'
        const totalsCurrency = currency?.code || DEFAULT_CURRENCY_CODE

        return (
          <div
            key={date}
            className={cn('mx-auto max-w-3xl', idx !== 0 && 'pt-4')}
          >
            <div className='flex items-center justify-between py-2 text-default-500'>
              <InfoText text={date} withAsterisk={false} isSm />
              <div className='flex gap-2 text-sm hover:cursor-none'>
                {income > 0 && (
                  <div className={totalsWrapper}>
                    {incomeIcon}
                    <InfoText
                      text={`${getFormattedCurrency(income)} ${totalsCurrency}`}
                      withAsterisk={false}
                      isSm
                    />
                  </div>
                )}
                {expense > 0 && (
                  <div className={totalsWrapper}>
                    {expenseIcon}
                    <InfoText
                      text={`${getFormattedCurrency(expense)} ${totalsCurrency}`}
                      withAsterisk={false}
                      isSm
                    />
                  </div>
                )}
              </div>
            </div>
            <ul>
              {groupedTransactionsByDate[date]
                ?.sort((t1, t2) => {
                  const t1Time = new Date(t1.createdAt).getTime()
                  const t2Time = new Date(t2.createdAt).getTime()

                  return t2Time - t1Time
                })
                .map((t) => {
                  const hasCategoryChanged =
                    transactionsWithChangedCategory.some(
                      (transaction) => transaction.id === t.id,
                    )

                  return (
                    <li
                      key={t.id}
                      className='mb-3 flex w-full justify-between text-sm'
                    >
                      <TransactionItem
                        id={t.id}
                        category={t.category}
                        description={t.description}
                        amount={t.amount}
                        currency={t.currency}
                        isIncome={t.isIncome}
                        isEdited={t.isEdited}
                        createdAt={t.createdAt}
                        hasCategoryChanged={hasCategoryChanged}
                      />
                    </li>
                  )
                })}
            </ul>
          </div>
        )
      })}
    </>
  )
}

export default TransactionList
