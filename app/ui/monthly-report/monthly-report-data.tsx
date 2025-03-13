import { Fragment, memo, useMemo } from 'react'

import Link from 'next/link'

import {
  createSearchHrefWithKeyword,
  getCategoryWithoutEmoji,
} from '@/app/lib/helpers'
import type {
  TCurrency,
  TExpenseReport,
  TIncomeReport,
  TTransactionType,
} from '@/app/lib/types'

import AnimatedNumber from '../animated-number'

type TProps = {
  type: TTransactionType
  data: TExpenseReport[] | TIncomeReport[]
  currency: TCurrency
}

function MonthlyReportData({ type, data, currency }: TProps) {
  return useMemo(
    () => (
      <div className='grid grid-cols-[2fr_1fr_1.5fr] gap-4'>
        <div className='text-xs text-default-500 md:text-sm'>Category</div>
        <div className='text-xs text-default-500 md:text-sm'>Percentage</div>
        <div className='text-xs text-default-500 md:text-sm'>
          {type === 'expense' ? 'Spent' : 'Earned'}
        </div>
        {data.map((category) => (
          <Fragment key={category.category}>
            <div className='truncate md:text-lg'>
              <Link
                href={createSearchHrefWithKeyword(
                  getCategoryWithoutEmoji(category.category),
                )}
                className='hover:opacity-hover'
              >
                {category.category}
              </Link>
            </div>
            <div className='md:text-lg'>
              <AnimatedNumber value={category.percentage} isPercentage /> %
            </div>
            <div className='md:text-lg'>
              <AnimatedNumber
                value={
                  type === 'expense'
                    ? (category as TExpenseReport).spent
                    : (category as TIncomeReport).earned
                }
              />{' '}
              {currency.sign}
            </div>
          </Fragment>
        ))}
      </div>
    ),
    [data, currency, type],
  )
}

export default memo(MonthlyReportData)
