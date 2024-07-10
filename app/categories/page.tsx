import type { Metadata } from 'next'

import { NAV_TITLE } from '@/config/constants/navigation'

import ConstructionPlug from '../ui/construction-plug'
import WithSidebar from '../ui/sidebar/with-sidebar'

export const metadata: Metadata = {
  title: NAV_TITLE.CATEGORIES,
}

export default function Page() {
  const content = (
    <>
      <h1 className='mb-4 text-center text-2xl font-bold md:mb-8'>
        {NAV_TITLE.CATEGORIES}
      </h1>
      <div className='mx-auto text-center'>
        <ConstructionPlug pageTitle={NAV_TITLE.CATEGORIES} />
      </div>
    </>
  )

  return <WithSidebar contentNearby={content} />
}
