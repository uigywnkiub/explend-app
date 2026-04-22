'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { Switch } from '@heroui/react'
import { haptic } from 'ios-haptics'

import {
  getBooleanFromLocalStorage,
  toggleBooleanInLocalStorage,
} from '@/app/lib/helpers'

type TProps = {
  localStorageKey: string
}

export default function LocalStorageSwitch({ localStorageKey }: TProps) {
  const router = useRouter()
  const [isSelected, setIsSelected] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    setIsSelected(getBooleanFromLocalStorage(localStorageKey))
  }, [localStorageKey])

  return (
    <Switch
      aria-label='Switch'
      color='primary'
      isSelected={isSelected || false}
      onValueChange={(value) => {
        haptic()
        setIsSelected(value)
        toggleBooleanInLocalStorage(localStorageKey)
        router.refresh()
      }}
    />
  )
}
