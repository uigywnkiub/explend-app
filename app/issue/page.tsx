import type { Metadata } from 'next'
import { Link } from 'next-view-transitions'

import { NAV_TITLE } from '@/config/constants/navigation'

import WithSidebar from '../ui/sidebar/with-sidebar'

export const metadata: Metadata = {
  title: NAV_TITLE.ISSUE,
}

export default function Page() {
  const content = (
    <>
      <h1 className='mb-4 text-center text-2xl font-bold md:mb-8'>
        {NAV_TITLE.ISSUE}
      </h1>
      <div className='mx-auto text-center'>
        <p className='mb-4'>
          If you encounter any problems or would like to suggest something,
          please report them on GitHub.
        </p>
        <Link
          href='https://github.com/uigywnkiub/explend-app/issues'
          className='text-primary underline md:no-underline md:hover:underline'
          target='_blank'
        >
          Report Link ↗
        </Link>
      </div>
    </>
  )

  return <WithSidebar contentNearby={content} />
}
