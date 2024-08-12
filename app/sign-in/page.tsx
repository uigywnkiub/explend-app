import type { Metadata } from 'next'

// import { NAV_TITLE } from '@/config/constants/navigation'
import SignIn from '@/app/ui/sign-in/sign-in'

export const metadata: Metadata = {
  // This title will show on searches as the primary welcome message after app name.
  // Like this - Explend App: Sign In
  // title: NAV_TITLE.SIGNIN,
  title: 'Start Your Financial Wellness Journey',
}

export default function Page() {
  return <SignIn />
}
