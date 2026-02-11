'use client'

import { useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'

import { Button, Kbd, Textarea } from '@heroui/react'

import { cn } from '@/app/lib/helpers'

import InfoText from '../info-text'

const MAX_TEXT_LENGTH = 1000
const MIN_TEXT_LENGTH = 3

export default function Feedback() {
  const { pending } = useFormStatus()
  const [feedback, setFeedback] = useState('')
  const submitBtnRef = useRef<HTMLButtonElement>(null)

  const onTextareaKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter') {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        submitBtnRef.current?.click()
      } else {
        e.preventDefault()
      }
    }
  }

  return (
    <>
      <Textarea
        name='feedback'
        placeholder='Type feedback...'
        description={
          <InfoText
            text='Feedback is anonymous. Available once for 7 days.'
            withAsterisk={false}
          />
        }
        maxRows={30}
        minRows={5}
        maxLength={
          feedback.length > MAX_TEXT_LENGTH ? MAX_TEXT_LENGTH : undefined
        }
        minLength={MIN_TEXT_LENGTH}
        isInvalid={feedback.length > MAX_TEXT_LENGTH}
        errorMessage={`Feedback must not exceed ${MAX_TEXT_LENGTH} characters.`}
        isDisabled={pending}
        isRequired={feedback.length < MIN_TEXT_LENGTH}
        isClearable
        enterKeyHint='enter'
        value={feedback}
        onValueChange={setFeedback}
        onKeyDown={onTextareaKeyDown}
        size='lg'
        classNames={{
          input: 'resize-y min-h-[140px]',
        }}
      />
      <div className='mt-4 flex justify-end'>
        <p
          className={cn(
            `text-sm${pending || feedback.length < MIN_TEXT_LENGTH ? '300' : '500'}`,
          )}
        >
          <span className='hidden md:inline'>Press </span>
          <span className='inline md:hidden'>Tap </span>
          <Button
            ref={submitBtnRef}
            aria-label='Enter'
            type='submit'
            isDisabled={pending || feedback.length > MAX_TEXT_LENGTH}
            isLoading={pending}
            className='bg-background cursor-pointer px-0'
            size='sm'
          >
            <Kbd keys={['command', 'enter']}>Enter</Kbd>
          </Button>{' '}
          to Send Feedback
        </p>
      </div>
    </>
  )
}
