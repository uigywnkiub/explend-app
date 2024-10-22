import { Input } from '@nextui-org/react'

import { DEFAULT_CURRENCY_SIGN } from '@/config/constants/main'

import { cn } from '@/app/lib/helpers'
import type { TTransaction } from '@/app/lib/types'

type TProps = {
  isAmountInvalid: boolean
  amount: TTransaction['amount']
  setAmount: (value: string) => void
  onChangeAmount: (e: React.ChangeEvent<HTMLInputElement>) => void
  AMOUNT_LENGTH: number
  currency: TTransaction['currency']
}

function AmountInput({
  isAmountInvalid,
  amount,
  setAmount,
  onChangeAmount,
  AMOUNT_LENGTH,
  currency,
}: TProps) {
  return (
    <div>
      <p className='mb-1 text-sm text-default-500'>
        Amount{' '}
        <span className={cn('text-danger', !isAmountInvalid && 'hidden')}>
          *
        </span>
      </p>
      <Input
        isRequired
        autoComplete='off'
        type='text'
        name='amount'
        aria-label='Amount'
        value={amount}
        onChange={onChangeAmount}
        onBlur={() => parseFloat(amount) === 0 && setAmount('')}
        required
        maxLength={AMOUNT_LENGTH + 1}
        // pattern='\d+'
        pattern='[\d\s,]+'
        inputMode='decimal'
        placeholder='0'
        size='lg'
        classNames={{
          input:
            'border-none focus:ring-0 placeholder:text-default-500 mt-0.5 text-default-500 text-left',
          inputWrapper: 'h-12 w-full pl-3 md:px-4',
          base: 'w-full',
        }}
        endContent={
          <div className='pointer-events-none mt-[4px] flex items-center'>
            <span
              className={cn(
                'text-md',
                parseFloat(amount) >= 1
                  ? 'text-foreground'
                  : 'text-default-500',
              )}
            >
              {currency?.sign || DEFAULT_CURRENCY_SIGN}
            </span>
          </div>
        }
      />
    </div>
  )
}

export default AmountInput