import { PiWarningOctagonFill } from 'react-icons/pi'

import DEFAULT_CATEGORIES from '@/public/data/default-categories.json'

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
import {
  getTransactionsWithChangedCategory,
  getUserCategories,
} from './lib/data'
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
import BalanceCard from './ui/balance-card'
import ClientRouterRefresh from './ui/client-router-refresh'
import CreateTestTransactions from './ui/home/create-test-transactions'
import DeleteTestTransactions from './ui/home/delete-test-transactions'
import Search from './ui/home/search'
import SearchedTransactions from './ui/home/searched-transactions'
import TransactionForm from './ui/home/transaction-form'
import TransactionList from './ui/home/transaction-list'
import NoTransactionsPlug from './ui/no-transactions-plug'
import PaginationList from './ui/pagination/pagination-list'
import WithSidebar from './ui/sidebar/with-sidebar'

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

  const allHaveCategories = transactions.every(
    (t) => Array.isArray(t.categories) && t.categories.length > 0,
  )
  if (!allHaveCategories) {
    await resetCategories(userId, DEFAULT_CATEGORIES, false)

    return <ClientRouterRefresh loadingText='Refreshing categories...' />
  }
  const userCategories = getUserCategories(transactions)

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

  const hasTestTransactions = transactions.some((t) => t.isTest)

  const searchedTransactionsByQuery = transactions.filter((t) => {
    const queryTrimmed = query.trim()
    const queryLower = toLowerCase(queryTrimmed)

    // Detect pattern: optional whitespace, '>' or '<', optional whitespace, then number (int or float).
    const comparisonMatch = queryTrimmed.match(/^([<>])\s*(\d+(\.\d+)?)/)

    if (comparisonMatch) {
      const operator = comparisonMatch[1]
      const amount = parseFloat(comparisonMatch[2])

      if (operator === '>') {
        return Number(t.amount) >= amount
      } else if (operator === '<') {
        return Number(t.amount) <= amount
      }
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
    <>
      <h1 className='mb-4 text-center text-3xl font-semibold md:mb-8'>
        {NAV_TITLE.HOME}
      </h1>
      <div className='mx-auto flex max-w-3xl flex-col gap-y-0'>
        <BalanceCard
          user={session?.user}
          balance={balance}
          currency={currency}
          hasTransactions={totalEntries > 0}
        />
        <form action={createTransactionWithUserId} className='mt-4'>
          <TransactionForm
            currency={currency}
            userCategories={userCategories}
          />
        </form>
        <div className='text-center text-default-500'>
          {totalEntries === 0 ? (
            <div className='mt-4'>
              <NoTransactionsPlug />
            </div>
          ) : (
            <>
              <Search
                hasSearchedTransactionsByQuery={hasSearchedTransactionsByQuery}
              />
              <div className='my-2'>
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
        transactionsWithChangedCategory={transactionsWithChangedCategory}
        currency={currency}
      />
      <div className='mx-auto mt-4 max-w-3xl'>
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
        {countTransactionsWithChangedCategory > 0 && (
          <p className='mt-4 text-center text-sm text-warning'>
            <PiWarningOctagonFill className='inline animate-pulse' />{' '}
            {`You have ${countTransactionsWithChangedCategory} ${pluralize(countTransactionsWithChangedCategory, 'transaction', 'transactions')} with the old category.`}
          </p>
        )}
      </div>
    </>
  )

  return <WithSidebar contentNearby={content} />
}
