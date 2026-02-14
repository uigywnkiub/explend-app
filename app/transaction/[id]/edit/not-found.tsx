import Link from 'next/link'

import { ROUTE } from '@/config/constants/routes'

import ClientButton from '@/app/ui/client-button'
import WithSidebar from '@/app/ui/sidebar/with-sidebar'

export default function NotFound() {
  const content = (
    <main className='xs:px-0 mx-auto flex h-screen max-w-md flex-col items-center justify-center gap-4 px-4 text-center'>
      <div className='flex flex-col items-center'>
        <p className='text-default-500'>#404NotFound</p>
      </div>
      <h1 className='text-lg font-medium'>
        Could not find the requested transaction.
      </h1>
      <Link href={ROUTE.HOME}>
        <ClientButton
          title='Return home'
          className='bg-primary text-default-50 max-w-md font-medium'
        />
      </Link>
    </main>
  )

  return <WithSidebar contentNearby={content} />
}
