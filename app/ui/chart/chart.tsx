import {
  getCachedChartTransactions,
  getCachedCurrency,
  getCachedUserCategories,
} from '@/app/lib/actions'
import { getUserCategories } from '@/app/lib/data'
import type { TUserId } from '@/app/lib/types'

import RadarChart from './radar-chart'

async function Chart({ userId }: { userId: TUserId }) {
  const [transactionsRaw, currency, categoriesRaw] = await Promise.all([
    getCachedChartTransactions(userId),
    getCachedCurrency(userId),
    getCachedUserCategories(userId),
  ])
  const categories = getUserCategories(categoriesRaw)

  return (
    <RadarChart
      transactionsRaw={transactionsRaw}
      categories={categories}
      currency={currency}
    />
  )
}

export default Chart
