import { Metadata } from 'next'

import { NAV_TITLE } from '@/config/constants/navigation'

import DisabledRoute from '../ui/disabled-route'

export const metadata: Metadata = {
  title: NAV_TITLE.DISABLED_ROUTE,
}

export default async function Page() {
  return <DisabledRoute />
}
