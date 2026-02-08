import type { Metadata } from 'next'

import { NAV_TITLE } from '@/config/constants/navigation'

import {
  getCachedAllTransactions,
  getCachedAuthSession,
  getCachedCurrency,
  getCountDocuments,
} from '../lib/queries'
import Chart from '../ui/chart/chart'
import NoTransactionsPlug from '../ui/no-transactions-plug'
import WithSidebar from '../ui/sidebar/with-sidebar'

export const metadata: Metadata = {
  title: NAV_TITLE.CHART,
}

export default async function Page() {
  // Caching data for a child server component START
  getCachedAuthSession()
  // Caching data for a child server component END
  const session = await getCachedAuthSession()
  const userId = session?.user?.email
  // Caching data for a child server component START
  getCachedAllTransactions(userId)
  getCachedCurrency(userId)
  // Caching data for a child server component END
  const transactionsCount = await getCountDocuments(userId)

  const content = (
    <>
      <h1 className='mb-0 text-center text-2xl font-semibold'>
        {NAV_TITLE.CHART}
      </h1>
      {!transactionsCount ? (
        <div className='mx-auto mt-8 max-w-3xl'>
          <NoTransactionsPlug />
        </div>
      ) : (
        <Chart />
      )}
    </>
  )

  return <WithSidebar contentNearby={content} />
}
