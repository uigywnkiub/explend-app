import { heroui } from '@heroui/react'
import type { Config } from 'tailwindcss'

import { BLINK_DURATION } from './config/constants/animation'
import {
  AI,
  BRONZE,
  CUSTOM_DARK,
  CUSTOM_LIGHT,
  DANGER,
  GOLD,
  SILVER,
  SUCCESS,
} from './config/constants/colors'

const config: Config = {
  darkMode: 'class',
  content: [
    // './pages/**/*.{js,ts,jsx,tsx,mdx}',
    // './components/**/*.{js,ts,jsx,tsx,mdx}',
    // './ui/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    // Make sure it's pointing to the ROOT node_module
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['var(--font-inter)'],
        fracktif: ['var(--font-fracktif)'],
      },
      screens: {
        xxs: '360px',
        xs: '480px',
      },
      colors: {
        light: CUSTOM_LIGHT,
        dark: CUSTOM_DARK,
        gold: GOLD,
        silver: SILVER,
        bronze: BRONZE,
        ai: AI,
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
        ['transform-scale']: {
          '0%': { transform: 'scaleX(1)' },
          '50%': { transform: 'scaleX(1.2)' },
          '100%': { transform: 'scaleX(1)' },
        },
      },
      animation: {
        'blink-light-once': `blink-light ${BLINK_DURATION}s linear`,
        'blink-dark-once': `blink-dark ${BLINK_DURATION}s linear`,
        'pulse-fast': `${BLINK_DURATION}s cubic-bezier(.4, 0, .6, 1) infinite pulse`,
        'transform-scale': 'transform-scale 1s infinite',
      },
      backgroundImage: {
        'logo-gradient': `linear-gradient(to bottom, ${SUCCESS}, ${DANGER})`,
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'ai-gradient': 'linear-gradient(to right, #61A5FA, #C084FC, #F87171)',
      },
      dropShadow: {
        ai: `0 0 1px ${AI}`,
      },
    },
    transitionTimingFunction: {
      'out-cubic': 'cubic-bezier(.33,1,.68,1)',
    },
  },
  plugins: [
    heroui({
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
