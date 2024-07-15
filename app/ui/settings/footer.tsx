'use client'

import {
  PiCoffee,
  PiCoffeeFill,
  PiGithubLogo,
  PiGithubLogoFill,
} from 'react-icons/pi'

import Link from 'next/link'

import { TSocialLink } from '@/app/lib/types'
import { getYear } from 'date-fns'

import { APP_NAME } from '@/config/constants/main'

import { HoverableElement } from '../hoverables'

const socialLinks: TSocialLink[] = [
  {
    href: 'https://github.com/uigywnkiub/explend-app',
    icon: <PiGithubLogo />,
    hoverIcon: <PiGithubLogoFill />,
  },
  {
    href: 'https://buymeacoffee.com/eubywnkuee',
    icon: <PiCoffee />,
    hoverIcon: <PiCoffeeFill />,
  },
]

function Footer() {
  return (
    <>
      <footer className='mt-4 flex items-center justify-center text-center text-default-300 md:mt-8'>
        <div>
          <div className='text-xs md:text-sm'>
            {/* {<Logo size='smallest' withBadge={false} />}  */}
            &copy; {APP_NAME.SHORT}, {getYear(new Date())}. All rights reserved
            | design by{' '}
            <Link href='https://volodymyr-g.vercel.app'>
              <span className='cursor-pointer hover:text-foreground'>
                Volodymyr
              </span>
            </Link>
          </div>
          <div className='mt-1 flex justify-center gap-1'>
            {socialLinks.map((link) => {
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  target='_blank'
                  className='cursor-pointer hover:text-foreground'
                >
                  <HoverableElement
                    element={link.icon}
                    hoveredElement={link.hoverIcon}
                    withShift={false}
                    withScale
                  />
                </Link>
              )
            })}
          </div>
        </div>
      </footer>
    </>
  )
}

export default Footer
