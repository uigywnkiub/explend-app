'use client'

import { useHover, useMedia } from 'react-use'

import Link from 'next/link'

import { motion } from 'framer-motion'

import { DIV } from '@/config/constants/motion'

import { cn, getBreakpointWidth } from '../lib/helpers'
import type { TNavLink, TSelect } from '../lib/types'

type THoverableElement = {
  uKey?: string
  element: TSelect['icon'] | string
  hoveredElement?: TSelect['hoverIcon']
  withScale?: boolean
  withShift?: boolean
  text?: string
}
export const HoverableElement = ({
  uKey,
  element,
  hoveredElement,
  withScale = false,
  withShift = true,
  text,
}: THoverableElement) => {
  const isMd = useMedia(getBreakpointWidth('md'), typeof window !== 'undefined')

  return useHover((hovered: boolean) => {
    const showHovered = isMd && hoveredElement && hovered

    return (
      <motion.div
        key={uKey}
        initial={{ ...DIV.INITIAL, y: withShift ? -20 : 0 }}
        animate={{ ...DIV.ANIMATE(hovered, isMd && withScale), y: 0 }}
        transition={{ ...DIV.TRANSITION }}
      >
        <div className='relative'>
          <motion.div
            animate={{ opacity: showHovered ? 0.3 : 1 }}
            transition={{ ...DIV.TRANSITION }}
          >
            {isMd ? element : hoveredElement || element}
          </motion.div>

          {isMd && hoveredElement && (
            <motion.div
              className='absolute inset-0'
              initial={false}
              animate={{ opacity: showHovered ? 1 : 0.3 }}
              transition={{ ...DIV.TRANSITION }}
            >
              {hoveredElement}
            </motion.div>
          )}
        </div>

        {text && <span className='ml-1'>{text}</span>}
      </motion.div>
    )
  })
}

type THoverableNavLink = {
  idx: number
  link: TNavLink
  isActiveLink: boolean
  withScale?: THoverableElement['withScale']
}
export const HoverableNavLink = ({
  idx,
  link,
  isActiveLink,
  withScale = false,
}: THoverableNavLink) => {
  return useHover((hovered: boolean) => (
    <li key={link.title} role='listitem'>
      <Link
        href={link.url}
        className={cn(
          'rounded-medium flex w-full items-center gap-4 py-1 text-2xl md:py-2 md:text-base',
          !isActiveLink && 'text-default-500 hover:text-foreground',
          idx === 0 && 'mt-8 md:mt-4',
        )}
      >
        <motion.div
          className='hidden md:block'
          initial={{ ...DIV.INITIAL }}
          animate={{ ...DIV.ANIMATE(isActiveLink || hovered, withScale) }}
          transition={{ ...DIV.TRANSITION }}
        >
          {isActiveLink || hovered ? link.hoverIcon : link.icon}
        </motion.div>
        {link.title}
      </Link>
    </li>
  ))
}
