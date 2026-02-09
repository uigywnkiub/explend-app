import type { Metadata } from 'next'

import { NAV_TITLE } from '@/config/constants/navigation'

import { getAllTransactions, getAuthSession, getCurrency } from '../lib/actions'
import { getUserCategories } from '../lib/data'
import Limits from '../ui/limits/limits'
import NoTransactionsPlug from '../ui/no-transactions-plug'
import WithSidebar from '../ui/sidebar/with-sidebar'

export const metadata: Metadata = {
  title: NAV_TITLE.LIMITS,
}

export default async function Page() {
  const session = await getAuthSession()
  const userId = session?.user?.email
  const [transactions, currency] = await Promise.all([
    getAllTransactions(userId),
    getCurrency(userId),
  ])
  const userCategories = getUserCategories(transactions)

  const content = (
    <>
      <h1 className='mb-4 text-center text-2xl font-semibold md:mb-8'>
        {NAV_TITLE.LIMITS}
      </h1>
      <div className='mx-auto max-w-3xl text-center'>
        {transactions.length === 0 ? (
          <NoTransactionsPlug />
        ) : (
          <Limits
            userId={userId}
            currency={currency}
            transactions={transactions}
            userCategories={userCategories}
          />
        )}
      </div>
    </>
  )

  return <WithSidebar contentNearby={content} />
}
