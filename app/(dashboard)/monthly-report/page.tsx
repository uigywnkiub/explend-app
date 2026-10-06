import type { Metadata } from 'next'

import { NAV_TITLE } from '@/config/constants/navigation'

import {
  getAuthSession,
  getCurrency,
  getMonthlyReportTransactions,
  getSalaryDay,
} from '../../lib/actions'
import MonthlyReport from '../../ui/monthly-report/monthly-report'
import NoTransactionsPlug from '../../ui/no-transactions-plug'
import WithSidebarContent from '../../ui/sidebar/with-sidebar-content'

export const metadata: Metadata = {
  title: NAV_TITLE.MONTHLY_REPORT,
}

async function MonthlyReportPageContent() {
  const session = await getAuthSession()
  const userId = session?.user?.email
  const [transactions, currency, userSalaryDay] = await Promise.all([
    getMonthlyReportTransactions(userId),
    getCurrency(userId),
    getSalaryDay(userId),
  ])

  const content = (
    <>
      <h1 className='mb-4 text-center text-2xl font-semibold md:mb-8'>
        {NAV_TITLE.MONTHLY_REPORT}
      </h1>
      <div className='mx-auto max-w-3xl'>
        {transactions.length === 0 ? (
          <NoTransactionsPlug />
        ) : (
          <MonthlyReport
            transactions={transactions}
            currency={currency}
            userSalaryDay={userSalaryDay}
          />
        )}
      </div>
    </>
  )

  return content
}

export default function Page() {
  return (
    <WithSidebarContent title={NAV_TITLE.MONTHLY_REPORT}>
      <MonthlyReportPageContent />
    </WithSidebarContent>
  )
}
