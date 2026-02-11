import { PiArrowCircleDownFill, PiArrowCircleUpFill } from 'react-icons/pi'

import type { LegendProps } from 'recharts'

import { Tooltip } from '@heroui/react'

import { DEFAULT_ICON_SIZE } from '@/config/constants/main'
import { NAV_TITLE } from '@/config/constants/navigation'

import {
  capitalizeFirstLetter,
  cn,
  getFormattedCurrency,
  toLowerCase,
} from '@/app/lib/helpers'
import type { TTransaction, TTransactionType } from '@/app/lib/types'

type TProps = {
  payload?: LegendProps['payload']
  expenseTotal: number
  incomeTotal: number
  currency: TTransaction['currency']
  isChartForExpensesOnly?: boolean
}

function CustomLegend({
  payload,
  expenseTotal,
  incomeTotal,
  currency,
  isChartForExpensesOnly,
}: TProps) {
  return (
    <ul className='md:text-medium mb-4 flex list-none justify-center gap-2 text-sm'>
      {payload?.map((entry) => {
        const isIncomeTransactionType =
          (entry.dataKey as TTransactionType) === 'income'
        const Icon = isIncomeTransactionType
          ? PiArrowCircleUpFill
          : PiArrowCircleDownFill

        return (
          <Tooltip
            key={entry.value}
            content={
              isIncomeTransactionType
                ? isChartForExpensesOnly
                  ? `Disabled in ${toLowerCase(NAV_TITLE.SETTINGS)}`
                  : `${getFormattedCurrency(incomeTotal)} ${currency.code}`
                : `${getFormattedCurrency(expenseTotal)} ${currency.code}`
            }
          >
            <li className='flex items-center'>
              <div
                className={cn(
                  `flex h-[${DEFAULT_ICON_SIZE}px] items-center justify-center`,
                )}
              >
                <Icon className='size-full' fill={entry.color} />
              </div>
              <span className='ml-1'>{capitalizeFirstLetter(entry.value)}</span>
            </li>
          </Tooltip>
        )
      })}
    </ul>
  )
}

export default CustomLegend
