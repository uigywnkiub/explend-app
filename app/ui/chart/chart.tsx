import { toWords } from '@/config/to-words'

import {
  getCachedAllTransactions,
  getCachedAuthSession,
  getCachedCurrency,
} from '@/app/lib/actions'
import { getFirstAndLastTransactions } from '@/app/lib/data'
import { formatDate, getFormattedCurrency } from '@/app/lib/helpers'

import InfoText from '../info-text'
import RadarChart from './radar-chart'

async function Chart() {
  const session = await getCachedAuthSession()
  const userId = session?.user?.email
  const [transactions, currency] = await Promise.all([
    getCachedAllTransactions(userId),
    getCachedCurrency(userId),
  ])

  const { firstTransaction, lastTransaction } =
    getFirstAndLastTransactions(transactions)

  const firstTransactionDate = formatDate(firstTransaction.createdAt)
  const lastTransactionDate = formatDate(lastTransaction.createdAt)
  const totalTransactions = transactions.length

  return (
    <>
      <RadarChart transactions={transactions} currency={currency} />
      <div className='-mt-2 flex flex-col gap-2 text-center'>
        <InfoText
          text='Visualization of all-time transactions.'
          withAsterisk={false}
        />
        <InfoText
          text={`From ${firstTransactionDate} to ${lastTransactionDate}.`}
          withAsterisk={false}
        />
        <InfoText
          text={`${toWords.convert(totalTransactions)} (${getFormattedCurrency(totalTransactions)}) entries.`}
          withAsterisk={false}
        />
      </div>
    </>
  )
}

export default Chart
