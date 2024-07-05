import { PiArrowCircleDownFill, PiArrowCircleUpFill } from 'react-icons/pi'

import { capitalizeFirstLetter } from '@/app/lib/utils'
import type { LegendProps } from 'recharts'

import { DEFAULT_ICON_SIZE } from '@/config/constants/main'

function CustomLegend({ payload }: LegendProps) {
  return (
    <ul className='mb-4 flex list-none justify-center gap-2'>
      {payload?.map((entry, index) => {
        const Icon =
          entry.dataKey === 'income'
            ? PiArrowCircleUpFill
            : PiArrowCircleDownFill
        return (
          <li key={`item-${index}`} className='flex items-center'>
            <div
              className={`flex h-[${DEFAULT_ICON_SIZE}px] items-center justify-center`}
            >
              <Icon className='h-full w-full' fill={entry.color} />
            </div>
            <span className='ml-1'>{capitalizeFirstLetter(entry.value)}</span>
          </li>
        )
      })}
    </ul>
  )
}

export default CustomLegend
