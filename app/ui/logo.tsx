'use client'

import { cn } from '../lib/helpers'
import TextEffect from './text-effect'

type TProps = {
  size?: 'smallest' | 'xxs' | 'xs' | 'sm' | 'md2' | 'md'
  isSignInPage?: boolean
}

export default function Logo({ size = 'md', isSignInPage = false }: TProps) {
  let logoSizeClass = 'h-32 w-32'
  let textSizeClass = 'text-6xl'

  switch (size) {
    case 'smallest':
      logoSizeClass = 'h-5 w-5'
      textSizeClass = 'text-xs'
      break
    case 'xxs':
      logoSizeClass = 'h-7 w-7'
      textSizeClass = 'text-xs'
      break
    case 'xs':
      logoSizeClass = 'h-16 w-16'
      textSizeClass = 'text-3xl'
      break
    case 'sm':
      logoSizeClass = 'h-20 w-20'
      textSizeClass = 'text-4xl'
      break
    case 'md2':
      logoSizeClass = 'h-28 w-28'
      textSizeClass = 'text-5xl'
      break
  }

  const textClassName = `${cn(
    '-skew-x-6 transform-gpu cursor-default select-none font-inter font-bold text-light drop-shadow-md',
    textSizeClass,
  )}`
  const textTag = 'span'
  const TextWrapper = isSignInPage ? TextEffect : textTag

  return (
    <div className='flex items-center justify-center'>
      <div
        className={cn(
          'flex items-center justify-center rounded-3xl bg-logo-gradient',
          logoSizeClass,
          (size === 'sm' || size === 'xs') && 'rounded-2xl',
          (size === 'xxs' || size === 'smallest') && 'rounded-md',
        )}
      >
        <TextWrapper
          {...(isSignInPage && {
            per: 'line',
            preset: 'fade-in-blur',
            as: textTag,
          })}
          className={textClassName}
        >
          Ex
        </TextWrapper>
      </div>
    </div>
  )
}
