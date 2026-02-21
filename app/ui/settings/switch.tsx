'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import { Switch } from '@heroui/react'

import {
  getBooleanFromLocalStorage,
  toggleBooleanInLocalStorage,
} from '@/app/lib/helpers'

type TProps = {
  localStorageKey: string
}

export default function LocalStorageSwitch({ localStorageKey }: TProps) {
  const router = useRouter()
  const [isSelected, setIsSelected] = useState(() =>
    getBooleanFromLocalStorage(localStorageKey),
  )

  return (
    <Switch
      aria-label='Switch'
      color='primary'
      isSelected={isSelected}
      onValueChange={(isSelected) => [
        setIsSelected(isSelected),
        toggleBooleanInLocalStorage(localStorageKey),
        router.refresh(),
      ]}
    />
  )
}
