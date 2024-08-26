'use client'

import { useMedia } from 'react-use'

import Image from 'next/image'

import { Popover, PopoverContent, PopoverTrigger } from '@nextui-org/react'
import { twJoin } from 'tailwind-merge'

import { AI_NAME } from '@/config/constants/main'

import { getBreakpointWidth } from '../lib/helpers'

type TProps = {
  asIcon?: boolean
  asText?: boolean
  textBefore?: string
}

export default function AILogo({
  asIcon = false,
  asText = false,
  textBefore,
}: TProps) {
  const isMd = useMedia(getBreakpointWidth('md'))
  const xxs = 10.88
  const textSize = 'text-xxs md:text-xs'

  const aiTitle = (
    <span
      className={twJoin(
        'bg-gradient-to-r from-blue-400 via-purple-400 to-red-400 bg-clip-text text-transparent',
        textSize,
      )}
    >
      {AI_NAME.FULL}
    </span>
  )

  return (
    <div className='flex items-center justify-center'>
      {!asText && (
        <Popover
          size='sm'
          backdrop='opaque'
          showArrow={isMd}
          classNames={{
            // before is an arrow
            base: 'before:bg-gradient-to-b before:from-blue-400 before:via-purple-400 before:to-red-400 bg-clip-text',
            content: twJoin('text-center', textSize),
          }}
        >
          <PopoverTrigger className='focus-visible:hidden'>
            <Image
              src='/images/ai-logo.gif'
              width={isMd ? 12 : xxs}
              height={isMd ? 12 : xxs}
              alt={AI_NAME.FULL}
              priority
              unoptimized
              className='mr-1 inline-block cursor-pointer select-none drop-shadow-ai md:hover:opacity-hover'
            />
          </PopoverTrigger>
          <PopoverContent>
            <span>{aiTitle} is experimental so double-check the info</span>
          </PopoverContent>
        </Popover>
      )}
      {!asIcon &&
        (!!textBefore && asText ? (
          <span className={twJoin(textSize)}>
            {textBefore} {aiTitle}
          </span>
        ) : (
          aiTitle
        ))}
    </div>
  )
}
