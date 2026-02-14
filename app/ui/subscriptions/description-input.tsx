import { memo, useRef } from 'react'

import SUBSCRIPTIONS from '@/public/data/subscriptions.json'
import { Input, Kbd } from '@heroui/react'

import { cn, getRandomValue } from '@/app/lib/helpers'
import type { TTransaction } from '@/app/lib/types'

type TProps = {
  isDescriptionInvalid: boolean
  description: TTransaction['description']
  onChangeDescription: (e: React.ChangeEvent<HTMLInputElement>) => void
}

function DescriptionInput({
  isDescriptionInvalid,
  description,
  onChangeDescription,
}: TProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const randomPlaceholder = getRandomValue(SUBSCRIPTIONS) || SUBSCRIPTIONS[0]

  const onTabPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab' && isDescriptionInvalid) {
      e.preventDefault()
      onChangeDescription({
        target: { value: randomPlaceholder },
      } as React.ChangeEvent<HTMLInputElement>)
      inputRef.current?.blur()
    }
  }

  return (
    <div>
      <p className='text-default-500 mb-1 text-sm'>
        Description{' '}
        <span className={cn('text-danger', !isDescriptionInvalid && 'hidden')}>
          *
        </span>
      </p>
      <Input
        ref={inputRef}
        isRequired
        autoComplete='off'
        type='text'
        name='description'
        aria-label='description'
        value={description}
        onChange={onChangeDescription}
        required
        onKeyDown={onTabPress}
        placeholder={randomPlaceholder}
        classNames={{
          input:
            'border-none focus:ring-0 placeholder:text-default-500 mt-0.5 text-default-500 text-left',
          inputWrapper: 'h-12 w-full pl-3 md:px-4',
          base: 'w-full',
        }}
        endContent={
          <Kbd
            keys={['tab']}
            classNames={{
              base: cn(
                'hidden md:block',
                !isDescriptionInvalid &&
                  // Internal classes.
                  'opacity-disabled transition-transform-colors-opacity cursor-default',
              ),
            }}
          >
            Tab
          </Kbd>
        }
      />
    </div>
  )
}

export default memo(DescriptionInput)
