import { CSSProperties } from 'react'
import { DefaultToastOptions, ToastPosition } from 'react-hot-toast'

import {
  CUSTOM_DARK_COLOR,
  CUSTOM_LIGHT_COLOR,
  DANGER_COLOR,
  SUCCESS_COLOR,
} from '@/tailwind.config'
import { DefaultTheme } from '@wrksz/themes/client'

import { isLocalStorageAvailable } from '@/app/lib/helpers'

export const TOAST_POSITION: ToastPosition = 'bottom-center'

export const TOAST_DURATION = 2500 // ms

const TOAST_FONT_WEIGHT = 600 // semibold

export const DARK_TOAST_STYLE: DefaultToastOptions['style'] = {
  background: CUSTOM_DARK_COLOR,
  color: CUSTOM_LIGHT_COLOR,
  fontWeight: TOAST_FONT_WEIGHT,
}

export const LIGHT_TOAST_STYLE: DefaultToastOptions['style'] = {
  background: CUSTOM_LIGHT_COLOR,
  color: CUSTOM_DARK_COLOR,
  fontWeight: TOAST_FONT_WEIGHT,
}

const ARIA: DefaultToastOptions['ariaProps'] = {
  role: 'status',
  'aria-live': 'polite',
}

export const DARK_TOAST_OPTS: DefaultToastOptions = {
  ariaProps: ARIA,
  duration: TOAST_DURATION,
  success: {
    iconTheme: {
      primary: CUSTOM_DARK_COLOR,
      secondary: SUCCESS_COLOR,
    },
    style: DARK_TOAST_STYLE,
  },
  error: {
    iconTheme: {
      primary: CUSTOM_DARK_COLOR,
      secondary: DANGER_COLOR,
    },
    style: DARK_TOAST_STYLE,
  },
  loading: {
    style: DARK_TOAST_STYLE,
  },
}

export const LIGHT_TOAST_OPTS: DefaultToastOptions = {
  ariaProps: ARIA,
  duration: TOAST_DURATION,
  success: {
    iconTheme: {
      primary: CUSTOM_LIGHT_COLOR,
      secondary: SUCCESS_COLOR,
    },
    style: LIGHT_TOAST_STYLE,
  },
  error: {
    iconTheme: {
      primary: CUSTOM_LIGHT_COLOR,
      secondary: DANGER_COLOR,
    },
    style: LIGHT_TOAST_STYLE,
  },
  loading: {
    style: LIGHT_TOAST_STYLE,
  },
}

export const getResolvedToastCfg = (
  theme: DefaultTheme | undefined,
  output: 'opts' | 'style' = 'opts',
): CSSProperties | DefaultToastOptions => {
  const isDark =
    theme === 'dark' ||
    (theme !== 'light' &&
      isLocalStorageAvailable() &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)

  if (output === 'style') return isDark ? DARK_TOAST_STYLE : LIGHT_TOAST_STYLE

  return isDark ? DARK_TOAST_OPTS : LIGHT_TOAST_OPTS
}
