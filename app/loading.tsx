import { Spinner } from '@nextui-org/react'

export default function Loading() {
  return (
    <div className='flex h-screen flex-col items-center justify-center gap-4'>
      <Spinner
        size='lg'
        classNames={{
          // base: 'animate-pulse-fast',
          circle1: 'border-b-success',
          circle2: 'border-b-danger',
        }}
        label='Just a second...'
      />
    </div>
  )
}
