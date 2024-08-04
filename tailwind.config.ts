import { nextui } from '@nextui-org/react'
import type { Config } from 'tailwindcss'

import { BLINK_DURATION } from './config/constants/animation'
import {
  CUSTOM_DARK,
  CUSTOM_LIGHT,
  DANGER,
  SUCCESS,
} from './config/constants/colors'

const config: Config = {
  darkMode: 'class',
  content: [
    // './pages/**/*.{js,ts,jsx,tsx,mdx}',
    // './components/**/*.{js,ts,jsx,tsx,mdx}',
    // './ui/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['var(--font-inter)'],
      },
      fontSize: {
        xxs: '0.68rem',
      },
      screens: {
        xxs: '360px',
        xs: '480px',
      },
      keyframes: {
        ['blink-light']: {
          '0%': { filter: 'brightness(0.8)' },
          '100%': { filter: 'brightness(1)' },
        },
        ['blink-dark']: {
          '0%': { filter: 'brightness(1.6)' },
          '100%': { filter: 'brightness(1)' },
        },
      },
      animation: {
        'blink-light-once': `blink-light ${BLINK_DURATION}s linear`,
        'blink-dark-once': `blink-dark ${BLINK_DURATION}s linear`,
        'pulse-fast': `${BLINK_DURATION}s cubic-bezier(.4, 0, .6, 1) infinite pulse`,
      },
      backgroundImage: {
        'logo-gradient': `linear-gradient(to bottom, ${SUCCESS}, ${DANGER})`,
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
    transitionTimingFunction: {
      'out-cubic': 'cubic-bezier(.33,1,.68,1)',
    },
  },
  plugins: [
    nextui({
      themes: {
        light: {
          colors: {
            background: CUSTOM_LIGHT,
            foreground: CUSTOM_DARK,
          },
        },
        dark: {
          colors: {
            background: CUSTOM_DARK,
            foreground: CUSTOM_LIGHT,
          },
        },
      },
    }),
  ],
}

export default config
