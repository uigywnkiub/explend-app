'use client'

import { useState } from 'react'
import { Toaster } from 'react-hot-toast'

import { Next13ProgressBar } from 'next13-progressbar'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'

import { HeroUIProvider } from '@heroui/react'

import { DANGER, DEFAULT, OPACITY, SUCCESS } from '@/config/constants/colors'
import { LOCAL_STORAGE_KEY } from '@/config/constants/local-storage'
import { DEFAULT_THEME } from '@/config/constants/main'
import {
  DARK_TOAST_OPTS,
  LIGHT_TOAST_OPTS,
  TOAST_POSITION,
} from '@/config/constants/toast'

import {
  getBooleanFromLocalStorage,
  getFromLocalStorage,
  userLocale,
} from './lib/helpers'
import { TTheme } from './lib/types'

const NextThemesProvider = dynamic(
  () => import('next-themes').then((e) => e.ThemeProvider),
  {
    ssr: false,
  },
)

export default function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [theme] = useState<TTheme | undefined>(
    getFromLocalStorage(LOCAL_STORAGE_KEY.THEME) as TTheme | undefined,
  )

  // Getting only when reloading the page.
  const isPositiveBalance = getBooleanFromLocalStorage(
    LOCAL_STORAGE_KEY.IS_POSITIVE_BALANCE,
  )
  const isAmountHidden = getBooleanFromLocalStorage(
    LOCAL_STORAGE_KEY.IS_AMOUNT_HIDDEN,
  )

  const toastOptions =
    theme === 'dark' || theme === 'system' ? DARK_TOAST_OPTS : LIGHT_TOAST_OPTS

  return (
    <HeroUIProvider navigate={router.push} locale={userLocale}>
      <NextThemesProvider attribute='class' defaultTheme={DEFAULT_THEME}>
        <Toaster position={TOAST_POSITION} toastOptions={toastOptions} />
        {children}
        <Next13ProgressBar
          height='3px'
          color={
            !isAmountHidden
              ? isPositiveBalance
                ? SUCCESS
                : DANGER
              : `${DEFAULT}${OPACITY.O50}`
          }
          options={{ showSpinner: false }}
          showOnShallow={true}
        />
      </NextThemesProvider>
    </HeroUIProvider>
  )
}
