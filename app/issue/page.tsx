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
          target='_blank'
          className='text-foreground after:bg-foreground relative inline-block transition-all duration-200 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:rounded-full after:transition-transform after:duration-200 hover:after:scale-x-100'
        >
          Report
        </Link>
      </div>
    </>
  )

  return <WithSidebar contentNearby={content} />
}
