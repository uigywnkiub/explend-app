import Link from 'next/link'

import { ROUTE } from '@/config/constants/routes'

import ClientButton from '@/app/ui/client-button'
import InfoText from '@/app/ui/info-text'
import Logo from '@/app/ui/logo'
import WithSidebar from '@/app/ui/sidebar/with-sidebar'

export default function NotFound() {
  const content = (
    <main className='xs:px-0 mx-auto flex h-screen max-w-md flex-col items-center justify-center gap-4 px-4 text-center'>
      <div className='opacity-30 grayscale invert transition-discrete duration-250 hover:invert-50'>
        <Logo size='xs' />
      </div>
      <div className='flex flex-col items-center'>
        <InfoText withAsterisk={false} isMd text='#404NotFound' />
      </div>
      <h1 className='md:text-lg'>Could not find the requested transaction.</h1>
      <Link href={ROUTE.HOME}>
        <ClientButton
          title='Return home'
          color='primary'
          className='text-default-50'
        />
      </Link>
    </main>
  )

  return <WithSidebar contentNearby={content} />
}
