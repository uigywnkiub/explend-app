import { PiArrowCircleDownFill, PiArrowCircleUpFill } from 'react-icons/pi'

import type { LegendProps } from 'recharts'

import { DEFAULT_ICON_SIZE } from '@/config/constants/main'

import { capitalizeFirstLetter } from '@/app/lib/helpers'

function CustomLegend({ payload }: LegendProps) {
  return (
    <ul className='mb-2 flex list-none justify-center gap-2 text-sm md:mb-4 md:text-medium'>
      {payload?.map((entry) => {
        const Icon =
          entry.dataKey === 'income'
            ? PiArrowCircleUpFill
            : PiArrowCircleDownFill

        return (
          <li key={entry.value} className='flex items-center'>
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
