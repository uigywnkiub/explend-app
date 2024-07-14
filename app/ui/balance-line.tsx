'use client'

import { useRef } from 'react'

import { Card, CardHeader } from '@nextui-org/react'

import { DEFAULT_CURRENCY_CODE } from '@/config/constants/main'

import { TTransaction, TUser } from '../lib/types'
import { copyToClipboard, getFormattedCurrency } from '../lib/utils'

type TProps = {
  balance: TTransaction['balance']
  currency: TTransaction['currency']
  user: TUser | undefined
}

function BalanceLine({ balance, currency, user }: TProps) {
  const quoteRef = useRef<HTMLQuoteElement>(null)

  const onQuoteCopy = async () => {
    await copyToClipboard('Quote copied.', 'Failed to copy quote.', quoteRef)
  }

  return (
    <Card className='p-2' shadow='none'>
      <CardHeader className='flex items-center justify-between px-4'>
        <p className='text-xs font-bold'>Hey {user?.name} 👋🏼</p>
        <small
          className='hidden cursor-pointer select-none text-default-300 md:block'
          onClick={onQuoteCopy}
        >
          <q ref={quoteRef}>Peace of mind, one transaction at a time.</q>
        </small>
        <h4 className='text-lg font-bold'>
          {getFormattedCurrency(balance)}{' '}
          {currency?.code || DEFAULT_CURRENCY_CODE}
        </h4>
      </CardHeader>
    </Card>
  )
}

export default BalanceLine
