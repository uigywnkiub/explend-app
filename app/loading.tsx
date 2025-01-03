import { Spinner, SpinnerProps } from '@nextui-org/react'
import { ClassValue } from 'clsx'

import { cn } from './lib/helpers'

type TProps = {
  size?: SpinnerProps['size']
  inline?: boolean
  wrapperClassName?: ClassValue
}

export default function Loading({
  size = 'lg',
  inline = false,
  wrapperClassName,
}: TProps) {
  return (
    <div
      className={cn(
        !inline && 'flex h-screen flex-col items-center justify-center gap-4',
        wrapperClassName,
      )}
    >
      <Spinner
        size={size}
        classNames={{
          // base: 'animate-pulse-fast',
          circle1: 'border-b-success',
          circle2: 'border-b-danger',
        }}
        label={!inline ? 'Just a second...' : undefined}
      />
    </div>
  )
}
