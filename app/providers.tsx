'use client'

import { useEffect } from 'react'
import { DefaultToastOptions, Toaster } from 'react-hot-toast'

import { useRouter } from 'next/navigation'

import { HeroUIProvider } from '@heroui/react'
import { useTheme } from '@wrksz/themes/client'

import { getResolvedToastCfg, TOAST_POSITION } from '@/config/constants/toast'

import { userLocale } from './lib/helpers'
import { registerPushSubscription } from './lib/push-subscription'
import PullToRefresh from './ui/pull-to-refresh'

export default function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { theme } = useTheme()

  useEffect(() => {
    registerPushSubscription()
  }, [])

  return (
    <HeroUIProvider navigate={router.push} locale={userLocale}>
      <Toaster
        position={TOAST_POSITION}
        toastOptions={getResolvedToastCfg(theme) as DefaultToastOptions}
      />
      <PullToRefresh />
      {children}
    </HeroUIProvider>
  )
}
