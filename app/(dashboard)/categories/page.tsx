import type { Metadata } from 'next'

import DEFAULT_CATEGORIES from '@/public/data/default-categories.json'

import { NAV_TITLE } from '@/config/constants/navigation'

import {
  getAuthSession,
  getCachedUserCategories,
  getCountDocuments,
} from '../../lib/actions'
import { getUserCategories } from '../../lib/data'
import Categories from '../../ui/categories/categories'
import NoTransactionsPlug from '../../ui/no-transactions-plug'
import WithSidebarContent from '../../ui/sidebar/with-sidebar-content'

export const metadata: Metadata = {
  title: NAV_TITLE.CATEGORIES,
}

async function CategoriesPageContent() {
  const session = await getAuthSession()
  const userId = session?.user?.email
  const [transactionsCount, userCategoriesFromSettings] = await Promise.all([
    getCountDocuments(userId),
    getCachedUserCategories(userId),
  ])
  const userCategories = getUserCategories(userCategoriesFromSettings)
  const areCategoriesLengthMismatch =
    userCategories.length !== DEFAULT_CATEGORIES.length

  const content = (
    <>
      <h1 className='mb-4 text-center text-2xl font-semibold md:mb-8'>
        {NAV_TITLE.CATEGORIES}
      </h1>
      <div className='mx-auto max-w-3xl'>
        {transactionsCount === 0 ? (
          <NoTransactionsPlug />
        ) : (
          <Categories
            userId={userId}
            userCategories={userCategories}
            areCategoriesLengthMismatch={areCategoriesLengthMismatch}
          />
        )}
      </div>
    </>
  )

  return content
}

export default function Page() {
  return (
    <WithSidebarContent title={NAV_TITLE.CATEGORIES}>
      <CategoriesPageContent />
    </WithSidebarContent>
  )
}
