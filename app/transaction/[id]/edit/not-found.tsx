import Link from 'next/link'

import { ROUTE } from '@/config/constants/routes'

import ClientButton from '@/app/ui/default-button'
import WithSidebar from '@/app/ui/sidebar/with-sidebar'

export default function NotFound() {
  const content = (
    <main className='mx-auto flex h-screen max-w-md flex-col items-center justify-center gap-4 px-4 text-center xs:px-0'>
      <div className='flex flex-col items-center'>
        <p className='text-default-300'>#404NotFound</p>
      </div>
      <h1 className='text-lg font-medium'>
        Could not find the requested transaction.
      </h1>
      <Link href={ROUTE.HOME}>
        <ClientButton
          title='Return home'
          className='max-w-md bg-primary font-medium text-default-50'
        />
      </Link>
    </main>
  )

  return <WithSidebar contentNearby={content} />
}
