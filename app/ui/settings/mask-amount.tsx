'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import { Switch } from '@nextui-org/react'

import { getIsAmountHidden, setIsAmountHidden } from '@/app/lib/helpers'

export default function MaskAmount() {
  const router = useRouter()
  const [isMasked, setIsMasked] = useState(getIsAmountHidden())

  return (
    <Switch
      size='sm'
      aria-label='Mask amount switch'
      color='primary'
      isSelected={isMasked}
      onValueChange={(isSelected) => [
        setIsMasked(isSelected),
        setIsAmountHidden(),
        router.refresh(),
      ]}
    >
      {isMasked ? 'Masked' : 'Mask'}
    </Switch>
  )
}
