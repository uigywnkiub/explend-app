import type { Metadata } from 'next'

import { NAV_TITLE } from '@/config/constants/navigation'

import { getAllTransactions, getAuthSession, getCurrency } from '../lib/actions'
import MonthlyReport from '../ui/monthly-report'
import NoTransactionsPlug from '../ui/no-transaction-text'
import WithSidebar from '../ui/sidebar/with-sidebar'

export const metadata: Metadata = {
  title: NAV_TITLE.MONTHLY_REPORT,
}

export default async function Page() {
  // Caching data for a child server component START
  // getCachedAuthSession()
  // Caching data for a child server component END
  const session = await getAuthSession()
  const userId = session?.user?.email
  // Caching data for a child server component START
  // getCachedAllTransactions(userId)
  // getCachedCurrency(userId)
  // Caching data for a child server component END
  const [transactions, currency] = await Promise.all([
    getAllTransactions(userId),
    getCurrency(userId),
  ])

  const content = (
    <>
      <h1 className='mb-4 text-center text-2xl font-bold md:mb-8'>
        {NAV_TITLE.MONTHLY_REPORT}
      </h1>
      {transactions.length === 0 ? (
        <div className='mx-auto max-w-3xl'>
          <NoTransactionsPlug />
        </div>
      ) : (
        <MonthlyReport transactions={transactions} currency={currency} />
      )}
    </>
  )

  return <WithSidebar contentNearby={content} />
}
