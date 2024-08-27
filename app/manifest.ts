import type { MetadataRoute } from 'next'

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
    orientation: 'portrait',
    background_color: '#FFFFFF',
    theme_color: '#FFFFFF',
    icons: [
      {
        src: '/icons/favicon.ico',
        sizes: '32x32 16x16',
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
  }
}
