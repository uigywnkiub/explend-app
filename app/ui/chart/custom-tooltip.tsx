import { PiArrowCircleDownFill, PiArrowCircleUpFill } from 'react-icons/pi'

import { capitalizeFirstLetter, getFormattedCurrency } from '@/app/lib/helpers'
import type { TTransaction } from '@/app/lib/types'

type TProps = {
  active: boolean
  payload: any[]
  label: string
  currency: TTransaction['currency']
}

function CustomTooltip({ active, payload, label, currency }: TProps) {
  if (!active && !payload?.length) return null

  return (
    <div className='rounded-medium border-1 border-[#ccc] bg-background p-2'>
      <>
        <p className='mb-2'>{label}</p>
        {payload?.map((item, index) => (
          <>
            {item.dataKey === 'income' ? (
              <>
                {item.payload.income > 0 && (
                  <p key={index} className='text-sm'>
                    <PiArrowCircleUpFill className='inline fill-success' />{' '}
                    {capitalizeFirstLetter(item.dataKey)}:{' '}
                    {getFormattedCurrency(item.value)} {currency?.code}
                  </p>
                )}
              </>
            ) : (
              <>
                {item.payload.expense > 0 && (
                  <p key={index} className='text-sm'>
                    <PiArrowCircleDownFill className='inline fill-danger' />{' '}
                    {capitalizeFirstLetter(item.dataKey)}:{' '}
                    {getFormattedCurrency(item.value)} {currency?.code}
                  </p>
                )}
              </>
            )}
          </>
        ))}
      </>
    </div>
  )
}

export default CustomTooltip
