'use client'

import { useMemo } from 'react'
import { Toaster } from 'react-hot-toast'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'

import {
  DANGER_COLOR,
  DEFAULT_COLOR,
  OPACITY_COLOR,
  SUCCESS_COLOR,
} from '@/tailwind.config'
import { HeroUIProvider } from '@heroui/react'
import { DefaultTheme, useTheme } from '@wrksz/themes/client'

import { LOCAL_STORAGE_KEY } from '@/config/constants/local-storage'
import {
  DARK_TOAST_OPTS,
  LIGHT_TOAST_OPTS,
  TOAST_POSITION,
} from '@/config/constants/toast'

import {
  getBooleanFromLocalStorage,
  isLocalStorageAvailable,
  userLocale,
} from './lib/helpers'

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

  const getResolvedToastOpts = (theme: DefaultTheme | undefined) => {
    if (theme === 'light') return LIGHT_TOAST_OPTS
    if (theme === 'dark') return DARK_TOAST_OPTS
    const prefersDark =
      isLocalStorageAvailable() &&
      window.matchMedia('(prefers-color-scheme: dark)').matches

    return prefersDark ? DARK_TOAST_OPTS : LIGHT_TOAST_OPTS
  }
  const toastOptions = useMemo(() => getResolvedToastOpts(theme), [theme])

  return (
    <HeroUIProvider navigate={router.push} locale={userLocale}>
      <Toaster position={TOAST_POSITION} toastOptions={toastOptions} />
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
