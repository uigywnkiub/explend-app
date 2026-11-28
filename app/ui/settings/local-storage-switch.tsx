'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { Switch } from '@heroui/react'
import { haptic } from 'ios-haptics'

import { getFromLocalStorage, setInLocalStorage } from '@/app/lib/helpers'

type TProps = {
  localStorageKey: string
  isDisabled?: boolean
  defaultValue?: boolean
}

export default function LocalStorageSwitch({
  localStorageKey,
  isDisabled = false,
  defaultValue = false,
}: TProps) {
  const router = useRouter()
  const [isSelected, setIsSelected] = useState<boolean | undefined>(
    defaultValue,
  )

  useEffect(() => {
    const storedValue = getFromLocalStorage(localStorageKey)
    setIsSelected(storedValue === null ? defaultValue : storedValue === 'true')
  }, [defaultValue, localStorageKey])

  return (
    <Switch
      aria-label='Switch'
      color='primary'
      isDisabled={isDisabled}
      isSelected={isSelected ?? defaultValue}
      onValueChange={(value) => {
        haptic()
        setIsSelected(value)
        setInLocalStorage(localStorageKey, String(value))
        router.refresh()
      }}
    />
  )
}
