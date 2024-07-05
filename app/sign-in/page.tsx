import type { Metadata } from 'next'

import { NAV_TITLE } from '@/config/constants/navigation'

import SignIn from '@/app/ui/sign-in/sign-in'

export const metadata: Metadata = {
  title: NAV_TITLE.SIGNOUT,
}

export default function Page() {
  return (
    <>
      <SignIn />
    </>
  )
}
