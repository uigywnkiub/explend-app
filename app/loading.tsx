'use client'

import { Spinner, SpinnerProps } from '@heroui/react'
import { ClassValue } from 'clsx'

import { DEFAULT_LOADING_TEXT } from '@/config/constants/main'

import { cn } from './lib/helpers'

type TProps = {
  size?: SpinnerProps['size']
  isInline?: boolean
  wrapperClassName?: ClassValue
  text?: string
  withoutText?: boolean
}

export default function Loading({
  size = 'lg',
  isInline = false,
  wrapperClassName,
  text = DEFAULT_LOADING_TEXT,
  withoutText = false,
}: TProps) {
  return (
    <div
      className={cn(
        !isInline && 'flex h-screen flex-col items-center justify-center gap-4',
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
        label={withoutText ? undefined : text}
      />
    </div>
  )
}
