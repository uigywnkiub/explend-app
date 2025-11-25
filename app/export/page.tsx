import type { Metadata } from 'next'

import { NAV_TITLE } from '@/config/constants/navigation'

import {
  getCachedAllTransactions,
  getCachedAuthSession,
  getTransactionsForExport,
} from '../lib/actions'
import type { TTransaction } from '../lib/types'
import ExportTransactions from '../ui/home/export-transactions'
import NoTransactionsPlug from '../ui/no-transactions-plug'
import WithSidebar from '../ui/sidebar/with-sidebar'

export const metadata: Metadata = {
  title: NAV_TITLE.EXPORT,
}

export default async function Page() {
  getCachedAuthSession()
  const session = await getCachedAuthSession()
  const userId = session?.user?.email

  getCachedAllTransactions(userId)
  const transactions = await getCachedAllTransactions(userId)

  const handleExport = async (
    startDate?: Date,
    endDate?: Date,
  ): Promise<TTransaction[]> => {
    'use server'
    return await getTransactionsForExport(userId, startDate, endDate)
  }

  const content = (
    <>
      <h1 className="mb-8 text-center text-2xl font-semibold">
        {NAV_TITLE.EXPORT}
      </h1>
      {transactions.length === 0 ? (
        <div className="mx-auto max-w-3xl">
          <NoTransactionsPlug />
        </div>
      ) : (
        <div className="mx-auto max-w-2xl">
          <ExportTransactions
            transactions={transactions}
            onExport={handleExport}
          />
        </div>
      )}
    </>
  )

  return <WithSidebar contentNearby={content} />
}
