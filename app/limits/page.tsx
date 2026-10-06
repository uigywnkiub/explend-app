import type { Metadata } from 'next'

import { NAV_TITLE } from '@/config/constants/navigation'

import {
  getAuthSession,
  getCachedUserCategories,
  getCategoryLimits,
  getCountDocuments,
  getCurrency,
  getRecentTransactionsForLimits,
} from '../lib/actions'
import { getUserCategories } from '../lib/data'
import Limits from '../ui/limits/limits'
import NoTransactionsPlug from '../ui/no-transactions-plug'
import WithSidebarContent from '../ui/sidebar/with-sidebar-content'

export const metadata: Metadata = {
  title: NAV_TITLE.LIMITS,
}

async function LimitsPageContent() {
  const session = await getAuthSession()
  const userId = session?.user?.email
  const [
    transactionsCount,
    transactions,
    currency,
    categoryLimits,
    userCategoriesFromSettings,
  ] = await Promise.all([
    getCountDocuments(userId),
    getRecentTransactionsForLimits(userId),
    getCurrency(userId),
    getCategoryLimits(userId),
    getCachedUserCategories(userId),
  ])
  const userCategories = getUserCategories(userCategoriesFromSettings)

  const content = (
    <>
      <h1 className='mb-4 text-center text-2xl font-semibold md:mb-8'>
        {NAV_TITLE.LIMITS}
      </h1>
      <div className='mx-auto max-w-3xl text-center'>
        {transactionsCount === 0 ? (
          <NoTransactionsPlug />
        ) : (
          <Limits
            userId={userId}
            currency={currency}
            categoryLimits={categoryLimits}
            transactions={transactions}
            userCategories={userCategories}
          />
        )}
      </div>
    </>
  )

  return content
}

export default function Page() {
  return (
    <WithSidebarContent title={NAV_TITLE.LIMITS}>
      <LimitsPageContent />
    </WithSidebarContent>
  )
}
