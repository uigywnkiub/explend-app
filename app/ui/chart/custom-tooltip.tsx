import { PiArrowCircleDownFill, PiArrowCircleUpFill } from 'react-icons/pi'

import type { TooltipContentProps } from 'recharts'

import { Badge } from '@heroui/react'

import { DEFAULT_ICON_SIZE } from '@/config/constants/main'

import { getTransactionCountByCategory } from '@/app/lib/data'
import {
  capitalizeFirstLetter,
  cn,
  getFormattedCurrency,
} from '@/app/lib/helpers'
import type { TCurrency, TTransaction } from '@/app/lib/types'

type TProps = {
  active: boolean
  payload: TooltipContentProps['payload']
  label?: string | number
  currency: TCurrency
  transactions: TTransaction[]
}

function CustomTooltip({
  active,
  payload,
  label,
  currency,
  transactions,
}: TProps) {
  if (!active && !payload?.length) return null

  const category = String(label ?? '')

  return (
    <Badge
      content={getTransactionCountByCategory(transactions, category)}
      size='sm'
      className='text-foreground'
    >
      <div className='rounded-medium bg-background/90 p-2 drop-shadow-md md:p-4'>
        <p className='md:text-medium mb-2 text-sm'>{category}</p>
        {payload?.map((item, idx) => {
          const isIncome = item.dataKey === 'income'
          const isPositive = isIncome
            ? item.payload?.income > 0
            : item.payload?.expense > 0

          if (!isPositive) return null

          const Icon = isIncome ? PiArrowCircleUpFill : PiArrowCircleDownFill
          const iconClassName = isIncome ? 'fill-success' : 'fill-danger'

          return (
            <p key={idx} className='md:text-medium text-sm'>
              <Icon
                size={DEFAULT_ICON_SIZE}
                className={cn('inline', iconClassName)}
              />{' '}
              <span className='text-default-500 text-xs md:text-sm'>
                {capitalizeFirstLetter(item.dataKey as string)}:{' '}
              </span>
              <span className='font-semibold'>
                {item.value !== undefined &&
                  getFormattedCurrency(item.value as string | number)}{' '}
                {currency.code}
              </span>
            </p>
          )
        })}
      </div>
    </Badge>
  )
}

export default CustomTooltip
