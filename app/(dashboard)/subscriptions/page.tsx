import type { Metadata } from 'next'

import { NAV_TITLE } from '@/config/constants/navigation'

import {
  getAuthSession,
  getCachedUserCategories,
  getCountDocuments,
  getCurrency,
  getSubscriptions,
  getSubscriptionTransactions,
} from '../../lib/actions'
import { getUserCategories } from '../../lib/data'
import NoTransactionsPlug from '../../ui/no-transactions-plug'
import WithSidebarContent from '../../ui/sidebar/with-sidebar-content'
import Subscriptions from '../../ui/subscriptions/subscriptions'

export const metadata: Metadata = {
  title: NAV_TITLE.SUBSCRIPTIONS,
}

async function SubscriptionsPageContent() {
  const session = await getAuthSession()
  const userId = session?.user?.email
  const [
    transactionsCount,
    subscriptionTransactions,
    userSubscriptions,
    currency,
    userCategoriesFromSettings,
  ] = await Promise.all([
    getCountDocuments(userId),
    getSubscriptionTransactions(userId),
    getSubscriptions(userId),
    getCurrency(userId),
    getCachedUserCategories(userId),
  ])
  const userCategories = getUserCategories(userCategoriesFromSettings)

  const content = (
    <>
      <h1 className='mb-4 text-center text-2xl font-semibold md:mb-8'>
        {NAV_TITLE.SUBSCRIPTIONS}
      </h1>
      <div className='mx-auto max-w-3xl'>
        {transactionsCount === 0 ? (
          <NoTransactionsPlug />
        ) : (
          <Subscriptions
            userId={userId}
            currency={currency}
            subscriptionsData={userSubscriptions}
            userCategories={userCategories}
            transactions={subscriptionTransactions}
          />
        )}
      </div>
    </>
  )

  return content
}

export default function Page() {
  return (
    <WithSidebarContent title={NAV_TITLE.SUBSCRIPTIONS}>
      <SubscriptionsPageContent />
    </WithSidebarContent>
  )
}
