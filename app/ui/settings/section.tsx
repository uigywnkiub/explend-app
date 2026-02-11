import type { JSX } from 'react'

import { Divider, Spacer } from '@heroui/react'
import { type ClassValue } from 'clsx'

import { cn } from '@/app/lib/helpers'

type TProps = {
  title: string
  subtitle: string
  withDivider?: boolean
  children: JSX.Element
  titleClassName?: ClassValue
}

export default function Section({
  title,
  subtitle,
  withDivider = true,
  children,
  titleClassName,
}: TProps) {
  return (
    <div className='max-w-3xl'>
      <h1 className={cn('text-xl font-semibold', titleClassName)}>{title}</h1>
      <p className='text-default-500 text-balance'>{subtitle}</p>
      <Spacer y={8} />
      {children}
      {withDivider && <Divider className='my-6 h-2 rounded-full' />}
    </div>
  )
}
