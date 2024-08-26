import { Spinner, SpinnerProps } from '@nextui-org/react'

import { cn } from './lib/helpers'

type TProps = {
  size?: SpinnerProps['size']
  inline?: boolean
  wrapperCN?: string
}

export default function Loading({
  size = 'lg',
  inline = false,
  wrapperCN,
}: TProps) {
  return (
    <div
      className={cn(
        !inline && 'flex h-screen flex-col items-center justify-center gap-4',
        wrapperCN,
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
