import {
  getCachedAllTransactions,
  getCachedAuthSession,
  getCachedCurrency,
} from '@/app/lib/actions'

import RadarChart from './radar-chart'

async function Chart() {
  const session = await getCachedAuthSession()
  const userId = session?.user?.email
  const [transactionsRaw, currency] = await Promise.all([
    getCachedAllTransactions(userId),
    getCachedCurrency(userId),
  ])

  return <RadarChart transactionsRaw={transactionsRaw} currency={currency} />
}

export default Chart
