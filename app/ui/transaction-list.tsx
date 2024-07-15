import { PiArrowCircleDownFill, PiArrowCircleUpFill } from 'react-icons/pi'

import { DEFAULT_CURRENCY_CODE } from '@/config/constants/main'

import TransactionItem from '@/app/ui/transaction-item'

import {
  TGroupedTransactions,
  TTotalsTransaction,
  TTransaction,
} from '../lib/types'
import { getFormattedCurrency } from '../lib/utils'

type TProps = {
  groupedTransactionsByDate: TGroupedTransactions
  totalsTransactionsByDate: TTotalsTransaction
  currency: TTransaction['currency']
}

const TransactionsByDate = ({
  groupedTransactionsByDate,
  totalsTransactionsByDate,
  currency,
}: TProps) => {
  const totalsWrapper =
    'flex items-center gap-1 text-default-300 hover:text-foreground'

  return (
    <>
      {Object.keys(groupedTransactionsByDate)?.map((date) => {
        const { income, expense } = totalsTransactionsByDate[date]

        return (
          <div key={date} className='mx-auto max-w-3xl'>
            <div className='flex items-center justify-between p-2 text-default-500'>
              <p className='text-sm text-default-300 hover:cursor-none hover:text-foreground'>
                {date}
              </p>
              <div className='flex gap-2 text-sm hover:cursor-none'>
                {income > 0 && (
                  <p className={totalsWrapper}>
                    <PiArrowCircleUpFill className='fill-success' />
                    {getFormattedCurrency(income)}{' '}
                    {currency?.code || DEFAULT_CURRENCY_CODE}
                  </p>
                )}
                {expense > 0 && (
                  <p className={totalsWrapper}>
                    <PiArrowCircleDownFill className='fill-danger' />
                    {getFormattedCurrency(expense)}{' '}
                    {currency?.code || DEFAULT_CURRENCY_CODE}
                  </p>
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
                .map((transaction) => (
                  <li
                    key={transaction.id}
                    className='mb-2 flex justify-between text-sm'
                  >
                    <TransactionItem
                      id={transaction.id}
                      category={transaction.category}
                      description={transaction.description}
                      amount={transaction.amount}
                      currency={transaction.currency}
                      isIncome={transaction.isIncome}
                      isEdited={transaction.isEdited}
                      createdAt={transaction.createdAt}
                    />
                  </li>
                ))}
            </ul>
          </div>
        )
      })}
    </>
  )
}

export default TransactionsByDate
