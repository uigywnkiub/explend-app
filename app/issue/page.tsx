import type { Metadata } from 'next'

import { NAV_TITLE } from '@/config/constants/navigation'

import ConstructionPlug from '../ui/construction-plug'
import WithSidebar from '../ui/sidebar/with-sidebar'

export const metadata: Metadata = {
  title: NAV_TITLE.ISSUE,
}

export default function Page() {
  const content = (
    <>
      <h1 className='mb-8 text-center text-2xl font-bold'>{NAV_TITLE.ISSUE}</h1>
      <div className='mx-auto text-center'>
        <ConstructionPlug pageTitle={NAV_TITLE.ISSUE} />
      </div>
    </>
  )

  return <WithSidebar contentNearby={content} />
}
