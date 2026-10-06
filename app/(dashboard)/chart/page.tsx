import type { Metadata } from 'next'

import { NAV_TITLE } from '@/config/constants/navigation'

import {
  getAuthSession,
  getCachedCurrency,
  getCountDocuments,
} from '../../lib/actions'
import Chart from '../../ui/chart/chart'
import NoTransactionsPlug from '../../ui/no-transactions-plug'
import WithSidebarContent from '../../ui/sidebar/with-sidebar-content'

export const metadata: Metadata = {
  title: NAV_TITLE.CHART,
}

async function ChartPageContent() {
  const session = await getAuthSession()
  const userId = session?.user?.email
  // Caching data for a child server component START
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
        <Chart userId={userId} />
      )}
    </>
  )

  return content
}

export default function Page() {
  return (
    <WithSidebarContent title={NAV_TITLE.CHART}>
      <ChartPageContent />
    </WithSidebarContent>
  )
}
