import { memo, useRef } from 'react'

import { Input } from '@heroui/react'

import type { TSubscriptions } from '@/app/lib/types'

type TProps = {
  note: TSubscriptions['note']
  onChangeNote: (e: React.ChangeEvent<HTMLInputElement>) => void
}

function NoteInput({ note, onChangeNote }: TProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div>
      <p className='text-default-500 mb-1 text-sm'>Note</p>
      <Input
        ref={inputRef}
        autoComplete='off'
        type='text'
        name='note'
        aria-label='note'
        value={note}
        onChange={onChangeNote}
        placeholder='Note'
        classNames={{
          input:
            'border-none focus:ring-0 placeholder:text-default-500 mt-0.5 text-default-500 text-left',
          inputWrapper: 'h-12 w-full pl-3 md:px-4',
          base: 'w-full',
        }}
      />
    </div>
  )
}

export default memo(NoteInput)
