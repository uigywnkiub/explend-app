import { PiWarningOctagonFill } from 'react-icons/pi'

import type { Metadata } from 'next'

import DEFAULT_CATEGORIES from '@/public/data/default-categories.json'

import { APP_NAME } from '@/config/constants/main'
import {
  DEFAULT_TRANSACTION_LIMIT,
  NAV_TITLE,
  SEARCH_PARAM,
} from '@/config/constants/navigation'

import {
  createTransaction,
  getCachedAllTransactions,
  getCachedAuthSession,
  getCachedBalance,
  getCachedCurrency,
  getCachedTransactionLimit,
  getCachedTransactions,
  resetCategories,
} from './lib/actions'
import type {
  TGroupedTransactions,
  TTotalsTransaction,
  TTransaction,
} from './lib/types'
import {
  formatDate,
  getCategoryWithoutEmoji,
  getTransactionsWithChangedCategory,
  pluralize,
} from './lib/utils'
import BalanceCard from './ui/balance-card'
import Search from './ui/home/search'
import TransactionForm from './ui/home/transaction-form'
import TransactionList from './ui/home/transaction-list'
import InfoText from './ui/info-text'
import NoTransactionsPlug from './ui/no-transactions-plug'
import PaginationList from './ui/pagination/pagination-list'
import WithSidebar from './ui/sidebar/with-sidebar'

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
    : await getCachedTransactionLimit(userId)
  const limit = userTransactionLimit || DEFAULT_TRANSACTION_LIMIT
  const offset = (page - 1) * limit
  const [balance, currency, { transactions, totalEntries, totalPages }] =
    await Promise.all([
      getCachedBalance(userId),
      getCachedCurrency(userId),
      getCachedTransactions(userId, offset, limit),
    ])

  const haveCategories = transactions.every((t) => t.categories)
  if (!haveCategories) {
    await resetCategories(userId, DEFAULT_CATEGORIES)
  }

  const [userCategories] = transactions.map((t) => t.categories).filter(Boolean)

  const createTransactionWithUserId = createTransaction.bind(
    null,
    userId,
    currency,
    userCategories,
  )

  const transactionsWithChangedCategory = getTransactionsWithChangedCategory(
    await getCachedAllTransactions(userId),
  )
  const countTransactionsWithChangedCategory =
    transactionsWithChangedCategory.length

  const searchedTransactionsByQuery = transactions.filter((t) => {
    const toLowerCase = (str: string) => str.toLowerCase()
    return (
      toLowerCase(t.description).includes(toLowerCase(query)) ||
      toLowerCase(t.amount).includes(toLowerCase(query)) ||
      toLowerCase(getCategoryWithoutEmoji(t.category)).includes(
        toLowerCase(query),
      )
    )
  })
  const hasSearchedTransactionsByQuery = searchedTransactionsByQuery.length > 0
  const countSearchedTransactionsByQuery = searchedTransactionsByQuery.length

  const groupedTransactionsByDate: TGroupedTransactions = (
    query ? searchedTransactionsByQuery : transactions
  )?.reduce((acc: Record<string, TTransaction[]>, t: TTransaction) => {
    const date = formatDate(t.createdAt)
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].unshift(t)
    return acc
  }, {})

  const totalsTransactionsByDate: TTotalsTransaction = Object.fromEntries(
    Object.entries(groupedTransactionsByDate).map(([date, transactions]) => {
      const totals = transactions.reduce(
        (totals, t) => {
          if (t.isIncome) {
            totals.income += parseFloat(t.amount)
          } else {
            totals.expense += parseFloat(t.amount)
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
      <h1 className='mb-4 text-center text-3xl font-semibold md:mb-8'>
        {NAV_TITLE.HOME}
      </h1>
      <div className='mx-auto flex max-w-3xl flex-col gap-y-2'>
        <BalanceCard
          balance={balance}
          currency={currency}
          user={session?.user}
        />
        <form action={createTransactionWithUserId} className='mt-4'>
          <TransactionForm
            currency={currency}
            userCategories={userCategories}
          />
        </form>
        <div className='text-center text-default-300'>
          {transactions.length === 0 ? (
            <>
              <NoTransactionsPlug />
              <div className='mt-2 flex flex-col gap-2'>
                <InfoText text='The first written transaction means creating your account.' />
                <InfoText text='The last deleted transaction means deleting your account.' />
              </div>
            </>
          ) : (
            <>
              <Search
                hasSearchedTransactionsByQuery={hasSearchedTransactionsByQuery}
              />
              <div className='mb-2 mt-4'>
                {!hasSearchedTransactionsByQuery ? (
                  <p>No Transactions Found</p>
                ) : (
                  <>
                    {!query ? (
                      <p>
                        Last{' '}
                        {pluralize(
                          transactions.length,
                          'Transaction',
                          'Transactions',
                        )}
                      </p>
                    ) : (
                      <p>
                        Found {countSearchedTransactionsByQuery}{' '}
                        {pluralize(
                          countSearchedTransactionsByQuery,
                          'Transaction',
                          'Transactions',
                        )}
                      </p>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <TransactionList
        groupedTransactionsByDate={groupedTransactionsByDate}
        totalsTransactionsByDate={totalsTransactionsByDate}
        transactionsWithChangedCategory={transactionsWithChangedCategory}
        currency={currency}
      />
      <div className='mx-auto mt-4 max-w-3xl'>
        {!query && (
          <PaginationList
            totalPages={totalPages}
            totalEntries={totalEntries}
            limit={limit}
          />
        )}
        {countTransactionsWithChangedCategory > 0 && (
          <p className='mt-4 text-center text-sm text-warning'>
            <PiWarningOctagonFill className='inline animate-pulse' />{' '}
            {`You still have ${countTransactionsWithChangedCategory} ${pluralize(countTransactionsWithChangedCategory, 'transaction', 'transactions')} with the old category.`}
          </p>
        )}
      </div>
    </>
  )

  return <WithSidebar contentNearby={content} />
}
