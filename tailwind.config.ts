import { heroui } from '@heroui/react'
import type { Config } from 'tailwindcss'

export const BLINK_DURATION: number = 0.8

// Default base colors from https://nextui.org/docs/customization/colors
export const DANGER_COLOR = '#f31260'
export const SUCCESS_COLOR = '#17c964'
export const DEFAULT_COLOR = '#d4d4d8'

// Custom
export const CUSTOM_DARK_COLOR = '#080808'
export const CUSTOM_LIGHT_COLOR = '#F9F9F9'

export const GOLD_COLOR = '#FFD700'
export const SILVER_COLOR = '#C0C0C0'
export const BRONZE_COLOR = '#CD7F32'

export const AI_COLOR = '#62A4FA'

export const enum OPACITY_COLOR {
  O100 = 'FF', // 100% opacity
  O95 = 'F2', // 95% opacity
  O90 = 'E6', // 90% opacity
  O85 = 'D9', // 85% opacity
  O80 = 'CC', // 80% opacity
  O75 = 'BF', // 75% opacity
  O70 = 'B3', // 70% opacity
  O65 = 'A6', // 65% opacity
  O60 = '99', // 60% opacity
  O55 = '8C', // 55% opacity
  O50 = '80', // 50% opacity
  O45 = '73', // 45% opacity
  O40 = '66', // 40% opacity
  O35 = '59', // 35% opacity
  O30 = '4D', // 30% opacity
  O25 = '40', // 25% opacity
  O20 = '33', // 20% opacity
  O15 = '26', // 15% opacity
  O10 = '1A', // 10% opacity
  O05 = '0D', // 5% opacity
  O0 = '00', // 0% opacity
}

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
        light: CUSTOM_LIGHT_COLOR,
        dark: CUSTOM_DARK_COLOR,
        gold: GOLD_COLOR,
        silver: SILVER_COLOR,
        bronze: BRONZE_COLOR,
        ai: AI_COLOR,
      },
      boxShadow: {
        'inset-line-light': `inset 0 -1px 0 0 ${CUSTOM_LIGHT_COLOR}`,
        'inset-line-dark': `inset 0 -1px 0 0 ${CUSTOM_DARK_COLOR}`,
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
        wave: {
          '0%': { transform: 'rotate(0deg)' },
          '10%': { transform: 'rotate(14deg)' },
          '20%': { transform: 'rotate(-8deg)' },
          '30%': { transform: 'rotate(14deg)' },
          '40%': { transform: 'rotate(-4deg)' },
          '50%': { transform: 'rotate(10deg)' },
          '60%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
      },
      animation: {
        'blink-light-once': `blink-light ${BLINK_DURATION}s linear`,
        'blink-dark-once': `blink-dark ${BLINK_DURATION}s linear`,
        'pulse-fast': `${BLINK_DURATION}s cubic-bezier(.4, 0, .6, 1) infinite pulse`,
        'transform-scale': 'transform-scale 1s infinite',
        wave: 'wave 1s ease-in-out',
      },
      backgroundImage: {
        'logo-gradient': `linear-gradient(to bottom, ${SUCCESS_COLOR}, ${DANGER_COLOR})`,
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'ai-gradient': 'linear-gradient(to right, #61A5FA, #C084FC, #F87171)',
      },
      dropShadow: {
        ai: `0 0 1px ${AI_COLOR}`,
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
            background: CUSTOM_LIGHT_COLOR,
            foreground: CUSTOM_DARK_COLOR,
          },
        },
        dark: {
          colors: {
            background: CUSTOM_DARK_COLOR,
            foreground: CUSTOM_LIGHT_COLOR,
          },
        },
      },
    }),
  ],
}

export default config
