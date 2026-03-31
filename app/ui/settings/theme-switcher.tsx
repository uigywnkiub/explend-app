'use client'

import { useSyncExternalStore } from 'react'
import toast from 'react-hot-toast'
import {
  PiMonitor,
  PiMonitorFill,
  PiMoon,
  PiMoonFill,
  PiSun,
  PiSunFill,
} from 'react-icons/pi'

import { Select, SelectItem } from '@heroui/react'
import type { DefaultTheme } from '@wrksz/themes'
import { useTheme } from '@wrksz/themes/client'

import { DEFAULT_ICON_SIZE } from '@/config/constants/main'

import { TSelect } from '@/app/lib/types'

import { HoverableElement } from '../hoverables'

const themes: TSelect[] = [
  {
    key: 'dark',
    value: 'Dark',
    icon: <PiMoon size={DEFAULT_ICON_SIZE} />,
    hoverIcon: <PiMoonFill size={DEFAULT_ICON_SIZE} />,
  },
  {
    key: 'system',
    value: 'System',
    icon: <PiMonitor size={DEFAULT_ICON_SIZE} />,
    hoverIcon: <PiMonitorFill size={DEFAULT_ICON_SIZE} />,
  },
  {
    key: 'light',
    value: 'Light',
    icon: <PiSun size={DEFAULT_ICON_SIZE} />,
    hoverIcon: <PiSunFill size={DEFAULT_ICON_SIZE} />,
  },
]

const THEME_KEYS = themes.map((t) => t.key) as DefaultTheme[]

const useIsMounted = () =>
  useSyncExternalStore(
    (cb) => {
      window.addEventListener('mount', cb)

      return () => window.removeEventListener('mount', cb)
    },
    () => true, // Client snapshot — always mounted.
    () => false, // Server snapshot — never mounted.
  )

export default function ThemeSwitcher() {
  const mounted = useIsMounted()
  const { theme, setTheme } = useTheme()

  if (!mounted) return null

  return (
    <Select
      isVirtualized={false}
      label='Select a theme'
      items={themes}
      disabledKeys={[theme!]}
      defaultSelectedKeys={[theme!]}
      onSelectionChange={(keys) => {
        const selected = Array.from(keys)[0] as string
        if (THEME_KEYS.includes(selected as DefaultTheme)) {
          setTheme(selected as DefaultTheme)
          toast.success('Theme updated.')
        }
      }}
    >
      {themes.map((theme) => (
        <SelectItem
          key={theme.key}
          startContent={
            <HoverableElement
              uKey={theme.key}
              element={theme.icon}
              hoveredElement={theme.hoverIcon}
            />
          }
        >
          {theme.value}
        </SelectItem>
      ))}
    </Select>
  )
}
