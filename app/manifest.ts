import type { MetadataRoute } from 'next'

import {
  APP_DESCRIPTION,
  APP_NAME,
  DEFAULT_LANG,
} from '@/config/constants/main'
import { siteMeta } from '@/config/site-meta'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_NAME.FULL,
    short_name: APP_NAME.SHORT,
    description: siteMeta.description || APP_DESCRIPTION,
    // The `id` key is might be unstable on dev environment.
    id: '/',
    start_url: '/',
    lang: DEFAULT_LANG,
    display: 'standalone',
    background_color: '#FFFFFF',
    theme_color: '#FFFFFF',
    icons: [
      {
        src: '/icons/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    orientation: 'portrait',
  }
}
