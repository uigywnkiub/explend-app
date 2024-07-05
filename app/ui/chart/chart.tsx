import {
  getCachedAllTransactions,
  getCachedAuthSession,
  getCachedCurrency,
} from '@/app/lib/actions'

import RadarChart from './radar-chart'

async function Chart() {
  const session = await getCachedAuthSession()
  const userId = session?.user?.email
  const [transactions, currency] = await Promise.all([
    getCachedAllTransactions(userId),
    getCachedCurrency(userId),
  ])

  return <RadarChart transactions={transactions} currency={currency} />
}

export default Chart
