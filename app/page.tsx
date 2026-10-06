import { Metadata } from 'next'

import {
  DEFAULT_TRANSACTION_LIMIT,
  NAV_TITLE,
  SEARCH_PARAM,
} from '@/config/constants/navigation'
import { siteMeta } from '@/config/site-meta'

import {
  createTransaction,
  getCachedAuthSession,
  getCachedBalance,
  getCachedCurrency,
  getCachedTransactionLimit,
  getCachedTransactions,
  getCachedUserCategories,
} from './lib/actions'
import { getUserCategories } from './lib/data'
import {
  formatDate,
  getCategoryWithoutEmoji,
  pluralize,
  toLowerCase,
} from './lib/helpers'
import type {
  TGroupedTransactions,
  TTotalsTransaction,
  TTransaction,
} from './lib/types'
import BalanceCardSection from './ui/home/balance-card-section'
import CreateTestTransactions from './ui/home/create-test-transactions'
import DeleteTestTransactions from './ui/home/delete-test-transactions'
import Search from './ui/home/search'
import SearchedTransactions from './ui/home/searched-transactions'
import TransactionForm from './ui/home/transaction-form'
import TransactionList from './ui/home/transaction-list'
import NoTransactionsPlug from './ui/no-transactions-plug'
import PaginationList from './ui/pagination/pagination-list'
import WithSidebar from './ui/sidebar/with-sidebar'

export const metadata: Metadata = {
  title: `${NAV_TITLE.HOME} | ${siteMeta.title}`,
  description:
    'Track your expenses and income with Explend. Get insights, manage budgets, and achieve your financial goals.',
}

export default async function Page(props: {
  searchParams?: Promise<{
    [SEARCH_PARAM.QUERY]?: string
    [SEARCH_PARAM.PAGE]?: string
  }>
}) {
  const searchParams = await props.searchParams
  const session = await getCachedAuthSession()
  const userId = session?.user?.email
  const query = searchParams?.[SEARCH_PARAM.QUERY] || ''
  const page = Number(searchParams?.[SEARCH_PARAM.PAGE]) || 1
  const balancePromise = getCachedBalance(userId)
  const userTransactionLimitPromise = query
    ? Promise.resolve(Infinity)
    : getCachedTransactionLimit(userId)
  const transactionsPromise = userTransactionLimitPromise.then(
    (userTransactionLimit) => {
      const limit = userTransactionLimit || DEFAULT_TRANSACTION_LIMIT
      const offset = (page - 1) * limit

      return getCachedTransactions(userId, offset, limit, Boolean(query))
    },
  )
  const [
    userTransactionLimit,
    currency,
    transactionData,
    userCategoriesFromSettings,
  ] = await Promise.all([
    userTransactionLimitPromise,
    getCachedCurrency(userId),
    transactionsPromise,
    getCachedUserCategories(userId),
  ])
  const { transactions, totalEntries, totalPages } = transactionData
  const userCategories = getUserCategories(userCategoriesFromSettings)
  const limit = userTransactionLimit || DEFAULT_TRANSACTION_LIMIT

  const createTransactionWithExtraData = createTransaction.bind(
    null,
    userId,
    userCategories,
  )

  const hasTestTransactions = transactions.some((t) => t.isTest)

  const searchedTransactionsByQuery = transactions.filter((t) => {
    const queryTrimmed = query.trim()
    const queryLower = toLowerCase(queryTrimmed)

    // Matches one or more chained comparisons, e.g. ">1000", "<5000", ">1000<5000", ">=1000<=5000".
    const isRangeQuery = /^([<>]=?\d+(\.\d+)?)+$/.test(queryTrimmed)

    if (isRangeQuery) {
      const comparisons = [...queryTrimmed.matchAll(/([<>]=?)(\d+(?:\.\d+)?)/g)]
      const txAmount = Number(t.amount)

      return comparisons.every(([, operator, amountStr]) => {
        const amount = parseFloat(amountStr)
        switch (operator) {
          case '>':
            return txAmount > amount
          case '>=':
            return txAmount >= amount
          case '<':
            return txAmount < amount
          case '<=':
            return txAmount <= amount
          default:
            return true
        }
      })
    }

    return (
      toLowerCase(t.description).includes(queryLower) ||
      toLowerCase(t.amount).includes(queryLower) ||
      toLowerCase(getCategoryWithoutEmoji(t.category)).includes(queryLower) ||
      toLowerCase(formatDate(t.createdAt)).includes(queryLower)
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
    acc[date].push(t)

    return acc
  }, {})

  const totalsTransactionsByDate: TTotalsTransaction = Object.fromEntries(
    Object.entries(groupedTransactionsByDate).map(([date, transactions]) => {
      const totals = transactions.reduce(
        (totals, t) => {
          const amount = parseFloat(t.amount)
          if (t.isIncome) {
            totals.income += amount
          } else {
            totals.expense += amount
          }

          return totals
        },
        { income: 0, expense: 0 },
      )

      return [date, totals]
    }),
  )

  const content = (
    <div className='mx-auto max-w-3xl'>
      <h1 className='mb-4 text-center text-3xl font-semibold md:mb-8'>
        {NAV_TITLE.HOME}
      </h1>
      <div className='mx-auto flex flex-col gap-y-0'>
        <BalanceCardSection
          user={session?.user}
          balancePromise={balancePromise}
          currency={currency}
          hasTransactions={totalEntries > 0}
          transactionCount={totalEntries}
        />
        <form action={createTransactionWithExtraData} className='mt-4'>
          <TransactionForm
            currency={currency}
            userCategories={userCategories}
          />
        </form>
        <div className='text-default-500 text-center'>
          {totalEntries === 0 ? (
            <div className='mt-4'>
              <NoTransactionsPlug />
            </div>
          ) : (
            <>
              <Search
                hasSearchedTransactionsByQuery={hasSearchedTransactionsByQuery}
              />
              <div className='my-2 pt-4 text-sm'>
                {!hasSearchedTransactionsByQuery ? (
                  <NoTransactionsPlug />
                ) : (
                  <>
                    {!query ? (
                      <p className='hover:text-foreground inline hover:cursor-none'>
                        Last{' '}
                        {pluralize(
                          transactions.length,
                          'Transaction',
                          'Transactions',
                        )}
                      </p>
                    ) : (
                      <p className='hover:text-foreground inline hover:cursor-none'>
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
      {totalEntries === 0 && (
        <div className='mt-6'>
          <CreateTestTransactions
            userId={userId}
            currency={currency}
            userCategories={userCategories}
          />
        </div>
      )}
      <TransactionList
        groupedTransactionsByDate={groupedTransactionsByDate}
        totalsTransactionsByDate={totalsTransactionsByDate}
        userId={userId}
        currency={currency}
        userCategories={userCategories}
      />
      <div className='mx-auto mt-4'>
        {!query ? (
          <>
            {totalEntries > 0 && (
              <PaginationList
                totalPages={totalPages}
                totalEntries={totalEntries}
                limit={limit}
              />
            )}
            {hasTestTransactions && (
              <div className='mt-6'>
                <DeleteTestTransactions userId={userId} />
              </div>
            )}
          </>
        ) : (
          hasSearchedTransactionsByQuery && (
            <SearchedTransactions
              currency={currency}
              searchedTransactionsByQuery={searchedTransactionsByQuery}
            />
          )
        )}
      </div>
    </div>
  )

  return <WithSidebar contentNearby={content} />
}
