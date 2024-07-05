'use client'

import { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { useRouter } from 'next/navigation'

import { NextUIProvider } from '@nextui-org/react'

import {
  DARK_TOAST_OPTS,
  LIGHT_TOAST_OPTS,
  TOAST_POSITION,
} from '@/config/constants/toast'

import { TTheme } from './lib/types'

export default function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter()
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
      </NextThemesProvider>
    </NextUIProvider>
  )
}
