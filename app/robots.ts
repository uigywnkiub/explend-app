import { MetadataRoute } from 'next'

import { APP_URL } from '@/config/constants/main'
import { ROUTE } from '@/config/constants/routes'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${APP_URL}${ROUTE.SITEMAP}`,
  }
}
