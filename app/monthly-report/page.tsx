import type { Metadata } from 'next'

import { NAV_TITLE } from '@/config/constants/navigation'

import { getAllTransactions, getAuthSession, getCurrency } from '../lib/actions'
import MonthlyReport from '../ui/monthly-report/monthly-report'
import NoTransactionsPlug from '../ui/no-transactions-plug'
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
      <div className='mx-auto max-w-3xl'>
        {transactions.length === 0 ? (
          <NoTransactionsPlug />
        ) : (
          <MonthlyReport transactions={transactions} currency={currency} />
        )}
      </div>
    </>
  )

  return <WithSidebar contentNearby={content} />
}
