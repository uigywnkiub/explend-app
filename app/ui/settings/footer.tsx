'use client'

import {
  PiCoffee,
  PiCoffeeFill,
  PiGithubLogo,
  PiGithubLogoFill,
} from 'react-icons/pi'
import { useMedia } from 'react-use'

import Link from 'next/link'

import { getYear } from 'date-fns'

import { APP_NAME, AUTHOR } from '@/config/constants/main'

import { getBreakpointWidth } from '@/app/lib/helpers'
import type { TSocialLink } from '@/app/lib/types'

import { HoverableElement } from '../hoverables'

const socialLinks: TSocialLink[] = [
  {
    url: 'https://github.com/uigywnkiub/explend-app',
    icon: <PiGithubLogo />,
    hoverIcon: <PiGithubLogoFill />,
  },
  {
    url: 'https://buymeacoffee.com/eubywnkuee',
    icon: <PiCoffee />,
    hoverIcon: <PiCoffeeFill />,
  },
]

function Footer() {
  const isMd = useMedia(getBreakpointWidth('md'), typeof window !== 'undefined')

  return (
    <>
      <footer className='mt-32 flex flex-col-reverse items-center justify-center gap-2 text-center text-default-500'>
        <div className='text-xs md:text-sm'>
          {/* {<Logo size='smallest' withBadge={false} />}  */}
          {APP_NAME.SHORT} &copy; {getYear(new Date())}. All rights reserved |
          design by{' '}
          <Link href={AUTHOR.URL} target='_blank'>
            <span className='cursor-pointer underline md:hover:text-foreground md:hover:no-underline md:hover:opacity-hover'>
              {AUTHOR.NAME}
            </span>
          </Link>
          .
        </div>
        <div className='flex justify-center gap-2'>
          {socialLinks.map((link) => {
            return (
              <Link
                key={link.url}
                href={link.url}
                target='_blank'
                className='cursor-pointer hover:text-foreground md:hover:opacity-hover'
              >
                <HoverableElement
                  uKey={link.url}
                  element={link.icon}
                  hoveredElement={isMd ? link.hoverIcon : undefined}
                  withShift={false}
                />
              </Link>
            )
          })}
        </div>
      </footer>
    </>
  )
}

export default Footer
