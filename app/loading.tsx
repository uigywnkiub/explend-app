'use client'

import { Spinner, SpinnerProps } from '@heroui/react'
import { ClassValue } from 'clsx'

import { DEFAULT_LOADING_TEXT } from '@/config/constants/main'

import { cn } from './lib/helpers'

type TProps = {
  size?: SpinnerProps['size']
  inline?: boolean
  wrapperClassName?: ClassValue
  text?: string
}

export default function Loading({
  size = 'lg',
  inline = false,
  wrapperClassName,
  text = DEFAULT_LOADING_TEXT,
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
        label={!inline ? text : undefined}
      />
    </div>
  )
}
