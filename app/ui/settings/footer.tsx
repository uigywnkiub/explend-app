'use client'

import {
  PiCoffee,
  PiCoffeeFill,
  PiGithubLogo,
  PiGithubLogoFill,
} from 'react-icons/pi'
import { useMedia } from 'react-use'

import Link from 'next/link'

import { Tooltip } from '@heroui/react'
import { getYear } from 'date-fns'

import { APP_NAME, AUTHOR } from '@/config/constants/main'

import { getBreakpointWidth } from '@/app/lib/helpers'
import type { TSocialLink } from '@/app/lib/types'

import { HoverableElement } from '../hoverables'

const socialLinks: TSocialLink[] = [
  {
    title: 'GitHub',
    url: 'https://github.com/uigywnkiub/explend-app',
    icon: <PiGithubLogo />,
    hoverIcon: <PiGithubLogoFill />,
  },
  {
    title: 'Buy Me a Coffee',
    url: 'https://buymeacoffee.com/eubywnkuee',
    icon: <PiCoffee />,
    hoverIcon: <PiCoffeeFill />,
  },
]

function Footer() {
  const isMd = useMedia(getBreakpointWidth('md'), typeof window !== 'undefined')

  return (
    <>
      <div className='text-xs md:text-sm'>
        {/* {<Logo size='smallest' />} */}
        &copy; {getYear(new Date())}{' '}
        <span className='text-foreground'>{APP_NAME.SHORT}</span> · Built by{' '}
        <Tooltip content='About' placement='top' size='sm'>
          <Link href={AUTHOR.URL} target='_blank'>
            <span className='before:bg-foreground hover:text-foreground relative inline-block no-underline before:absolute before:bottom-0 before:left-0 before:h-[2px] before:w-full before:origin-left before:scale-x-0 before:rounded-full before:transition-transform before:duration-200 hover:before:scale-x-100'>
              {AUTHOR.NAME}
            </span>
          </Link>
        </Tooltip>
      </div>
      <div className='flex justify-center gap-2'>
        {socialLinks.map((link) => {
          return (
            <Tooltip
              key={link.url}
              content={link.title}
              placement='top'
              size='sm'
            >
              <Link
                href={link.url}
                target='_blank'
                className='hover:text-foreground'
              >
                <HoverableElement
                  uKey={link.url}
                  element={link.icon}
                  hoveredElement={isMd ? link.hoverIcon : undefined}
                  withShift={false}
                />
              </Link>
            </Tooltip>
          )
        })}
      </div>
    </>
  )
}

export default Footer
