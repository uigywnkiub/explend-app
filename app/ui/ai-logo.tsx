'use client'

import Image from 'next/image'

import { Popover, PopoverContent, PopoverTrigger } from '@nextui-org/react'

import { AI_NAME } from '@/config/constants/main'

type TProps = {
  asIcon?: boolean
  asText?: boolean
}

export default function AILogo({ asIcon = false, asText = false }: TProps) {
  const aiText = (
    <span className='bg-gradient-to-r from-blue-400 via-purple-400 to-red-400 bg-clip-text text-xxs text-transparent md:text-xs'>
      {AI_NAME.FULL}
    </span>
  )

  return (
    <div className='flex items-center justify-center'>
      {!asText && (
        <Popover size='sm'>
          <PopoverTrigger className='focus-visible:hidden'>
            <Image
              src='/images/ai-logo.gif'
              width={12}
              height={12}
              alt={AI_NAME.FULL}
              priority
              unoptimized
              className='mr-1 inline-block cursor-pointer select-none drop-shadow-ai md:hover:opacity-hover'
            />
          </PopoverTrigger>
          <PopoverContent>
            <span>{aiText} is experimental so double-check the info.</span>
          </PopoverContent>
        </Popover>
      )}
      {!asIcon && aiText}
    </div>
  )
}
