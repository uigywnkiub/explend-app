import type { Metadata } from 'next'

import { NAV_TITLE } from '@/config/constants/navigation'

import {
  getAllTransactions,
  getAuthSession,
  getCurrency,
  getSalaryDay,
  getSubscriptions,
} from '../lib/actions'
import { getUserCategories } from '../lib/data'
import NoTransactionsPlug from '../ui/no-transactions-plug'
import WithSidebar from '../ui/sidebar/with-sidebar'
import Subscriptions from '../ui/subscriptions/subscriptions'

export const metadata: Metadata = {
  title: NAV_TITLE.SUBSCRIPTIONS,
}

export default async function Page() {
  const session = await getAuthSession()
  const userId = session?.user?.email
  const [transactions, userSubscriptions, currency, userSalaryDay] =
    await Promise.all([
      getAllTransactions(userId),
      getSubscriptions(userId),
      getCurrency(userId),
      getSalaryDay(userId),
    ])
  const userCategories = getUserCategories(transactions)

  const content = (
    <>
      <h1 className='mb-4 text-center text-2xl font-semibold md:mb-8'>
        {NAV_TITLE.SUBSCRIPTIONS}
      </h1>
      <div className='mx-auto max-w-3xl'>
        {transactions.length === 0 ? (
          <NoTransactionsPlug />
        ) : (
          <Subscriptions
            userId={userId}
            currency={currency}
            subscriptionsData={userSubscriptions}
            userCategories={userCategories}
            userSalaryDay={userSalaryDay}
            transactions={transactions}
          />
        )}
      </div>
    </>
  )

  return <WithSidebar contentNearby={content} />
}
