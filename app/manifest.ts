import type { MetadataRoute } from 'next'

import { CUSTOM_DARK } from '@/config/constants/colors'
import {
  APP_DESCRIPTION,
  APP_NAME,
  DEFAULT_DIR,
  DEFAULT_LANG,
} from '@/config/constants/main'
import { NAV_TITLE } from '@/config/constants/navigation'

export default function manifest(): MetadataRoute.Manifest {
  // Desktop.
  const SCREENSHOT_SIZE_DESKTOP = '2840x1560'
  const SCREENSHOT_FORM_FACTOR_DESKTOP = 'wide'
  // Mobile.
  const SCREENSHOT_SIZE_MOBILE = '1125x2323'
  const SCREENSHOT_FORM_FACTOR_MOBILE = 'narrow'
  const SCREENSHOT_MOBILE_SUFFIX = 'mobile'
  // Desktop and mobile.
  const SCREENSHOT_TYPE = 'image/png'

  return {
    name: APP_NAME.SHORT,
    short_name: APP_NAME.SHORT,
    description: APP_DESCRIPTION,
    lang: DEFAULT_LANG,
    dir: DEFAULT_DIR,
    id: '/',
    start_url: '/',
    display: 'standalone',
    display_override: ['window-controls-overlay'],
    orientation: 'portrait',
    background_color: CUSTOM_DARK,
    theme_color: CUSTOM_DARK,
    icons: [
      {
        src: '/icons/favicon.ico',
        sizes: '48x48',
        type: 'image/x-icon',
      },
      {
        src: '/icons/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    screenshots: [
      {
        src: '/images/screenshots/home.png',
        sizes: SCREENSHOT_SIZE_DESKTOP,
        type: SCREENSHOT_TYPE,
        form_factor: SCREENSHOT_FORM_FACTOR_DESKTOP,
        label: NAV_TITLE.HOME,
      },
      {
        src: '/images/screenshots/monthly-report.png',
        sizes: SCREENSHOT_SIZE_DESKTOP,
        type: SCREENSHOT_TYPE,
        form_factor: SCREENSHOT_FORM_FACTOR_DESKTOP,
        label: NAV_TITLE.MONTHLY_REPORT,
      },
      {
        src: '/images/screenshots/chart.png',
        sizes: SCREENSHOT_SIZE_DESKTOP,
        type: SCREENSHOT_TYPE,
        form_factor: SCREENSHOT_FORM_FACTOR_DESKTOP,
        label: NAV_TITLE.CHART,
      },
      {
        src: '/images/screenshots/home-mobile.png',
        sizes: SCREENSHOT_SIZE_MOBILE,
        type: SCREENSHOT_TYPE,
        form_factor: SCREENSHOT_FORM_FACTOR_MOBILE,
        label: `${NAV_TITLE.HOME} ${SCREENSHOT_MOBILE_SUFFIX}`,
      },
      {
        src: '/images/screenshots/monthly-report-mobile.png',
        sizes: SCREENSHOT_SIZE_MOBILE,
        type: SCREENSHOT_TYPE,
        form_factor: SCREENSHOT_FORM_FACTOR_MOBILE,
        label: `${NAV_TITLE.MONTHLY_REPORT} ${SCREENSHOT_MOBILE_SUFFIX}`,
      },
      {
        src: '/images/screenshots/categories-mobile.png',
        sizes: SCREENSHOT_SIZE_MOBILE,
        type: SCREENSHOT_TYPE,
        form_factor: SCREENSHOT_FORM_FACTOR_MOBILE,
        label: `${NAV_TITLE.CATEGORIES} ${SCREENSHOT_MOBILE_SUFFIX}`,
      },
    ],
  }
}
