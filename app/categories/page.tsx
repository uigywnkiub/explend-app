import type { Metadata } from 'next'

import DEFAULT_CATEGORIES from '@/public/data/default-categories.json'

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
  const areCategoriesLengthMismatch =
    userCategories.length !== DEFAULT_CATEGORIES.length

  const content = (
    <>
      <h1 className='mb-4 text-center text-2xl font-semibold md:mb-8'>
        {NAV_TITLE.CATEGORIES}
      </h1>
      <div className='mx-auto max-w-3xl'>
        {transactions.length === 0 ? (
          <NoTransactionsPlug />
        ) : (
          <Categories
            userId={userId}
            userCategories={userCategories || DEFAULT_CATEGORIES}
            areCategoriesLengthMismatch={areCategoriesLengthMismatch}
          />
        )}
      </div>
    </>
  )

  return <WithSidebar contentNearby={content} />
}
