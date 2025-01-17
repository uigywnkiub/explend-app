'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import { Switch } from '@heroui/react'

import { LOCAL_STORAGE_KEY } from '@/config/constants/local-storage'

import {
  getBooleanFromLocalStorage,
  toggleBooleanInLocalStorage,
} from '@/app/lib/helpers'

export default function MaskAmount() {
  const router = useRouter()
  const [isMasked, setIsMasked] = useState(
    getBooleanFromLocalStorage(LOCAL_STORAGE_KEY.IS_AMOUNT_HIDDEN),
  )

  return (
    <Switch
      size='sm'
      aria-label='Mask amount switch'
      color='primary'
      isSelected={isMasked}
      onValueChange={(isSelected) => [
        setIsMasked(isSelected),
        toggleBooleanInLocalStorage(LOCAL_STORAGE_KEY.IS_AMOUNT_HIDDEN),
        router.refresh(),
      ]}
    >
      {isMasked ? 'Masked' : 'Mask'}
    </Switch>
  )
}
