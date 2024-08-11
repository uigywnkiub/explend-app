import type { Metadata } from 'next'

import { NAV_TITLE } from '@/config/constants/navigation'

import { getAllTransactions, getAuthSession } from '../lib/actions'
import Categories from '../ui/categories/categories'
import NoTransactionsPlug from '../ui/no-transactions-plug'
import WithSidebar from '../ui/sidebar/with-sidebar'

export const metadata: Metadata = {
  title: NAV_TITLE.CATEGORIES,
}

export default async function Page() {
  const session = await getAuthSession()
  const userId = session?.user?.email
  const transactions = await getAllTransactions(userId)
  const [userCategories] = transactions.map((t) => t.categories).filter(Boolean)

  const content = (
    <>
      <h1 className='mb-4 text-center text-2xl font-bold md:mb-8'>
        {NAV_TITLE.CATEGORIES}
      </h1>
      <div className='mx-auto max-w-3xl'>
        {transactions.length === 0 ? (
          <NoTransactionsPlug />
        ) : (
          <Categories userId={userId} userCategories={userCategories} />
        )}
      </div>
    </>
  )

  return <WithSidebar contentNearby={content} />
}
