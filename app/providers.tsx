'use client'

import { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'

import { Next13ProgressBar } from 'next13-progressbar'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { useTransitionRouter } from 'next-view-transitions'

import { NextUIProvider } from '@nextui-org/react'

import { SUCCESS } from '@/config/constants/colors'
import {
  DARK_TOAST_OPTS,
  LIGHT_TOAST_OPTS,
  TOAST_POSITION,
} from '@/config/constants/toast'

import { TTheme } from './lib/types'

export default function Providers({ children }: { children: React.ReactNode }) {
  const router = useTransitionRouter()
  const [theme, setTheme] = useState<TTheme | undefined>(undefined)

  useEffect(() => {
    setTheme(localStorage.getItem('theme') as TTheme)
  }, [])

  return (
    <NextUIProvider navigate={router.push}>
      <NextThemesProvider attribute='class' defaultTheme='dark'>
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
