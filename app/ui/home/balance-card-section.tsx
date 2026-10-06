import { Suspense } from 'react'

import type { TCurrency, TTransaction, TUser } from '@/app/lib/types'

import BalanceCard from '../balance-card'

type TProps = {
  user: TUser | undefined
  balancePromise: Promise<TTransaction['balance']>
  currency: TCurrency
  hasTransactions: boolean
  transactionCount: number
}

async function BalanceCardContent({
  user,
  balancePromise,
  currency,
  hasTransactions,
  transactionCount,
}: TProps) {
  const balance = await balancePromise

  return (
    <BalanceCard
      user={user}
      balance={balance}
      currency={currency}
      hasTransactions={hasTransactions}
      transactionCount={transactionCount}
    />
  )
}

export default function BalanceCardSection(props: TProps) {
  return (
    <Suspense
      fallback={
        <BalanceCard
          user={props.user}
          balance=''
          currency={props.currency}
          hasTransactions={props.hasTransactions}
          transactionCount={props.transactionCount}
          isBalanceLoading
        />
      }
    >
      <BalanceCardContent {...props} />
    </Suspense>
  )
}
