import {
  getCachedChartTransactions,
  getCachedCurrency,
} from '@/app/lib/actions'
import type { TUserId } from '@/app/lib/types'

import RadarChart from './radar-chart'

async function Chart({ userId }: { userId: TUserId }) {
  const [transactionsRaw, currency] = await Promise.all([
    getCachedChartTransactions(userId),
    getCachedCurrency(userId),
  ])

  return <RadarChart transactionsRaw={transactionsRaw} currency={currency} />
}

export default Chart
