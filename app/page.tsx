import { PiArrowCircleDownFill, PiArrowCircleUpFill } from 'react-icons/pi'

import type { Metadata } from 'next'

import { APP_NAME, DEFAULT_CURRENCY_CODE } from '@/config/constants/main'
import {
  DEFAULT_TRANSACTION_LIMIT,
  NAV_TITLE,
  SEARCH_PARAM,
} from '@/config/constants/navigation'

import TransactionItem from '@/app/ui/transaction-item'

import {
  createTransaction,
  getBalance,
  getCachedAuthSession,
  getCurrency,
  getTransactionLimit,
  getTransactions,
} from './lib/actions'
import type {
  TGroupedTransactions,
  TTotalsTransaction,
  TTransaction,
} from './lib/types'
import { formatDate, getFormattedCurrency } from './lib/utils'
import BalanceLine from './ui/balance-line'
import NoTransactionsPlug from './ui/no-transaction-text'
import PaginationList from './ui/pagination/pagination-list'
import Search from './ui/search'
import WithSidebar from './ui/sidebar/with-sidebar'
import TransactionForm from './ui/transaction-form'

export const metadata: Metadata = {
  title: `${NAV_TITLE.HOME} | ${APP_NAME.FULL}`,
}

export default async function Home({
  searchParams,
}: {
  searchParams?: {
    [SEARCH_PARAM.QUERY]?: string
    [SEARCH_PARAM.PAGE]?: string
  }
}) {
  const session = await getCachedAuthSession()
  const userId = session?.user?.email
  const query = searchParams?.[SEARCH_PARAM.QUERY] || ''
  const page = Number(searchParams?.[SEARCH_PARAM.PAGE]) || 1
  const userTransactionLimit = query
    ? Infinity
    : await getTransactionLimit(userId)
  const limit = userTransactionLimit || DEFAULT_TRANSACTION_LIMIT
  const offset = (page - 1) * limit
  const [balance, currency, { transactions, totalEntries, totalPages }] =
    await Promise.all([
      getBalance(userId),
      getCurrency(userId),
      getTransactions(userId, offset, limit),
    ])

  const createTransactionWithUserId = createTransaction.bind(
    null,
    userId,
    currency,
  )

  const filteredTransactionsByQuery = transactions.filter((e) => {
    return e.description.toLowerCase().includes(query.toLowerCase())
  })
  const hasSearchedTransactions = filteredTransactionsByQuery.length > 0

  const groupedTransactionsByDate: TGroupedTransactions = (
    query ? filteredTransactionsByQuery : transactions
  )?.reduce(
    (acc: Record<string, TTransaction[]>, transaction: TTransaction) => {
      const date = formatDate(transaction.createdAt)
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].unshift(transaction)
      return acc
    },
    {},
  )

  const totalsTransactionsByDate: TTotalsTransaction = Object.fromEntries(
    Object.entries(groupedTransactionsByDate).map(([date, transactions]) => {
      const totals = transactions.reduce(
        (totals, transaction) => {
          if (transaction.isIncome) {
            totals.income += parseFloat(transaction.amount)
          } else {
            totals.expense += parseFloat(transaction.amount)
          }
          return totals
        },
        { income: 0, expense: 0 },
      )
      return [date, totals]
    }),
  )

  const content = (
    <>
      <h1 className='mb-8 text-center text-2xl font-bold'>{NAV_TITLE.HOME}</h1>
      <div className='mx-auto flex max-w-2xl flex-col gap-y-4'>
        <BalanceLine
          balance={balance}
          currency={currency}
          user={session?.user}
        />
        <form action={createTransactionWithUserId}>
          <TransactionForm currency={currency} />
        </form>
        <div className='text-center text-default-300'>
          {transactions.length === 0 ? (
            <NoTransactionsPlug />
          ) : (
            <>
              <Search
                placeholder='Type to search...'
                hasSearchedTransactions={hasSearchedTransactions}
              />
              <div className='mt-4'>
                {!hasSearchedTransactions ? (
                  <p>No Transactions Found</p>
                ) : (
                  <p>Last Transactions</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      {Object.keys(groupedTransactionsByDate)?.map((date) => {
        const { income, expense } = totalsTransactionsByDate[date]
        const totalsWrapper =
          'flex items-center gap-1 text-default-300 hover:text-foreground'

        return (
          <div key={date} className='mx-auto max-w-2xl px-2'>
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
                ?.toSorted((t1, t2) => {
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
      <div className='mt-4'>
        {!query && (
          <PaginationList
            totalPages={totalPages}
            totalEntries={totalEntries}
            limit={limit}
          />
        )}
      </div>
    </>
  )

  return <WithSidebar contentNearby={content} />
}
