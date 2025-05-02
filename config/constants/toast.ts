import { DefaultToastOptions, ToastPosition } from 'react-hot-toast'

import { CUSTOM_DARK, CUSTOM_LIGHT, DANGER, SUCCESS } from './colors'

export const TOAST_POSITION: ToastPosition = 'bottom-center'

export const TOAST_DURATION = 2500 // ms

const TOAST_FONT_WEIGHT = 600 // semibold

export const TOAST_DARK_STYLE: DefaultToastOptions['style'] = {
  background: CUSTOM_DARK,
  color: CUSTOM_LIGHT,
  fontWeight: TOAST_FONT_WEIGHT,
}

export const TOAST_LIGHT_STYLE: DefaultToastOptions['style'] = {
  background: CUSTOM_LIGHT,
  color: CUSTOM_DARK,
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
      primary: CUSTOM_DARK,
      secondary: SUCCESS,
    },
    style: TOAST_DARK_STYLE,
  },
  error: {
    iconTheme: {
      primary: CUSTOM_DARK,
      secondary: DANGER,
    },
    style: TOAST_DARK_STYLE,
  },
  loading: {
    style: TOAST_DARK_STYLE,
  },
}

export const LIGHT_TOAST_OPTS: DefaultToastOptions = {
  ariaProps: ARIA,
  duration: TOAST_DURATION,
  success: {
    iconTheme: {
      primary: CUSTOM_LIGHT,
      secondary: SUCCESS,
    },
    style: TOAST_LIGHT_STYLE,
  },
  error: {
    iconTheme: {
      primary: CUSTOM_LIGHT,
      secondary: DANGER,
    },
    style: TOAST_LIGHT_STYLE,
  },
  loading: {
    style: TOAST_LIGHT_STYLE,
  },
}
