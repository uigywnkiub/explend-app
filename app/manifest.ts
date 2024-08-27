import type { MetadataRoute } from 'next'

import { CUSTOM_DARK } from '@/config/constants/colors'
import {
  APP_DESCRIPTION,
  APP_NAME,
  DEFAULT_DIR,
  DEFAULT_LANG,
} from '@/config/constants/main'

export default function manifest(): MetadataRoute.Manifest {
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
        sizes: '2840x1560',
        type: 'image/png',
        // @ts-ignore
        form_factor: 'wide',
        label: 'Home',
      },
      {
        src: '/images/screenshots/monthly-report.png',
        sizes: '2840x1560',
        type: 'image/png',
        // @ts-ignore
        form_factor: 'wide',
        label: 'Monthly Report',
      },
      {
        src: '/images/screenshots/chart.png',
        sizes: '2840x1560',
        type: 'image/png',
        // @ts-ignore
        form_factor: 'wide',
        label: 'Chart',
      },
      {
        src: '/images/screenshots/home-mobile.png',
        sizes: '1125x2323',
        type: 'image/png',
        // @ts-ignore
        form_factor: 'narrow',
        label: 'Home mobile',
      },
      {
        src: '/images/screenshots/monthly-report-mobile.png',
        sizes: '1125x2323',
        type: 'image/png',
        // @ts-ignore
        form_factor: 'narrow',
        label: 'Monthly Report mobile',
      },
      {
        src: '/images/screenshots/categories-mobile.png',
        sizes: '1125x2323',
        type: 'image/png',
        // @ts-ignore
        form_factor: 'narrow',
        label: 'Categories mobile',
      },
    ],
  }
}
