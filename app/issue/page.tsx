import type { Metadata } from 'next'
import Link from 'next/link'

import { NAV_TITLE } from '@/config/constants/navigation'

import WithSidebar from '../ui/sidebar/with-sidebar'

export const metadata: Metadata = {
  title: NAV_TITLE.ISSUE,
}

export default function Page() {
  const content = (
    <>
      <h1 className='mb-4 text-center text-2xl font-semibold md:mb-8'>
        {NAV_TITLE.ISSUE}
      </h1>
      <div className='mx-auto text-center'>
        <p className='mb-4 text-balance'>
          If you encounter any problems or would like to suggest something,
          please report them on GitHub.
        </p>
        <Link
          href='https://github.com/uigywnkiub/explend-app/issues'
          // hover:shadow-inset-line-dark dark:hover:shadow-inset-line-light
          className='border-b border-foreground pb-1 transition-all duration-200 hover:pb-0.5 hover:opacity-hover'
          target='_blank'
        >
          Report
        </Link>
      </div>
    </>
  )

  return <WithSidebar contentNearby={content} />
}
