'use client'

import { useEffect } from 'react'
import { DefaultToastOptions, Toaster } from 'react-hot-toast'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'

import {
  DANGER_COLOR,
  DEFAULT_COLOR,
  OPACITY_COLOR,
  SUCCESS_COLOR,
} from '@/tailwind.config'
import { HeroUIProvider } from '@heroui/react'
import { useTheme } from '@wrksz/themes/client'

import { LOCAL_STORAGE_KEY } from '@/config/constants/local-storage'
import { getResolvedToastCfg, TOAST_POSITION } from '@/config/constants/toast'

import { getBooleanFromLocalStorage, userLocale } from './lib/helpers'
import { registerPushSubscription } from './lib/push-subscription'

const DynamicNext13ProgressBar = dynamic(
  () => import('next13-progressbar').then((e) => e.Next13ProgressBar),
  {
    ssr: false,
  },
)

export default function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { theme } = useTheme()

  // Getting only when reloading the page.
  const isPositiveBalance = getBooleanFromLocalStorage(
    LOCAL_STORAGE_KEY.IS_POSITIVE_BALANCE,
  )
  const isAmountHidden = getBooleanFromLocalStorage(
    LOCAL_STORAGE_KEY.IS_AMOUNT_HIDDEN,
  )

  useEffect(() => {
    registerPushSubscription()
  }, [])

  return (
    <HeroUIProvider navigate={router.push} locale={userLocale}>
      <Toaster
        position={TOAST_POSITION}
        toastOptions={getResolvedToastCfg(theme) as DefaultToastOptions}
      />
      {children}
      <DynamicNext13ProgressBar
        height='3px'
        color={
          !isAmountHidden
            ? isPositiveBalance
              ? SUCCESS_COLOR
              : DANGER_COLOR
            : `${DEFAULT_COLOR}${OPACITY_COLOR.O50}`
        }
        options={{ showSpinner: false }}
        showOnShallow={true}
      />
    </HeroUIProvider>
  )
}
