'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import { Switch } from '@heroui/react'
import { haptic } from 'ios-haptics'

import { AI_NAME } from '@/config/constants/main'

import { updateAiFeaturesEnabled } from '@/app/lib/actions'
import type { TUserId } from '@/app/lib/types'

type TProps = { userId: TUserId; enabled: boolean }

export default function ExplendIntelligenceSwitch({ userId, enabled }: TProps) {
  const router = useRouter()
  const [isSelected, setIsSelected] = useState(enabled)
  const [isPending, setIsPending] = useState(false)

  return (
    <Switch
      aria-label={`${AI_NAME.FULL} switch`}
      color='primary'
      isSelected={isSelected}
      isDisabled={isPending}
      onValueChange={async (value) => {
        haptic()
        setIsSelected(value)
        setIsPending(true)
        try {
          await updateAiFeaturesEnabled(userId, value)
          router.refresh()
        } catch {
          setIsSelected(!value)
        } finally {
          setIsPending(false)
        }
      }}
    />
  )
}
