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
  getBalance,
  getCachedAuthSession,
  getCurrency,
  getTransactionLimit,
  getTransactions,
  resetCategories,
} from './lib/actions'
import type {
  TGroupedTransactions,
  TTotalsTransaction,
  TTransaction,
} from './lib/types'
import { formatDate, getTransactionsWithChangedCategory } from './lib/utils'
import BalanceLine from './ui/balance-line'
import InfoBadge from './ui/info-badge'
import NoTransactionsPlug from './ui/no-transaction-text'
import PaginationList from './ui/pagination/pagination-list'
import Search from './ui/search'
import WithSidebar from './ui/sidebar/with-sidebar'
import TransactionForm from './ui/transaction-form'
import TransactionList from './ui/transaction-list'

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

  const transactionsWithChangedCategory =
    getTransactionsWithChangedCategory(transactions)

  const filteredTransactionsByQuery = transactions.filter((t) => {
    return t.description.toLowerCase().includes(query.toLowerCase())
  })
  const hasSearchedTransactions = filteredTransactionsByQuery.length > 0

  const groupedTransactionsByDate: TGroupedTransactions = (
    query ? filteredTransactionsByQuery : transactions
  )?.reduce((acc: Record<string, TTransaction[]>, t: TTransaction) => {
    const date = formatDate(t.createdAt)
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].unshift(t)
    return acc
  }, {})

  const totalsTransactionsByDate: TTotalsTransaction = Object.fromEntries(
    Object.entries(groupedTransactionsByDate).map(([date, t]) => {
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
      <h1 className='mb-4 text-center text-3xl font-bold md:mb-8'>
        {NAV_TITLE.HOME}
      </h1>
      <div className='mx-auto flex max-w-3xl flex-col gap-y-2'>
        <BalanceLine
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
              <InfoBadge
                withAsterisk={false}
                text='1. The first written transaction means creating your account.'
              />
              <br />
              <InfoBadge
                withAsterisk={false}
                text='2. The last deleted transaction means deleting your account.'
              />
            </>
          ) : (
            <>
              <Search
                placeholder='Type to search...'
                hasSearchedTransactions={hasSearchedTransactions}
              />
              <div className='mb-2 mt-4'>
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
      <TransactionList
        groupedTransactionsByDate={groupedTransactionsByDate}
        totalsTransactionsByDate={totalsTransactionsByDate}
        transactionsWithChangedCategory={transactionsWithChangedCategory}
        currency={currency}
      />
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
