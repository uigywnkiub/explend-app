import { useHover } from 'react-use'

import Link from 'next/link'

import { motion } from 'framer-motion'

import { DIV } from '@/config/constants/framer'

import type { TNavLink, TSelect } from '../lib/types'

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
  return useHover((hovered: boolean) => {
    return (
      <motion.div
        initial={{ ...DIV.INITIAL, y: withShift ? -20 : 0 }}
        animate={{ ...DIV.ANIMATE(hovered, withScale), y: 0 }}
        transition={{ ...DIV.TRANSITION }}
      >
        {hoveredElement && hovered ? hoveredElement : element}
      </motion.div>
    )
  })
}

type THoverableNavLink = {
  link: TNavLink
  isActiveLink: boolean
  withScale?: THoverableElement['withScale']
}
export const HoverableNavLink = ({
  link,
  isActiveLink,
  withScale = false,
}: THoverableNavLink) => {
  return useHover((hovered: boolean) => (
    <Link
      href={link.url}
      className={`flex w-full items-center gap-4 rounded-medium p-2 ${
        isActiveLink ? 'bg-content1' : 'text-default-500 hover:text-foreground'
      }`}
    >
      <motion.div
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
