import type { Metadata } from 'next'

import { NAV_TITLE } from '@/config/constants/navigation'

import {
  getAuthSession,
  getCurrency,
  getTableTransactions,
} from '../lib/actions'
import { cn } from '../lib/helpers'
import NoTransactionsPlug from '../ui/no-transactions-plug'
import WithSidebar from '../ui/sidebar/with-sidebar'
import TransactionTable from '../ui/table/transaction-table'

export const metadata: Metadata = {
  title: NAV_TITLE.TABLE,
}

export default async function Page() {
  const session = await getAuthSession()
  const userId = session?.user?.email
  const [transactions, currency] = await Promise.all([
    getTableTransactions(userId),
    getCurrency(userId),
  ])

  const content = (
    <>
      <h1 className='mb-4 text-center text-2xl font-semibold md:mb-8'>
        {NAV_TITLE.TABLE}
      </h1>
      <div
        className={cn(
          'mx-auto',
          transactions.length === 0 ? 'max-w-3xl' : 'max-w-6xl',
        )}
      >
        {transactions.length === 0 ? (
          <NoTransactionsPlug />
        ) : (
          <TransactionTable transactions={transactions} currency={currency} />
        )}
      </div>
    </>
  )

  return <WithSidebar contentNearby={content} />
}
