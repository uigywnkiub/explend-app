'use client'

import {
  PiBugBeetle,
  PiBugBeetleFill,
  PiChatText,
  PiChatTextFill,
  PiGearSix,
  PiGearSixFill,
  PiHouse,
  PiHouseFill,
  PiPolygon,
  PiPolygonFill,
  PiPresentationChart,
  PiPresentationChartFill,
  PiStack,
  PiStackFill,
} from 'react-icons/pi'

import { usePathname } from 'next/navigation'

import { NAV_ICON_SIZE, NAV_TITLE } from '@/config/constants/navigation'
import { ROUTE } from '@/config/constants/routes'

import type { TNavLink } from '../../lib/types'
import { HoverableNavLink } from '../hoverables'
import Logo from '../logo'

const topNavLinks: TNavLink[] = [
  {
    title: NAV_TITLE.HOME,
    url: ROUTE.HOME,
    icon: <PiHouse size={NAV_ICON_SIZE} />,
    hoverIcon: <PiHouseFill size={NAV_ICON_SIZE} />,
  },
  {
    title: NAV_TITLE.MONTHLY_REPORT,
    url: ROUTE.MONTHLY_REPORT,
    icon: <PiPresentationChart size={NAV_ICON_SIZE} />,
    hoverIcon: <PiPresentationChartFill size={NAV_ICON_SIZE} />,
  },
  {
    title: NAV_TITLE.CHART,
    url: ROUTE.CHART,
    icon: <PiPolygon size={NAV_ICON_SIZE} />,
    hoverIcon: <PiPolygonFill size={NAV_ICON_SIZE} />,
  },
  {
    title: NAV_TITLE.CATEGORIES,
    url: ROUTE.CATEGORIES,
    icon: <PiStack size={NAV_ICON_SIZE} />,
    hoverIcon: <PiStackFill size={NAV_ICON_SIZE} />,
  },
  {
    title: NAV_TITLE.SETTINGS,
    url: ROUTE.SETTINGS,
    icon: <PiGearSix size={NAV_ICON_SIZE} />,
    hoverIcon: <PiGearSixFill size={NAV_ICON_SIZE} />,
  },
]

const bottomNavLinks: TNavLink[] = [
  {
    title: NAV_TITLE.FEEDBACK,
    url: ROUTE.FEEDBACK,
    icon: <PiChatText size={NAV_ICON_SIZE} />,
    hoverIcon: <PiChatTextFill size={NAV_ICON_SIZE} />,
  },
  {
    title: NAV_TITLE.ISSUE,
    url: ROUTE.ISSUE,
    icon: <PiBugBeetle size={NAV_ICON_SIZE} />,
    hoverIcon: <PiBugBeetleFill size={NAV_ICON_SIZE} />,
  },
]

type TProps = {
  linksGroup: 'top' | 'bottom'
  withLogo?: boolean
}

function Navbar({ linksGroup, withLogo }: TProps) {
  const pathname = usePathname()
  const navLinks: TNavLink[] =
    linksGroup === 'top' ? topNavLinks : bottomNavLinks

  return (
    <>
      {withLogo && <Logo size='sm' badgeSize='sm' />}
      {navLinks.map((link) => {
        return (
          <HoverableNavLink
            key={link.url}
            link={link}
            isActiveLink={pathname === link.url}
            withScale
          />
        )
      })}
    </>
  )
}

export default Navbar
