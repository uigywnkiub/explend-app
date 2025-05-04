import SignIn from '@/app/ui/sign-in/sign-in'

import CustomSpotlight from '../ui/custom-spotlight'
import InstallPWA from '../ui/install-pwa-button'

export default function Page() {
  return (
    <>
      <SignIn />
      <InstallPWA />
      <CustomSpotlight />
    </>
  )
}
