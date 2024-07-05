'use client'

// import type { Metadata } from 'next'

import { NAV_TITLE } from '@/config/constants/navigation'

import Logo from '../ui/logo'

// export const metadata: Metadata = {
//   title: NAV_TITLE.MOBILE_TEMPORARILY_NOT_ALLOWED,
// }

export default function Page() {
  const content = (
    <div className='flex min-h-screen flex-col items-center justify-center p-4'>
      <Logo size='sm' badgeSize='sm' />
      <h1 className='mb-4 mt-4 text-center text-xl font-bold'>
        {NAV_TITLE.MOBILE_TEMPORARILY_NOT_ALLOWED}
      </h1>
      <p className='mx-auto text-center text-sm text-warning'>
        We apologize for the temporary inconvenience, development is underway.
      </p>
    </div>
  )

  return content
}
