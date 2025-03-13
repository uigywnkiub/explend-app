'use client'

import { PiArrowCircleDownFill, PiArrowCircleUpFill } from 'react-icons/pi'

import { getTransactionsTotals } from '@/app/lib/data'
import type { TTransaction } from '@/app/lib/types'

import AnimatedNumber from '../animated-number'

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
          <span className='text-lg font-semibold'>
            <AnimatedNumber
              value={getTransactionsTotals(searchedTransactionsByQuery).income}
            />{' '}
            {currency.code}
          </span>
        </p>
        <p>
          <PiArrowCircleDownFill className='mr-1 inline fill-danger' />
          <span className='text-sm text-default-500'>Expense:</span>{' '}
          <span className='text-lg font-semibold'>
            <AnimatedNumber
              value={getTransactionsTotals(searchedTransactionsByQuery).expense}
            />{' '}
            {currency.code}
          </span>
        </p>
      </div>
    </div>
  )
}
