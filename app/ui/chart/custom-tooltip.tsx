import { PiArrowCircleDownFill, PiArrowCircleUpFill } from 'react-icons/pi'

import type { TooltipProps } from 'recharts'
import {
  NameType,
  ValueType,
} from 'recharts/types/component/DefaultTooltipContent'

import { DEFAULT_ICON_SIZE } from '@/config/constants/main'

import {
  capitalizeFirstLetter,
  cn,
  getFormattedCurrency,
} from '@/app/lib/helpers'
import type { TTransaction } from '@/app/lib/types'

type TProps = {
  active: boolean
  payload: TooltipProps<ValueType, NameType>['payload']
  label: string
  currency: TTransaction['currency']
}

function CustomTooltip({ active, payload, label, currency }: TProps) {
  if (!active && !payload?.length) return null

  return (
    <div className='rounded-medium bg-background/90 p-2 drop-shadow-md md:p-4'>
      <p className='mb-2 text-sm md:text-medium'>{label}</p>
      {payload?.map((item, idx) => {
        const isIncome = item.dataKey === 'income'
        const isPositive = isIncome
          ? item.payload?.income > 0
          : item.payload?.expense > 0

        if (!isPositive) return null

        const Icon = isIncome ? PiArrowCircleUpFill : PiArrowCircleDownFill
        const iconClassName = isIncome ? 'fill-success' : 'fill-danger'

        return (
          <p key={idx} className='text-sm md:text-medium'>
            <Icon
              size={DEFAULT_ICON_SIZE}
              className={cn('inline', iconClassName)}
            />{' '}
            <span className='text-xs text-default-500 md:text-sm'>
              {capitalizeFirstLetter(item.dataKey as string)}:{' '}
            </span>
            <span className='font-semibold'>
              {item.value !== undefined &&
                getFormattedCurrency(item.value as string | number)}{' '}
              {currency?.code}
            </span>
          </p>
        )
      })}
    </div>
  )
}

export default CustomTooltip
