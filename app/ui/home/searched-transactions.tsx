'use client'

import { PiArrowCircleDownFill, PiArrowCircleUpFill } from 'react-icons/pi'

import { getTransactionsTotals } from '@/app/lib/data'
import { getFormattedCurrency } from '@/app/lib/helpers'
import type { TTransaction } from '@/app/lib/types'

type TProps = {
  currency: TTransaction['currency']
  searchedTransactionsByQuery: TTransaction[]
}

export default function SearchedTransactions({
  currency,
  searchedTransactionsByQuery,
}: TProps) {
  return (
    <div className='flex flex-col justify-center gap-2 text-center'>
      <p className='mt-2 text-default-500 md:mt-4'>Searched Totals</p>
      <div className='flex flex-col flex-wrap justify-center'>
        <p>
          <PiArrowCircleUpFill className='mr-1 inline fill-success' />
          <span className='text-sm text-default-500'>Income:</span>{' '}
          {getFormattedCurrency(
            getTransactionsTotals(searchedTransactionsByQuery).income,
          )}{' '}
          {currency?.code}
        </p>
        <p>
          <PiArrowCircleDownFill className='mr-1 inline fill-danger' />
          <span className='text-sm text-default-500'>Expense:</span>{' '}
          {getFormattedCurrency(
            getTransactionsTotals(searchedTransactionsByQuery).expense,
          )}{' '}
          {currency?.code}
        </p>
      </div>
    </div>
  )
}
