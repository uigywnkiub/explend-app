'use client'

import { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'

import { Next13ProgressBar } from 'next13-progressbar'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'

import { NextUIProvider } from '@nextui-org/react'

import { SUCCESS } from '@/config/constants/colors'
import { LOCAL_STORAGE_KEY } from '@/config/constants/local-storage'
import { DEFAULT_THEME } from '@/config/constants/main'
import {
  DARK_TOAST_OPTS,
  LIGHT_TOAST_OPTS,
  TOAST_POSITION,
} from '@/config/constants/toast'

import { userLocale } from './lib/helpers'
import { TTheme } from './lib/types'

const NextThemesProvider = dynamic(
  () => import('next-themes').then((e) => e.ThemeProvider),
  {
    ssr: false,
  },
)

export default function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [theme, setTheme] = useState<TTheme | undefined>(undefined)

  useEffect(() => {
    setTheme(localStorage.getItem(LOCAL_STORAGE_KEY.THEME) as TTheme)
  }, [])

  return (
    <NextUIProvider navigate={router.push} locale={userLocale}>
      <NextThemesProvider attribute='class' defaultTheme={DEFAULT_THEME}>
        <Toaster
          position={TOAST_POSITION}
          toastOptions={
            theme === 'dark' || theme === 'system'
              ? DARK_TOAST_OPTS
              : LIGHT_TOAST_OPTS
          }
        />
        {children}
        <Next13ProgressBar
          height='3px'
          color={SUCCESS}
          options={{ showSpinner: false }}
          showOnShallow={true}
        />
      </NextThemesProvider>
    </NextUIProvider>
  )
}
