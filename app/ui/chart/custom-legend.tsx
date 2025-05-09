import { PiArrowCircleDownFill, PiArrowCircleUpFill } from 'react-icons/pi'

import type { LegendProps } from 'recharts'

import { DEFAULT_ICON_SIZE } from '@/config/constants/main'

import { capitalizeFirstLetter, cn } from '@/app/lib/helpers'
import type { TTransactionType } from '@/app/lib/types'

function CustomLegend({ payload }: LegendProps) {
  return (
    <ul className='mb-4 flex list-none justify-center gap-2 text-sm md:text-medium'>
      {payload?.map((entry) => {
        const Icon =
          (entry.dataKey as TTransactionType) === 'income'
            ? PiArrowCircleUpFill
            : PiArrowCircleDownFill

        return (
          <li key={entry.value} className='flex items-center'>
            <div
              className={cn(
                `flex h-[${DEFAULT_ICON_SIZE}px] items-center justify-center`,
              )}
            >
              <Icon className='size-full' fill={entry.color} />
            </div>
            <span className='ml-1'>{capitalizeFirstLetter(entry.value)}</span>
          </li>
        )
      })}
    </ul>
  )
}

export default CustomLegend
