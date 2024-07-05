import { DefaultToastOptions, ToastPosition } from 'react-hot-toast'

import { CUSTOM_DARK, CUSTOM_LIGHT, DANGER, SUCCESS } from './colors'

export const TOAST_POSITION: ToastPosition = 'bottom-center'

export const TOAST_DURATION = 2000

export const DARK_TOAST_OPTS: DefaultToastOptions = {
  duration: TOAST_DURATION,
  success: {
    iconTheme: {
      primary: CUSTOM_DARK,
      secondary: SUCCESS,
    },
    style: {
      background: CUSTOM_DARK,
      color: CUSTOM_LIGHT,
    },
  },
  error: {
    iconTheme: {
      primary: CUSTOM_DARK,
      secondary: DANGER,
    },
    style: {
      background: CUSTOM_DARK,
      color: CUSTOM_LIGHT,
    },
  },
}

export const LIGHT_TOAST_OPTS: DefaultToastOptions = {
  duration: TOAST_DURATION,
  success: {
    iconTheme: {
      primary: CUSTOM_LIGHT,
      secondary: SUCCESS,
    },
    style: {
      background: CUSTOM_LIGHT,
      color: CUSTOM_DARK,
    },
  },
  error: {
    iconTheme: {
      primary: CUSTOM_LIGHT,
      secondary: DANGER,
    },
    style: {
      background: CUSTOM_LIGHT,
      color: CUSTOM_DARK,
    },
  },
}
