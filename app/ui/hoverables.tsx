'use client'

import { useHover, useMedia } from 'react-use'

import Link from 'next/link'

import { motion } from 'framer-motion'

import { DIV } from '@/config/constants/motion'

import type { TNavLink, TSelect } from '../lib/types'
import { cn, getBreakpointWidth } from '../lib/utils'

type THoverableElement = {
  element: TSelect['icon'] | string
  hoveredElement?: TSelect['hoverIcon']
  withScale?: boolean
  withShift?: boolean
}
export const HoverableElement = ({
  element,
  hoveredElement,
  withScale = false,
  withShift = true,
}: THoverableElement) => {
  const isMd = useMedia(getBreakpointWidth('md'), typeof window !== 'undefined')

  return useHover((hovered: boolean) => {
    return (
      <motion.div
        initial={{ ...DIV.INITIAL, y: withShift ? -20 : 0 }}
        animate={{ ...DIV.ANIMATE(hovered, withScale), y: 0 }}
        transition={{ ...DIV.TRANSITION }}
      >
        {isMd
          ? hoveredElement && hovered
            ? hoveredElement
            : element
          : hoveredElement || element}
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
    <Link
      href={link.url}
      className={cn(
        'flex w-full items-center gap-4 rounded-medium py-2 text-2xl md:text-base',
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
  ))
}
