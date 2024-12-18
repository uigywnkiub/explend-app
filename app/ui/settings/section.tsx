import { Divider, Spacer } from '@nextui-org/react'
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
      <p className='text-md text-balance text-default-500'>{subtitle}</p>
      <Spacer y={8} />
      {children}
      {withDivider && <Divider className='my-6' />}
    </div>
  )
}
