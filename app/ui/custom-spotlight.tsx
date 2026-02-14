import { headers } from 'next/headers'

import { getBrowserName } from '../lib/helpers'
import Spotlight from './spotlight'

export default async function CustomSpotlight() {
  const headersList = await headers()
  const userAgent = headersList.get('user-agent')
  const browser = getBrowserName(userAgent)

  if (browser !== 'Chrome' && browser !== 'Firefox') {
    return null
  }

  return (
    <Spotlight
      className='from-primary-500 via-primary-300 to-primary-100 dark:from-primary-600 dark:via-primary-400 dark:to-primary-200 hidden blur-2xl md:block'
      size={40}
    />
  )
}
