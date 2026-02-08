'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  PiMonitor,
  PiMonitorFill,
  PiMoon,
  PiMoonFill,
  PiSun,
  PiSunFill,
} from 'react-icons/pi'

import { useTheme } from 'next-themes'

import { Select, SelectItem } from '@heroui/react'

import { DEFAULT_ICON_SIZE } from '@/config/constants/main'
import { TOAST_DURATION } from '@/config/constants/toast'

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

export default function ThemeSwitcher() {
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    // This is a legitimate use case for detecting client-side mount
    // We suppress the warning as this pattern is recommended by next-themes
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <Select
      isVirtualized={false}
      label='Select a theme'
      items={themes}
      isDisabled={isLoading}
      isLoading={isLoading}
      disabledKeys={[theme!]}
      defaultSelectedKeys={[theme!]}
      onChange={(key) => {
        setIsLoading(true)
        setTheme(key.target.value)
        toast.success('Theme updated.')
        setTimeout(
          () => [setIsLoading(false), window.location.reload()],
          TOAST_DURATION,
        )
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
