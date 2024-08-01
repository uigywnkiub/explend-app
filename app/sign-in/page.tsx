import type { Metadata } from 'next'

import { NAV_TITLE } from '@/config/constants/navigation'

import SignIn from '@/app/ui/sign-in/sign-in'

export const metadata: Metadata = {
  // This title will show on searches as the primary welcome message after app name.
  title: NAV_TITLE.SIGNIN,
}

export default function Page() {
  return <SignIn />
}
