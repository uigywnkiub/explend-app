import { Metadata } from 'next'

import { NAV_TITLE } from '@/config/constants/navigation'

import SignIn from '@/app/ui/sign-in/sign-in'

import CustomSpotlight from '../ui/custom-spotlight'
import InstallPWA from '../ui/install-pwa-button'

export const metadata: Metadata = {
  title: NAV_TITLE.SIGNIN,
  description:
    'Sign in to your Explend account to manage your finances effectively.',
}

export default function Page() {
  return (
    <>
      <SignIn />
      <InstallPWA />
      <CustomSpotlight />
    </>
  )
}
