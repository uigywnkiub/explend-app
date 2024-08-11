import type { Metadata } from 'next'

import { NAV_TITLE } from '@/config/constants/navigation'

import { getAllTransactions, getAuthSession } from '../lib/actions'
import ConstructionPlug from '../ui/construction-plug'
import NoTransactionsPlug from '../ui/no-transactions-plug'
import WithSidebar from '../ui/sidebar/with-sidebar'

export const metadata: Metadata = {
  title: NAV_TITLE.LIMITS,
}

export default async function Page() {
  const session = await getAuthSession()
  const userId = session?.user?.email
  const [transactions] = await Promise.all([getAllTransactions(userId)])

  const content = (
    <>
      <h1 className='mb-4 text-center text-2xl font-bold md:mb-8'>
        {NAV_TITLE.LIMITS}
      </h1>
      <div className='mx-auto max-w-3xl text-center'>
        {transactions.length === 0 ? (
          <NoTransactionsPlug />
        ) : (
          // <Limits transactions={transactions} />
          <ConstructionPlug pageTitle={NAV_TITLE.LIMITS} />
        )}
      </div>
    </>
  )

  return <WithSidebar contentNearby={content} />
}
